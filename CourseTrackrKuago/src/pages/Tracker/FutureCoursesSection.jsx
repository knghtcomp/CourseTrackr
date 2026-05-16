import React, { useState, useEffect } from 'react';
import { curriculum } from '../../data/curriculumData';

export const FutureCoursesSection = () => {
  const [eligibleCourses, setEligibleCourses] = useState([]);
  const [upcomingTerm, setUpcomingTerm] = useState("Next Semester"); 
  const [userRecords, setUserRecords] = useState([]);
  const [studentYear, setStudentYear] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // 🚨 THE FIX 1: Re-added the Space Stripper so "CPE 111" perfectly matches "CPE111"
  const normalize = (str) => str ? str.toString().trim().toUpperCase().replace(/\s+/g, '') : "";

  // 1. FETCH DATA & AUTO-DETECT TERM
  useEffect(() => {
    const fetchFreshData = async () => {
      const currentUserStr = localStorage.getItem('studentUser');
      if (!currentUserStr) {
        setIsLoading(false);
        return;
      }
      const currentUser = JSON.parse(currentUserStr);
      setStudentYear(currentUser.yearStanding || 1);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student-records/${currentUser.id}`);
        if (response.ok) {
          const freshRecords = await response.json();
          setUserRecords(freshRecords);

          let highestIndex = -1;
          curriculum.forEach((term, index) => {
            term.courses.forEach(course => {
              // Quick check using the dual-lookup logic for the auto-scroller
              const baseCode = normalize(course.code);
              const petitionCode = baseCode + "01";
              
              const record = freshRecords.find(r => {
                const rCode = normalize(r.code);
                return rCode === baseCode || rCode === petitionCode;
              });

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

    // 🚨 THE FIX 2: Dual-Lookup Engine
    // This forces the scanner to treat "CPE 111 01" exactly the same as "CPE 111"
    const getCourseStatus = (courseCode) => {
      const baseCode = normalize(courseCode);
      const petitionCode = baseCode + "01"; // Automatically targets the petitioned version

      const record = userRecords.find(r => {
        const recordCode = normalize(r.code);
        return recordCode === baseCode || recordCode === petitionCode;
      });
      
      return record ? record.status.toLowerCase() : null; 
    };

    let highestActiveIndex = -1;
    let hasAnyOngoing = false;
    let totalUnfinishedCourses = 0; 

    // Map out where the student currently is in the curriculum
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
              const requiredYear = parseInt(prereqCode.replace(/\D/g, '')); 
              if (studentYear < requiredYear) {
                if (hasAnyOngoing && (studentYear + 1 >= requiredYear)) {
                  isAssumed = true;
                } else {
                  prereqsMet = false; 
                }
              }
            } 
            else if (prereqCode.includes("BEHIND")) {
               if (totalUnfinishedCourses > 0) {
                 prereqsMet = false;
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
    // MOBILE FIX: Tightened the main gap slightly on phones
    <section className="flex flex-col gap-4 md:gap-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div className="flex flex-col gap-0.5 md:gap-1">
          {/* MOBILE FIX: Scaled down text and tightened line height */}
          <h2 className="text-[#003366] text-xl md:text-2xl lg:text-3xl font-bold font-['Calistoga'] m-0 leading-tight">
            Course Suggestions
          </h2>
          <p className="text-[#003366]/70 text-sm md:text-[16px] italic font-['Calistoga'] m-0 leading-snug">
            Based on your standing, here are your next available subjects.
          </p>
        </div>
        
        {/* REPLACED GREEN WITH BLUE (#003366) FOR ACTIVE TOGGLE */}
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-[#003366] text-sm font-bold font-['Inter'] uppercase tracking-wider">
            Offered:
          </span>
          <div className="flex bg-[#E9EBEF] rounded-full p-1 w-full md:w-fit shrink-0">
            {['Next Semester', 'Summer'].map((term) => (
              <button
                key={term}
                onClick={() => setUpcomingTerm(term)}
                // MOBILE FIX: Scaled text down to xs on phones so the buttons fit perfectly
                className={`flex-1 md:flex-none px-3 md:px-5 py-1.5 text-xs md:text-sm font-bold font-['Inter'] rounded-full transition-all whitespace-nowrap ${
                  upcomingTerm === term 
                    ? 'bg-[#003366] text-white shadow-md' 
                    : 'text-[#003366] hover:bg-black/5'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="w-full bg-white rounded-2xl md:rounded-3xl border border-black/10 p-6 md:p-10 text-center shadow-sm">
          <p className="text-gray-500 font-medium font-['Inter'] animate-pulse text-sm md:text-base">Checking credentials...</p>
        </div>
      ) : eligibleCourses.length === 0 ? (
        <div className="w-full bg-white rounded-2xl md:rounded-3xl border border-black/10 p-6 md:p-10 text-center shadow-sm">
          <p className="text-gray-500 font-medium font-['Inter'] text-sm md:text-base">
            No eligible courses available for the {upcomingTerm}. 
          </p>
        </div>
      ) : (
        // MOBILE FIX: Tightened the grid gap on mobile
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {eligibleCourses.map((course, idx) => (
            <div 
              key={idx} 
              // MOBILE FIX: Swapped min-h-[140px] for h-fit so the card perfectly shrinks to fit the content on phones, while keeping the fixed h-36 on desktops
              className="bg-[#E0F2FE] rounded-xl border border-[#003366]/20 p-3 md:p-4 flex flex-col h-fit md:h-36 justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* TOP RIGHT: Status Badge + Units Stacked */}
              <div className="absolute top-2.5 right-2.5 md:top-3 md:right-3 flex flex-col items-end gap-1 md:gap-1.5 z-10">
                {course.unlockState === 'Secured' && (
                  <div className="bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-0.5 md:px-2.5 rounded text-[#10B981] text-[9px] md:text-[10px] font-bold font-['Inter'] uppercase flex items-center gap-1">
                    <span>✓</span> Secured
                  </div>
                )}
                {course.unlockState === 'Assumed' && (
                  <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-2 py-0.5 md:px-2.5 rounded text-[#F59E0B] text-[9px] md:text-[10px] font-bold font-['Inter'] uppercase flex items-center gap-1">
                    <span>⏳</span> Presumed
                  </div>
                )}
                <div className="bg-[#003366] text-white rounded-md md:rounded-lg px-2 py-0.5 md:px-3 md:py-1 w-fit shadow-sm text-[10px] md:text-xs font-bold font-['Inter']">
                  {course.units} Units
                </div>
              </div>
              
              <div className="flex flex-col pr-16 md:pr-24 relative z-0">
                <p className="text-[10px] md:text-[11px] font-bold font-['Inter'] uppercase tracking-wider text-[#003366]/70 leading-none">
                  {course.semesterLabel}
                </p>
                {/* MOBILE FIX: Shrunk the gap above the code */}
                <h3 className="text-lg md:text-xl font-bold font-['Calistoga'] leading-none mt-1 text-[#003366]">
                  {course.code}
                </h3>
                {/* MOBILE FIX: Tightened the line-height and margin above the title to save vertical space */}
                <p className="text-[11px] md:text-sm font-medium font-['Inter'] leading-tight mt-1 line-clamp-2 text-black/80">
                  {course.title}
                </p>
              </div>
              
              {/* BOTTOM: Prerequisite Courses */}
              {/* MOBILE FIX: Tightened the top margin (mt-2 md:mt-auto) so it stays compact */}
              <div className="mt-2 md:mt-auto flex items-center gap-1.5 text-[#003366] text-[10px] md:text-xs font-bold font-['Inter']">
                <span className="bg-[#10B981]/20 text-[#10B981] rounded-full w-3.5 h-3.5 md:w-4 md:h-4 flex items-center justify-center text-[8px] md:text-[10px] shrink-0">✓</span> 
                <span className="truncate" title={course.prereq ? `Prereqs: ${course.prereq}` : 'No prerequisites'}>
                  {course.prereq || 'No prerequisites'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}; 

export default FutureCoursesSection;