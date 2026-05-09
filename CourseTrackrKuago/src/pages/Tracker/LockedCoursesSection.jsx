import React, { useState, useEffect } from 'react';
import { curriculum } from '../../data/curriculumData'; 

export const LockedCoursesSection = ({ upcomingTerm }) => {
  const [lockedCourses, setLockedCourses] = useState([]);
  const [userRecords, setUserRecords] = useState([]);
  const [studentYear, setStudentYear] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track which courses are being petitioned in the current session
  const [submittingIds, setSubmittingIds] = useState(new Set());

  // 🚨 FIX 1: The "Space Stripper" - This forces "CPE 111" and "CPE111" to match perfectly
  const normalize = (str) => str ? str.toString().trim().toUpperCase().replace(/\s+/g, '') : "";

  // 1. FETCH DATA
  useEffect(() => {
    const fetchFreshData = async () => {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        setIsLoading(false);
        return;
      }
      const currentUser = JSON.parse(currentUserStr);
      
      // 🚨 FIX 2: Force the year to be a mathematical Number, not a string
      setStudentYear(Number(currentUser.yearStanding || currentUser.year_standing) || 1);

      try {
        const response = await fetch(`http://localhost:5000/api/student-records/${currentUser.id}`);
        if (response.ok) {
          const freshRecords = await response.json();
          setUserRecords(freshRecords);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFreshData();
  }, []);

  // HANDLER: Send Petition to Backend
  const handlePetition = async (courseId) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    setSubmittingIds(prev => new Set(prev).add(courseId));

    try {
      const response = await fetch('http://localhost:5000/api/petitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: currentUser.id, course_id: courseId }),
      });

      if (response.ok) {
        alert("Petition submitted successfully!");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to submit petition.");
      }
    } catch (error) {
      console.error("Petition Error:", error);
      alert("Error connecting to server.");
    }
  };

  // 2. THE BULLETPROOF ENGINE
  useEffect(() => {
    if (isLoading) return;

    const getCourseStatus = (courseCode) => {
      const record = userRecords.find(r => normalize(r.code) === normalize(courseCode));
      // Normalize 'FAILED' / 'failed' just to be safe
      return record && record.status ? record.status.toLowerCase() : null; 
    };

    // Determine the max boundary the student is allowed to look at based on their year
    const numberPrefix = studentYear === 1 ? '1st' : studentYear === 2 ? '2nd' : studentYear === 3 ? '3rd' : '4th';
    let maxAllowedIndex = curriculum.length - 1;
    
    for (let i = curriculum.length - 1; i >= 0; i--) {
      if (curriculum[i].semester.toLowerCase().includes(`${numberPrefix} year`)) {
        maxAllowedIndex = i;
        if (i + 1 < curriculum.length && curriculum[i + 1].semester.includes("Summer")) {
          maxAllowedIndex = i + 1;
        }
        break;
      }
    }

    let currentActiveIndex = -1;
    let hasAnyOngoing = false;
    let totalUnfinishedCourses = 0; 

    // Find exactly where the student currently is
    curriculum.forEach((term, index) => {
      term.courses.forEach(course => {
        const status = getCourseStatus(course.code);
        
        // If they have ANY record (even 'failed'), we know they reached this semester
        if (status) {
          if (index > currentActiveIndex && index <= maxAllowedIndex) {
            currentActiveIndex = index;
          }
          if (status === 'ongoing') hasAnyOngoing = true;
        }

        if (index < 7 && status !== 'passed') {
           totalUnfinishedCourses++;
        }
      });
    });

    // Determine target keyword based on UI Dropdown
    // 🚨 FIX 1: Find the exact Target Array Index (No more text-keyword guessing!)
    let targetIndex = currentActiveIndex === -1 ? 0 : currentActiveIndex + 1;

    // Keep it within bounds
    if (targetIndex >= curriculum.length) {
      targetIndex = curriculum.length - 1;
    }

    // Handle "Summer" vs "Next Semester" strictly by skipping or finding blocks
    if (upcomingTerm === "Summer") {
      const nextSummer = curriculum.findIndex((t, i) => i >= currentActiveIndex && t.semester.includes("Summer"));
      if (nextSummer !== -1) targetIndex = nextSummer;
    } 
    else if (upcomingTerm === "Next Semester" && curriculum[targetIndex].semester.includes("Summer")) {
      // If they want a regular semester but the next block is Summer, skip over the Summer block
      if (targetIndex + 1 < curriculum.length) targetIndex += 1;
    }

    let tempCourseStates = {};
    
    // --- PASS 1: Prerequisite Evaluation ---
    curriculum.forEach((term, termIndex) => {
      term.courses.forEach(course => {
        const currentStatus = getCourseStatus(course.code);
        if (currentStatus === 'passed' || currentStatus === 'ongoing') return;

        let prereqsMet = true;
        let isAssumed = hasAnyOngoing; 
        let missingReasons = [];

        if (course.prereq) {
          const prereqList = course.prereq.split(',').map(p => normalize(p));
          
          for (let prereqCode of prereqList) {
            if (prereqCode.includes("YEAR")) {
              const requiredYear = parseInt(prereqCode.replace(/\D/g, '')); 
              if (studentYear < requiredYear) {
                if (hasAnyOngoing && (studentYear + 1 >= requiredYear)) {
                  isAssumed = true;
                } else {
                  prereqsMet = false; 
                  missingReasons.push(prereqCode);
                }
              }
            } 
            else if (prereqCode.includes("BEHIND")) {
               if (totalUnfinishedCourses > 0) {
                 prereqsMet = false;
                 missingReasons.push("Remaining Subjects");
               } else if (hasAnyOngoing) {
                 isAssumed = true;
               }
            }
            else {
              const prereqStatus = getCourseStatus(prereqCode);
              if (prereqStatus === 'passed') {
                // Good
              } else if (prereqStatus === 'ongoing') {
                isAssumed = true; 
              } else {
                prereqsMet = false; 
                missingReasons.push(course.prereq.split(',').find(p => normalize(p) === prereqCode) || prereqCode);
              }
            }
          }
        }

        let finalState = 'Secured';
        if (!prereqsMet) finalState = 'Locked';
        else if (isAssumed) finalState = 'Assumed';

        tempCourseStates[normalize(course.code)] = {
          ...course,
          id: course.id,
          code: course.code,
          name: course.title,
          semesterLabel: term.semester,
          termIndex: termIndex,
          units: `${course.units}`,
          unlockState: finalState,
          missingReasons: missingReasons,
          coreq: course.coreq
        };
      });
    });

    // --- PASS 2: Corequisite Evaluation ---
    Object.keys(tempCourseStates).forEach(courseKey => {
      const courseObj = tempCourseStates[courseKey];
      if (courseObj.unlockState === 'Locked') return;

      if (courseObj.coreq) {
        const coreqList = courseObj.coreq.split(',').map(c => normalize(c));

        for (let coreqCode of coreqList) {
          const coreqDbStatus = getCourseStatus(coreqCode);

          if (coreqDbStatus === 'passed') {
            // Good
          } else if (coreqDbStatus === 'ongoing') {
            courseObj.unlockState = 'Assumed';
          } else {
            const futureCoreq = tempCourseStates[coreqCode];
            if (!futureCoreq || futureCoreq.unlockState === 'Locked') {
              courseObj.unlockState = 'Locked';
              courseObj.missingReasons.push(`${coreqCode} (Coreq)`);
            } else if (futureCoreq.unlockState === 'Assumed') {
              courseObj.unlockState = 'Assumed';
            }
          }
        }
      }
    });

    // 🚨 FIX 2: THE ULTIMATE UI FILTER 
    // Mathematically isolates the exact array index (zero text guessing!)
    const processedCourses = Object.values(tempCourseStates);

    const finalLockedCourses = processedCourses
      .filter(course => 
        course.unlockState === 'Locked' && 
        course.termIndex === targetIndex 
      )
      .map(course => ({
        ...course,
        semester: course.semesterLabel, 
        missingPrereq: course.missingReasons.join(', ')
      }));

    setLockedCourses(finalLockedCourses);
  }, [userRecords, upcomingTerm, studentYear, isLoading]);

  if (isLoading) return <div className="p-10 text-center animate-pulse">Scanning prerequisites...</div>;

  return (
    <section className="flex flex-col gap-6 w-full mt-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[#003366] text-2xl lg:text-3xl font-bold font-['Calistoga'] m-0">Locked Courses</h2>
        <p className="text-[#003366]/70 text-[16px] italic font-['Calistoga'] m-0">These courses require prerequisites that you haven't completed yet.</p>
      </div>
      
      {lockedCourses.length === 0 ? (
        <div className="w-full bg-white rounded-3xl border border-black/10 p-10 text-center shadow-sm">
          <p className="text-[#10B981] font-bold font-['Inter']">🎉 No locked courses for your upcoming term!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lockedCourses.map((course) => (
            <div 
              key={course.id} 
              className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-3 flex flex-col justify-between shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] relative overflow-hidden transition-all hover:border-red-200 hover:bg-red-50/10 group"
            >
              
              {/* Sleek Lock Badge */}
              <div className="absolute top-2.5 right-2.5 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded text-red-500 text-[9px] font-bold font-['Inter'] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <span>🔒</span> Locked
              </div>

              {/* Course Identity */}
              <div className="flex flex-col pr-14 mb-2">
                <p className="text-[9px] font-extrabold font-['Inter'] uppercase tracking-widest text-black/40 mb-0.5">
                  {course.semester}
                </p>
                <h3 className="text-lg font-bold font-['Calistoga'] leading-none text-red-500 group-hover:text-red-400 transition-colors">
                  {course.code}
                </h3>
                <p className="text-xs font-medium font-['Inter'] leading-tight mt-1 line-clamp-1 text-gray-700">
                  {course.name}
                </p>
              </div>
              
              {/* PREREQUISITES & COREQUISITES AREA */}
              <div className="flex flex-col gap-0.5 mb-2 mt-auto">
                {course.missingPrereq && (
                  <p 
                    className="text-[10px] font-medium font-['Inter'] text-red-500 leading-tight line-clamp-1"
                    title={course.missingPrereq}
                  >
                    <span className="font-bold">Pre:</span> {course.missingPrereq}
                  </p>
                )}
                
                {course.coreq && course.coreq.toLowerCase() !== 'none' && (
                  <p 
                    className="text-[10px] font-medium font-['Inter'] text-orange-500 leading-tight line-clamp-1"
                    title={course.coreq}
                  >
                    <span className="font-bold">Co:</span> {course.coreq}
                  </p>
                )}
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-[9px] font-medium font-['Inter'] text-gray-400 italic">
                  Complete reqs to unlock
                </span>
                <div className="bg-black/5 text-black/60 rounded px-1.5 py-0.5 text-[9px] font-bold font-['Inter'] tracking-wide uppercase">
                  {course.units}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default LockedCoursesSection;