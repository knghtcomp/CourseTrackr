import React, { useState, useEffect } from 'react';
import { curriculum } from '../../data/curriculumData'; 

export const EditCoursesModal = ({ student, onClose }) => {
  const [courseStatuses, setCourseStatuses] = useState({});
  const [petitionStatuses, setPetitionStatuses] = useState({});
  
  const [dbCourses, setDbCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState(
    Number(student.yearLevel || student.year_standing || 1)
  );
  const [selectedSemester, setSelectedSemester] = useState('1st');

  const normalize = (str) => str ? str.toString().trim().toUpperCase() : "";

  // 1. FETCH DATA (Fixed to properly read is_petitioned flags)
  useEffect(() => {
    const fetchModalData = async () => {
      if (!student || !student.id) return;
      
      setIsLoading(true);
      try {
        const coursesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/courses`);
        const coursesData = await coursesRes.json();
        setDbCourses(coursesData);

        const recordsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/student-records/${student.id}`);
        const recordsData = await recordsRes.json();

        const initialStatuses = {};
        const initialPetitions = {};

        recordsData.forEach(record => {
          const id = Number(record.id || record.course_id);
          
          // Fix: Check the boolean flag for petitions
          if (record.is_petitioned === true || record.status === 'petitioned') {
            initialPetitions[id] = true;
          } 
          
          if (record.status === 'passed' || record.status === 'ongoing') {
            initialStatuses[id] = record.status;
          }
        });
        
        setCourseStatuses(initialStatuses);
        setPetitionStatuses(initialPetitions);

      } catch (error) {
        console.error("Failed to fetch modal data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModalData();
  }, [student]);

  // --- HELPER FUNCTIONS ---
  const getDbIdByCode = (code) => {
    const normalized = normalize(code);
    const dbCourse = dbCourses.find(c => normalize(c.code) === normalized);
    return dbCourse ? Number(dbCourse.id) : null;
  };

  const getCodeByDbId = (dbId) => {
    const dbCourse = dbCourses.find(c => Number(c.id) === Number(dbId));
    return dbCourse ? normalize(dbCourse.code) : null;
  };

  const getCurriculumCourseByCode = (code) => {
    const normalized = normalize(code);
    for (const term of curriculum) {
      const found = term.courses.find(c => normalize(c.code) === normalized);
      if (found) return found;
    }
    return null;
  };

  // 2. COURSE STATUS TOGGLE
  const handleToggleCourse = (code) => {
    const dbId = getDbIdByCode(code);
    
    if (!dbId) {
      alert(`Wait! The course ${code} is still loading or missing from the database.`);
      return;
    }

    setCourseStatuses(prev => {
      const newStatuses = { ...prev };
      const currentStatus = prev[dbId];

      const addPrereqs = (startCode) => {
        const toAdd = new Set([normalize(startCode)]);
        let addedNew = true;
        while (addedNew) {
          addedNew = false;
          Array.from(toAdd).forEach(currentCode => {
            const currCourse = getCurriculumCourseByCode(currentCode);
            if (currCourse && currCourse.prereq) {
              const prereqCodes = currCourse.prereq.split(',').map(normalize);
              prereqCodes.forEach(pCode => {
                if (pCode.includes("YEAR") || pCode.includes("BEHIND")) return;
                const pDbId = getDbIdByCode(pCode);
                if (pDbId && newStatuses[pDbId] !== 'passed') {
                  newStatuses[pDbId] = 'passed';
                  toAdd.add(pCode);
                  addedNew = true;
                }
              });
            }
          });
        }
      };

      const removeDependents = (startCode) => {
        const toRemove = new Set([normalize(startCode)]);
        let removedNew = true;
        while (removedNew) {
          removedNew = false;
          Object.keys(newStatuses).forEach(idStr => {
            const id = Number(idStr);
            const cCode = getCodeByDbId(id);
            if (!cCode || toRemove.has(cCode)) return;

            const currCourse = getCurriculumCourseByCode(cCode);
            if (currCourse && currCourse.prereq) {
              const prereqCodes = currCourse.prereq.split(',').map(normalize);
              const reliesOnRemoved = prereqCodes.some(p => toRemove.has(p));
              if (reliesOnRemoved) {
                delete newStatuses[id];
                toRemove.add(cCode);
                removedNew = true;
              }
            }
          });
        }
      };

      if (!currentStatus) {
        newStatuses[dbId] = 'passed';
        addPrereqs(code);
      } else if (currentStatus === 'passed') {
        newStatuses[dbId] = 'ongoing';
        removeDependents(code);
      } else {
        delete newStatuses[dbId];
        removeDependents(code);
      }

      return newStatuses;
    });
  };

  // PETITION TOGGLE
  const handleTogglePetition = (e, code) => {
    e.stopPropagation(); 

    const dbId = getDbIdByCode(code);
    if (!dbId) return;

    setPetitionStatuses(prev => {
      const newPetitions = { ...prev };
      if (newPetitions[dbId]) {
        delete newPetitions[dbId];
      } else {
        newPetitions[dbId] = true;
      }
      return newPetitions;
    });
  };

  // 3. SAVE LOGIC (Fixed to properly save Petitions)
  const handleSaveCourses = async () => {
    try {
      // Collect ALL unique IDs that have either a course status OR a petition status
      const allInteractedIds = new Set([
        ...Object.keys(courseStatuses),
        ...Object.keys(petitionStatuses)
      ]);

      const recordsToSave = Array.from(allInteractedIds).map(idStr => {
        const id = Number(idStr);
        return {
          course_id: id,
          status: courseStatuses[id] || 'pending', // Defaults to pending if only petitioned
          is_petitioned: !!petitionStatuses[id]    // Sends true/false flag to backend
        };
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: student.id, 
          records: recordsToSave 
        }),
      });

      if (response.ok) {
        alert(`Success! Saved academic record updates for ${student.name}!`);
        onClose(); 
      } else {
        alert("Something went wrong saving the data.");
      }
    } catch (error) {
      console.error("Error saving courses:", error);
    }
  };

  // SMART FILTER LOGIC
  const filteredCurriculum = curriculum.filter(term => {
    const semStr = term.semester.toLowerCase();
    
    let termYear = 0;
    if (semStr.includes('1st year') || semStr.includes('first year')) termYear = 1;
    else if (semStr.includes('2nd year') || semStr.includes('second year')) termYear = 2;
    else if (semStr.includes('3rd year') || semStr.includes('third year')) termYear = 3;
    else if (semStr.includes('4th year') || semStr.includes('fourth year')) termYear = 4;
    
    let termSem = '';
    if (semStr.includes('1st sem') || semStr.includes('first sem')) termSem = '1st';
    else if (semStr.includes('2nd sem') || semStr.includes('second sem')) termSem = '2nd';
    else if (semStr.includes('summer')) termSem = 'Summer';

    return termYear === selectedYear && termSem === selectedSemester;
  });

  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (year !== 2 && selectedSemester === 'Summer') {
      setSelectedSemester('1st'); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        {/* MOBILE FIX: Reduced padding (p-4) to save screen real estate */}
        <div className="p-4 md:p-6 lg:p-8 border-b border-gray-100 flex justify-between items-start shrink-0 bg-white">
          
          {/* MOBILE FIX: Reduced right padding so the title has more room before hitting the X button */}
          <div className="flex-1 pr-3 lg:pr-6">
            {/* MOBILE FIX: Scaled down heading to text-lg and tightened the line height */}
            <h2 className="text-[#003366] text-lg md:text-xl lg:text-2xl font-bold font-['Calistoga'] m-0 leading-tight">
              Edit Student Academic Record
            </h2>
            {/* MOBILE FIX: Shrunk the subtitle to text-xs */}
            <p className="text-gray-500 font-medium font-['Inter'] text-xs md:text-sm mt-0.5 md:mt-1 leading-snug">
              {student.name} ({student.studentId || student.school_id}) - Year {student.yearLevel || student.year_standing}
            </p>
          </div>

          <button 
            onClick={onClose} 
            // MOBILE FIX: Slightly smaller close button, pushed up a tiny bit to align with the smaller heading
            className="text-gray-400 hover:text-red-500 transition-colors text-xl lg:text-2xl shrink-0 p-1 -mt-1 md:mt-0"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 lg:px-8 lg:pb-8 overflow-y-auto flex-1 bg-gray-50/50">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#003366] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[#003366] font-bold">Loading student records...</p>
            </div>
          ) : (
            <>
              {/* THE HORIZONTAL TOGGLE UI */}
              <div className="flex flex-col gap-4 mb-6">
                
                <p className="text-gray-600 font-medium text-sm md:text-base m-0">
                  Click a course to cycle its status: <strong className="text-[#10B981]">Completed</strong> → <strong className="text-[#F59E0B]">Enrolled</strong> → <strong>Pending</strong>.
                </p>
                
                {/* MOBILE FIX: Years stacked on top of Semesters using flex-col, switching to flex-row on desktop */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full mt-2">
                  
                  {/* YEAR TOGGLE (Years First) */}
                  {/* MOBILE FIX: grid-cols-2 forces a 2x2 grid on mobile, lg:flex returns it to a single row on desktop */}
                  <div className="grid grid-cols-2 lg:flex lg:flex-nowrap bg-[#E9EBEF] rounded-3xl lg:rounded-full p-1 w-full lg:w-fit gap-1 lg:gap-0">
                    {[1, 2, 3, 4].map((year) => {
                      const yearLabel = year === 1 ? '1st Year' : year === 2 ? '2nd Year' : year === 3 ? '3rd Year' : '4th Year';
                      return (
                        <button
                          key={year}
                          onClick={() => handleYearChange(year)}
                          className={`w-full px-2 lg:px-6 py-2 text-sm lg:text-base font-bold rounded-full transition-all whitespace-nowrap ${
                            selectedYear === year ? 'bg-[#003366] text-white shadow-md' : 'text-[#003366] hover:bg-black/5'
                          }`}
                        >
                          {yearLabel}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* SEMESTER TOGGLE (Semesters Second) */}
                  <div className="flex bg-[#E9EBEF] rounded-full p-1 w-full lg:w-fit">
                    {['1st', '2nd', ...(selectedYear === 2 ? ['Summer'] : [])].map((sem) => (
                      <button
                        key={sem}
                        onClick={() => setSelectedSemester(sem)}
                        className={`flex-1 px-3 lg:px-6 py-2 text-xs lg:text-base font-bold rounded-full transition-all whitespace-nowrap ${
                          selectedSemester === sem ? 'bg-[#003366] text-white shadow-md' : 'text-[#003366] hover:bg-black/5'
                        }`}
                      >
                        {sem === 'Summer' ? 'Summer' : `${sem} Sem`}
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* Course Layout (Table for Desktop / Slim List for Mobile) */}
              <div className="flex flex-col gap-6">
                {filteredCurriculum.map((term, termIndex) => (
                  <section key={termIndex} className="w-full bg-white rounded-xl border border-stone-300 overflow-hidden shadow-sm">
                    
                    {/* Semester Header */}
                    <div className="bg-slate-100 px-4 py-3 lg:px-6 lg:py-4 border-b border-stone-200 flex items-center gap-3">
                      <div className="w-1.5 h-5 lg:w-2 lg:h-6 bg-[#003366] rounded-full"></div>
                      <h4 className="text-[#003366] font-bold font-['Calistoga'] text-base lg:text-lg m-0">
                        {term.semester}
                      </h4>
                    </div>
                    
                    {/* ==========================================
                        MOBILE FIX: Slim List (Hidden on Desktop) 
                        Shows ONLY: Description, Status, and Petition Star
                    ========================================== */}
                    <div className="block lg:hidden">
                      {term.courses.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-['Inter']">
                          No courses found for this semester.
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {term.courses.map(course => {
                            const dbId = getDbIdByCode(course.code);
                            const status = dbId ? courseStatuses[dbId] : null;
                            const isPetitioned = dbId ? petitionStatuses[dbId] : false;
                            
                            let rowClass = "transition-colors cursor-pointer border-b border-stone-200 p-4 flex items-center justify-between gap-3 ";
                            
                            if (isPetitioned) {
                              rowClass += "bg-purple-100 hover:bg-purple-200"; 
                            } else if (!status) {
                              rowClass += "bg-white hover:bg-gray-50"; 
                            } else if (status === 'passed') {
                              rowClass += "bg-[#10B981]/15 hover:bg-[#10B981]/25"; 
                            } else if (status === 'ongoing') {
                              rowClass += "bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25"; 
                            }

                            return (
                              <div 
                                key={course.code} 
                                onClick={() => handleToggleCourse(course.code)}
                                className={rowClass}
                              >
                                {/* MOBILE FIX: Removed course.code, showing ONLY the title */}
                                <span className={`font-['Caladea'] text-sm leading-tight flex-1 pr-2 ${isPetitioned ? 'text-purple-900 font-bold' : 'text-gray-800 font-bold'}`}>
                                  {course.title}
                                </span>

                                {/* Status & Petition Star */}
                                <div className="flex items-center gap-2 shrink-0">
                                  
                                  {/* Status Badge */}
                                  {!status ? (
                                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-300 whitespace-nowrap">
                                      Pending
                                    </span>
                                  ) : status === 'passed' ? (
                                    <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/20 px-2.5 py-1 rounded-full border border-[#10B981]/30 whitespace-nowrap">
                                      ✓ Completed
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/20 px-2.5 py-1 rounded-full border border-[#F59E0B]/30 whitespace-nowrap">
                                      ⏳ Enrolled
                                    </span>
                                  )}

                                  {/* Petition Star Button */}
                                  <button
                                    onClick={(e) => handleTogglePetition(e, course.code)}
                                    className={`w-7 h-7 flex items-center justify-center text-sm font-bold rounded-full border transition-all shadow-sm shrink-0 ${
                                      isPetitioned 
                                        ? 'bg-purple-600 text-white border-purple-600 active:scale-95' 
                                        : 'bg-white text-purple-600 border-purple-200 active:scale-95'
                                    }`}
                                  >
                                    {isPetitioned ? '★' : '+'}
                                  </button>
                                  
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* ==========================================
                        DESKTOP VIEW: Full Table (Hidden on Mobile)
                    ========================================== */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className="bg-slate-50 text-[#003366] border-b-2 border-stone-300 font-['Calistoga'] text-sm lg:text-base">
                            <th className="py-2 px-4 w-12 text-center">#</th>
                            <th className="py-2 px-4 w-36 whitespace-nowrap">Course Code</th>
                            <th className="py-2 px-4">Description</th>
                            <th className="py-2 px-4 w-20 text-center">Units</th>
                            <th className="py-2 px-4 w-32 text-center">Status</th>
                            <th className="py-2 px-4 w-36 text-center">Petition Credits</th> 
                          </tr>
                        </thead>
                        <tbody>
                          {term.courses.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="p-8 text-center text-gray-500 font-['Inter']">
                                No courses found for this semester.
                              </td>
                            </tr>
                          ) : (
                            term.courses.map((course, index) => {
                              const dbId = getDbIdByCode(course.code);
                              const status = dbId ? courseStatuses[dbId] : null;
                              const isPetitioned = dbId ? petitionStatuses[dbId] : false;
                              
                              let rowClass = "transition-colors cursor-pointer border-b border-stone-200 ";
                              
                              if (isPetitioned) {
                                rowClass += "bg-purple-100 hover:bg-purple-200 border-purple-200"; 
                              } else if (!status) {
                                rowClass += "bg-white hover:bg-gray-50"; 
                              } else if (status === 'passed') {
                                rowClass += "bg-[#10B981]/15 hover:bg-[#10B981]/25 border-[#10B981]/20"; 
                              } else if (status === 'ongoing') {
                                rowClass += "bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 border-[#F59E0B]/20"; 
                              }

                              return (
                                <tr 
                                  key={course.code} 
                                  onClick={() => handleToggleCourse(course.code)}
                                  className={rowClass}
                                >
                                  <td className={`py-3 px-4 text-center font-bold ${isPetitioned ? 'text-purple-600' : 'text-gray-500'}`}>{index + 1}</td>
                                  <td className={`py-3 px-4 font-bold whitespace-nowrap ${isPetitioned ? 'text-purple-900' : 'text-[#003366]'}`}>{course.code}</td>
                                  <td className={`py-3 px-4 font-['Caladea'] ${isPetitioned ? 'text-purple-900 font-medium' : 'text-gray-800'}`}>{course.title}</td>
                                  <td className="py-3 px-4 text-center font-bold text-gray-700">{course.units}</td>
                                  <td className="py-3 px-4 text-center">
                                    {!status ? (
                                      <span className="whitespace-nowrap inline-block text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
                                        Pending
                                      </span>
                                    ) : status === 'passed' ? (
                                      <span className="whitespace-nowrap inline-block text-sm font-bold text-[#10B981] bg-[#10B981]/20 px-3 py-1 rounded-full border border-[#10B981]/30">
                                        ✓ Completed
                                      </span>
                                    ) : (
                                      <span className="whitespace-nowrap inline-block text-sm font-bold text-[#F59E0B] bg-[#F59E0B]/20 px-3 py-1 rounded-full border border-[#F59E0B]/30">
                                        ⏳ Enrolled
                                      </span>
                                    )}
                                  </td>
                                  
                                  <td className="py-3 px-4 text-center">
                                    <button
                                      onClick={(e) => handleTogglePetition(e, course.code)}
                                      className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all shadow-sm whitespace-nowrap ${
                                        isPetitioned 
                                          ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700' 
                                          : 'bg-white text-purple-600 border-purple-200 hover:border-purple-600 hover:bg-purple-50'
                                      }`}
                                    >
                                      {isPetitioned ? '★ Petitioned' : '+ Petition'}
                                    </button>
                                  </td>

                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ))}

                {filteredCurriculum.length === 0 && (
                  <div className="text-center py-10 bg-white border border-dashed border-gray-300 rounded-2xl">
                    <p className="text-gray-500 font-medium font-['Inter']">
                      No curriculum data found for Year {selectedYear}, {selectedSemester} Semester.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {/* MOBILE FIX: Shrunk padding (p-4 lg:p-6) and gap (gap-2 lg:gap-4) */}
        <div className="p-4 lg:p-6 border-t border-gray-100 bg-white flex justify-end gap-2 lg:gap-4 shrink-0 z-10">
          <button 
            onClick={onClose}
            // MOBILE FIX: Tighter padding, smaller text, and smaller rounded corners on phones
            className="px-4 py-2 lg:px-6 lg:py-2.5 rounded-lg lg:rounded-xl border border-gray-300 text-gray-700 font-bold font-['Inter'] text-sm lg:text-base hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveCourses}
            disabled={isLoading}
            className={`px-5 py-2 lg:px-8 lg:py-2.5 rounded-lg lg:rounded-xl text-white font-bold font-['Inter'] text-sm lg:text-base shadow-md transition-all flex items-center justify-center gap-1.5 lg:gap-2 ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#003366] hover:bg-[#002244]'
            }`}
          >
            <span>💾</span>
            {/* MOBILE FIX: Just say "Save" on phones, full text on desktop */}
            <span className="md:hidden">Save</span>
            <span className="hidden md:inline">Save Academic Record</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditCoursesModal;