import React, { useState, useEffect } from 'react';
import { curriculum } from '../../data/curriculumData'; 

export const LockedCoursesSection = ({ upcomingTerm }) => {
  const [lockedCourses, setLockedCourses] = useState([]);
  const [userRecords, setUserRecords] = useState([]);
  const [studentYear, setStudentYear] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track which courses are being petitioned in the current session
  const [submittingIds, setSubmittingIds] = useState(new Set());

  const normalize = (str) => str ? str.toString().trim().toUpperCase() : "";

  // 1. FETCH DATA (Same as before)
  useEffect(() => {
    const fetchFreshData = async () => {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        setIsLoading(false);
        return;
      }
      const currentUser = JSON.parse(currentUserStr);
      setStudentYear(currentUser.yearStanding || 1);

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

  // 🚨 NEW HANDLER: Send Petition to Backend 🚨
  const handlePetition = async (courseId) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Add to "submitting" state to show loading/pending immediately
    setSubmittingIds(prev => new Set(prev).add(courseId));

    try {
      const response = await fetch('http://localhost:5000/api/petitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser.id,
          course_id: courseId
        }),
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

  // 2. THE STRICT ENGINE (Keep your existing logic from previous steps)
  useEffect(() => {
    if (isLoading) return;

    const getCourseStatus = (courseCode) => {
      const record = userRecords.find(r => normalize(r.code) === normalize(courseCode));
      return record ? record.status : null; 
    };

    let highestActiveIndex = -1;
    let hasAnyOngoing = false;
    let totalUnfinishedCourses = 0; 

    curriculum.forEach((term, index) => {
      term.courses.forEach(course => {
        const status = getCourseStatus(course.code);
        if (status === 'passed' || status === 'ongoing') {
          if (index > highestActiveIndex) highestActiveIndex = index;
          if (status === 'ongoing') hasAnyOngoing = true;
        }
        if (index < 7 && status !== 'passed') {
           totalUnfinishedCourses++;
        }
      });
    });

    let targetIndex = -1;
    let seasonKeyword = upcomingTerm === "Summer" ? "Summer" : "1st Semester"; 

    // Find the target term based strictly on the prop
    if (highestActiveIndex === -1) {
      if (upcomingTerm === "Summer") {
        targetIndex = curriculum.findIndex(t => t.semester.includes("Summer"));
        seasonKeyword = "Summer";
      } else {
        targetIndex = 0; 
        seasonKeyword = "1st Semester";
      }
    } else {
      for (let i = highestActiveIndex + 1; i < curriculum.length; i++) {
        const isSummerBlock = curriculum[i].semester.includes("Summer");
        
        if (upcomingTerm === "Summer" && isSummerBlock) {
          targetIndex = i;
          seasonKeyword = "Summer";
          break;
        } else if (upcomingTerm === "Next Semester" && !isSummerBlock) {
          targetIndex = i;
          if (curriculum[i].semester.includes("1st Semester")) seasonKeyword = "1st Semester";
          if (curriculum[i].semester.includes("2nd Semester")) seasonKeyword = "2nd Semester";
          break;
        }
      }
    }

    if (totalUnfinishedCourses === 0 && !hasAnyOngoing && targetIndex < 7) {
      targetIndex = 7;
      seasonKeyword = "2nd Semester";
    } else if (targetIndex === -1) {
      targetIndex = highestActiveIndex > -1 ? highestActiveIndex : 0;
    }

    let tempCourseStates = {};

    curriculum.forEach((term, termIndex) => {
      term.courses.forEach(course => {
        const currentStatus = getCourseStatus(course.code);
        if (currentStatus === 'passed' || currentStatus === 'ongoing') return;

        let prereqsMet = true;
        let isAssumed = hasAnyOngoing; 
        let missingReasons = [];

        if (course.prereq) {
          const prereqList = course.prereq.split(',').map(p => p.trim());
          
          for (let originalCode of prereqList) {
            const normalizedCode = normalize(originalCode);

            if (normalizedCode.includes("YEAR")) {
              const requiredYear = parseInt(normalizedCode); 
              if (studentYear < requiredYear) {
                if (hasAnyOngoing && (studentYear + 1 >= requiredYear)) {
                  isAssumed = true;
                } else {
                  prereqsMet = false;
                  missingReasons.push(originalCode);
                }
              }
            } 
            else if (normalizedCode.includes("BEHIND")) {
              if (totalUnfinishedCourses > 0) {
                prereqsMet = false;
                missingReasons.push("Remaining Subjects");
              } else if (hasAnyOngoing) {
                isAssumed = true;
              }
            } 
            else {
              const prereqStatus = getCourseStatus(normalizedCode);
              if (prereqStatus === 'passed') {
                // Good
              } else if (prereqStatus === 'ongoing') {
                isAssumed = true; 
              } else {
                prereqsMet = false;
                missingReasons.push(originalCode); 
              }
            }
          }
        }

        let finalState = 'Secured';
        if (!prereqsMet) finalState = 'Locked';
        else if (isAssumed) finalState = 'Assumed';

        tempCourseStates[normalize(course.code)] = {
          id: course.id,
          code: course.code,
          name: course.title,
          semester: term.semester,
          termIndex: termIndex,
          units: `${course.units} Units`, 
          unlockState: finalState,
          missingReasons: missingReasons,
          coreq: course.coreq
        };
      });
    });

    Object.keys(tempCourseStates).forEach(courseKey => {
      const courseObj = tempCourseStates[courseKey];
      if (courseObj.unlockState === 'Locked') return;

      if (courseObj.coreq) {
        const coreqList = courseObj.coreq.split(',').map(c => c.trim());
        for (let originalCoreq of coreqList) {
          const normalizedCoreq = normalize(originalCoreq);
          const coreqDbStatus = getCourseStatus(normalizedCoreq);

          if (coreqDbStatus === 'passed') {
            // Coreq is fine
          } else if (coreqDbStatus === 'ongoing') {
            courseObj.unlockState = 'Assumed';
          } else {
            const futureCoreq = tempCourseStates[normalizedCoreq];
            if (!futureCoreq || futureCoreq.unlockState === 'Locked') {
              courseObj.unlockState = 'Locked';
              courseObj.missingReasons.push(`${originalCoreq} (Coreq)`);
            } else if (futureCoreq.unlockState === 'Assumed') {
              courseObj.unlockState = 'Assumed';
            }
          }
        }
      }
    });

    const finalLockedCourses = Object.values(tempCourseStates)
      .filter(course => 
        course.unlockState === 'Locked' && 
        course.termIndex <= targetIndex && 
        course.semester.includes(seasonKeyword) 
      )
      .map(course => ({
        ...course,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lockedCourses.map((course) => (
            /* We increase the height slightly to h-44 to accommodate the new button */
            <div key={course.id} className="bg-gray-100/80 rounded-xl border border-gray-300 p-4 flex flex-col h-44 justify-between shadow-sm relative overflow-hidden grayscale-[30%]">
              
              <div className="absolute top-3 right-3 bg-red-100/50 border border-red-300 px-2 py-0.5 rounded text-red-600 text-[10px] font-bold font-['Inter'] uppercase flex items-center gap-1">
                <span>🔒</span> Locked
              </div>

              <div className="flex flex-col pr-16 mt-1">
                <p className="text-[11px] font-bold font-['Inter'] uppercase tracking-wider text-black/50 leading-none">{course.semester}</p>
                <h3 className="text-xl font-bold font-['Calistoga'] leading-none mt-1.5 text-[#003366]/60">{course.code}</h3>
                <p className="text-sm font-medium font-['Inter'] leading-snug mt-1.5 line-clamp-1 text-black/60">{course.name}</p>
              </div>
              
              {/* PETITION BUTTON AREA */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-300">
                {submittingIds.has(course.id) ? (
                  <button disabled className="bg-amber-100 text-amber-600 border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-bold font['Inter'] flex items-center gap-1.5">
                    ⏳ Petition Pending
                  </button>
                ) : (
                  <button 
                    onClick={() => handlePetition(course.id)}
                    className="bg-[#FFCC00] hover:bg-[#E6B800] text-[#001A33] rounded-lg px-3 py-1.5 text-xs font-bold font-['Inter'] transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    📝 Petition Course
                  </button>
                )}

                <div className="bg-gray-400 text-white rounded-lg px-2 py-1 text-[10px] font-bold font-['Inter']">
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