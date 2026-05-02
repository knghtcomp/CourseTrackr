import React, { useState, useEffect } from 'react';
import { curriculum } from '../../data/curriculumData'; 

export const FutureCoursesSection = () => {
  const [eligibleCourses, setEligibleCourses] = useState([]);
  const [upcomingTerm, setUpcomingTerm] = useState("Next Semester"); 
  const [userRecords, setUserRecords] = useState([]);
  const [studentYear, setStudentYear] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const normalize = (str) => str ? str.toString().trim().toUpperCase() : "";

  // 1. FETCH DATA & AUTO-DETECT TERM
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

          let highestIndex = -1;
          curriculum.forEach((term, index) => {
            term.courses.forEach(course => {
              const record = freshRecords.find(r => normalize(r.code) === normalize(course.code));
              if (record && (record.status === 'passed' || record.status === 'ongoing')) {
                if (index > highestIndex) highestIndex = index;
              }
            });
          });

          if (highestIndex >= 0 && highestIndex + 1 < curriculum.length) {
            const nextBlockLabel = curriculum[highestIndex + 1].semester;
            if (nextBlockLabel.includes("Summer")) {
              setUpcomingTerm("Summer");
            } else {
              setUpcomingTerm("Next Semester");
            }
          }
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFreshData();
  }, []);

  // 2. THE STRICT TWO-PASS ENGINE
  useEffect(() => {
    if (isLoading) return;

    const getCourseStatus = (courseCode) => {
      const record = userRecords.find(r => normalize(r.code) === normalize(courseCode));
      return record ? record.status : null; 
    };

    let highestActiveIndex = -1;
    let hasAnyOngoing = false;
    let totalUnfinishedCourses = 0; // Tracks if the student has "No Subjects Behind"

    // Map out where the student currently is in the curriculum
    curriculum.forEach((term, index) => {
      term.courses.forEach(course => {
        const status = getCourseStatus(course.code);
        
        if (status === 'passed' || status === 'ongoing') {
          if (index > highestActiveIndex) highestActiveIndex = index;
          if (status === 'ongoing') hasAnyOngoing = true;
        }

        // Count unfinished courses (anything not explicitly 'passed')
        // We exclude the final OJT block (index 7) from this count.
        if (index < 7 && status !== 'passed') {
           totalUnfinishedCourses++;
        }
      });
    });

    let targetIndex = -1;
    let seasonKeyword = upcomingTerm === "Summer" ? "Summer" : "1st Semester"; 

    // Target Term Finder
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
          // Handle specific semester keywords
          if (curriculum[i].semester.includes("1st Semester")) seasonKeyword = "1st Semester";
          if (curriculum[i].semester.includes("2nd Semester")) seasonKeyword = "2nd Semester";
          break;
        }
      }
    }

    // THE OJT FIX: If the target index somehow didn't catch the final block, 
    // but the student has no subjects behind, force the target index to the final block.
    if (totalUnfinishedCourses === 0 && !hasAnyOngoing && targetIndex < 7) {
      targetIndex = 7;
      seasonKeyword = "2nd Semester";
    } else if (targetIndex === -1) {
      targetIndex = highestActiveIndex > -1 ? highestActiveIndex : 0;
    }

    let tempCourseStates = {};
    
    // --- PASS 1: Strict Prerequisite Evaluation ---
    curriculum.forEach((term, termIndex) => {
      term.courses.forEach(course => {
        const currentStatus = getCourseStatus(course.code);
        if (currentStatus === 'passed' || currentStatus === 'ongoing') return;

        let prereqsMet = true;
        let isAssumed = hasAnyOngoing; 

        if (course.prereq) {
          const prereqList = course.prereq.split(',').map(p => normalize(p));
          
          for (let prereqCode of prereqList) {
            
            if (prereqCode.includes("YEAR")) {
              const requiredYear = parseInt(prereqCode); 
              if (studentYear < requiredYear) {
                if (hasAnyOngoing && (studentYear + 1 >= requiredYear)) {
                  isAssumed = true;
                } else {
                  prereqsMet = false; 
                }
              }
            } 
            // 🚨 THE CRITICAL OJT FIX: Handling "No Subjects Behind"
            else if (prereqCode.includes("BEHIND")) {
               // If there is even a single course not passed (or if they are currently ongoing), OJT is locked.
               if (totalUnfinishedCourses > 0) {
                 prereqsMet = false;
               } else if (hasAnyOngoing) {
                 isAssumed = true;
               }
            }
            // Normal code check
            else {
              const prereqStatus = getCourseStatus(prereqCode);

              if (prereqStatus === 'passed') {
                // Good
              } else if (prereqStatus === 'ongoing') {
                isAssumed = true; 
              } else {
                prereqsMet = false; 
              }
            }
          }
        }

        let finalState = 'Secured';
        if (!prereqsMet) finalState = 'Locked';
        else if (isAssumed) finalState = 'Assumed';

        tempCourseStates[normalize(course.code)] = {
          ...course,
          semesterLabel: term.semester,
          termIndex: termIndex,
          unlockState: finalState
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
            // Coreq is already finished
          } else if (coreqDbStatus === 'ongoing') {
            courseObj.unlockState = 'Assumed';
          } else {
            const futureCoreq = tempCourseStates[coreqCode];
            if (!futureCoreq || futureCoreq.unlockState === 'Locked') {
              courseObj.unlockState = 'Locked';
            } else if (futureCoreq.unlockState === 'Assumed') {
              courseObj.unlockState = 'Assumed';
            }
          }
        }
      }
    });

    // --- FINAL UI FILTER ---
    const processedCourses = Object.values(tempCourseStates);

    const filtered = processedCourses.filter(course => {
      return (
        course.unlockState !== 'Locked' && 
        course.termIndex <= targetIndex && 
        course.semesterLabel.includes(seasonKeyword) 
      );
    });

    setEligibleCourses(filtered);
  }, [userRecords, upcomingTerm, studentYear, isLoading]);

  return (
    <section className="flex flex-col gap-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[#003366] text-2xl lg:text-3xl font-bold font-['Calistoga'] m-0">
            Course Suggestions
          </h2>
          <p className="text-[#003366]/70 text-[16px] italic font-['Calistoga'] m-0">
            Based on your standing, here are your next available subjects.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[#003366] text-sm font-bold font-['Inter'] uppercase tracking-wider">
            Offered:
          </span>
          <select 
            value={upcomingTerm}
            onChange={(e) => setUpcomingTerm(e.target.value)}
            className="px-3 py-1.5 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 font-bold font-['Inter'] rounded-lg text-sm uppercase tracking-wider cursor-pointer focus:outline-none"
          >
            <option value="Next Semester">Next Semester</option>
            <option value="Summer">Summer</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="w-full bg-white rounded-3xl border border-black/10 p-10 text-center shadow-sm">
          <p className="text-gray-500 font-medium font-['Inter'] animate-pulse">Checking credentials...</p>
        </div>
      ) : eligibleCourses.length === 0 ? (
        <div className="w-full bg-white rounded-3xl border border-black/10 p-10 text-center shadow-sm">
          <p className="text-gray-500 font-medium font-['Inter']">
            No eligible courses available for the {upcomingTerm}. 
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {eligibleCourses.map((course, idx) => (
            <div 
              key={idx} 
              className="bg-[#E0F2FE] rounded-xl border border-[#003366]/20 p-4 flex flex-col h-36 justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {course.unlockState === 'Secured' && (
                <div className="absolute top-3 right-3 bg-[#10B981]/10 border border-[#10B981]/30 px-2.5 py-0.5 rounded text-[#10B981] text-[10px] font-bold font-['Inter'] uppercase flex items-center gap-1">
                  <span>✓</span> Secured
                </div>
              )}
              {course.unlockState === 'Assumed' && (
                <div className="absolute top-3 right-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-2.5 py-0.5 rounded text-[#F59E0B] text-[10px] font-bold font-['Inter'] uppercase flex items-center gap-1">
                  <span>⏳</span> Assumed
                </div>
              )}
              
              <div className="flex flex-col pr-16 mt-1">
                <p className="text-[11px] font-bold font-['Inter'] uppercase tracking-wider text-[#003366]/70 leading-none">
                  {course.semesterLabel}
                </p>
                <h3 className="text-xl font-bold font-['Calistoga'] leading-none mt-1.5 text-[#003366]">
                  {course.code}
                </h3>
                <p className="text-sm font-medium font-['Inter'] leading-snug mt-1.5 line-clamp-2 text-black/80">
                  {course.title}
                </p>
              </div>
              
              <div className="bg-[#003366] text-white rounded-lg px-3 py-1 w-fit mt-auto shadow-sm text-xs font-bold font-['Inter']">
                {course.units} Units
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}; 

export default FutureCoursesSection;