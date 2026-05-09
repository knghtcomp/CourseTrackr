import React, { useState, useEffect } from 'react';
import { curriculum } from '../../data/curriculumData'; 

export const LockedCoursesSection = ({ upcomingTerm }) => {
  const [lockedCourses, setLockedCourses] = useState([]);
  const [userRecords, setUserRecords] = useState([]);
  const [studentYear, setStudentYear] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
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
  }, [upcomingTerm]);

  // 2. THE EXACT MIRROR OF FUTURE COURSES ENGINE
  useEffect(() => {
    if (isLoading) return;

    const getCourseStatus = (courseCode) => {
      const baseCode = normalize(courseCode);
      const petitionCode = baseCode + "01"; 
      const record = userRecords.find(r => {
        const recordCode = normalize(r.code);
        return recordCode === baseCode || recordCode === petitionCode;
      });
      return record && record.status ? record.status.toLowerCase() : null; 
    };

    let hasAnyOngoing = false;
    let totalUnfinishedCourses = 0; 

    curriculum.forEach((term, index) => {
      term.courses.forEach(course => {
        const status = getCourseStatus(course.code);
        if (status === 'ongoing') hasAnyOngoing = true;
        if (index < 7 && status !== 'passed') {
           totalUnfinishedCourses++;
        }
      });
    });

    // 🚨 100% SYNCED TARGET FINDER (Identical to Future Courses)
    const yearNumberPrefix = studentYear === 1 ? '1st' : studentYear === 2 ? '2nd' : studentYear === 3 ? '3rd' : '4th';
    
    let targetTermIndex = 0;
    
    if (upcomingTerm === "Summer") {
      const summerIndex = curriculum.findIndex(t => t.semester.includes(`${yearNumberPrefix} Year`) && t.semester.includes("Summer"));
      targetTermIndex = summerIndex !== -1 ? summerIndex : 0;
    } else {
      const firstSemIndex = curriculum.findIndex(t => t.semester.includes(`${yearNumberPrefix} Year`) && t.semester.includes("1st Semester"));
      const secondSemIndex = curriculum.findIndex(t => t.semester.includes(`${yearNumberPrefix} Year`) && t.semester.includes("2nd Semester"));

      let firstSemDone = true;
      if (firstSemIndex !== -1) {
        curriculum[firstSemIndex].courses.forEach(c => {
          const status = getCourseStatus(c.code);
          if (status !== 'passed' && status !== 'ongoing') {
            firstSemDone = false;
          }
        });
      }

      // If 1st Sem isn't done, lock firmly onto 1st Sem.
      if (firstSemIndex !== -1 && !firstSemDone) {
        targetTermIndex = firstSemIndex;
      } else if (secondSemIndex !== -1) {
        targetTermIndex = secondSemIndex;
      }
    }

    let tempCourseStates = {};
    
    // --- PASS 1: Strict Prerequisite Evaluation (Identical to Future Courses) ---
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
          semesterLabel: term.semester,
          termIndex: termIndex,
          unlockState: finalState,
          missingPrereq: missingReasons.join(', ') 
        };
      });
    });

    // --- PASS 2: Corequisite Evaluation (Identical to Future Courses) ---
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
              courseObj.missingPrereq = courseObj.missingPrereq 
                ? `${courseObj.missingPrereq}, ${coreqCode} (Co)`
                : `${coreqCode} (Co)`;
            } else if (futureCoreq.unlockState === 'Assumed') {
              courseObj.unlockState = 'Assumed';
            }
          }
        }
      }
    });

    // 🚨 THE NEGATION (This is where we do what you asked)
    const processedCourses = Object.values(tempCourseStates);

    const finalLockedCourses = processedCourses.filter(course => {
      // 1. Must be evaluating as 'Locked'
      if (course.unlockState !== 'Locked') return false;
      
      // 2. Include ALL locked courses from previous semesters UP TO the exact target semester Future Courses is showing
      return course.termIndex <= targetTermIndex;
    });

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
              key={course.id || course.code} 
              className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-3 flex flex-col justify-between shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] relative overflow-hidden transition-all hover:border-red-200 hover:bg-red-50/10 group"
            >
              <div className="absolute top-2.5 right-2.5 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded text-red-500 text-[9px] font-bold font-['Inter'] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <span>🔒</span> Locked
              </div>

              <div className="flex flex-col pr-14 mb-2">
                <p className="text-[9px] font-extrabold font-['Inter'] uppercase tracking-widest text-black/40 mb-0.5">
                  {course.semesterLabel}
                </p>
                <h3 className="text-lg font-bold font-['Calistoga'] leading-none text-red-500 group-hover:text-red-400 transition-colors">
                  {course.code}
                </h3>
                <p className="text-xs font-medium font-['Inter'] leading-tight mt-1 line-clamp-1 text-gray-700">
                  {course.title || course.name}
                </p>
              </div>
              
              <div className="flex flex-col gap-0.5 mb-2 mt-auto">
                {course.missingPrereq && (
                  <p 
                    className="text-[10px] font-medium font-['Inter'] text-red-500 leading-tight line-clamp-2"
                    title={course.missingPrereq}
                  >
                    <span className="font-bold">Missing:</span> {course.missingPrereq}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-[9px] font-medium font-['Inter'] text-gray-400 italic">
                  Complete reqs to unlock
                </span>
                <div className="bg-black/5 text-black/60 rounded px-1.5 py-0.5 text-[9px] font-bold font-['Inter'] tracking-wide uppercase">
                  {course.units} Units
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