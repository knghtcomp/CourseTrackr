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
        <div className="p-6 lg:p-8 border-b border-gray-100 flex justify-between items-start shrink-0 bg-white">
          <div className="flex-1 pr-6">
            <h2 className="text-[#003366] text-2xl font-bold font-['Calistoga'] m-0">Edit Student Academic Record</h2>
            <p className="text-gray-500 font-medium font-['Inter'] mt-1">
              {student.name} ({student.studentId || student.school_id}) - Year {student.yearLevel || student.year_standing}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-2xl shrink-0">
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
              {/* THE HORIZONTAL TOGGLE UI */}
              <div className="flex flex-col gap-4 mb-6">
                
                <p className="text-gray-600 font-medium text-sm md:text-base m-0">
                  Click a course to cycle its status: <strong className="text-[#10B981]">Completed</strong> → <strong className="text-[#F59E0B]">Enrolled</strong> → <strong>Pending</strong>.
                </p>
                
                <div className="flex flex-col-reverse lg:flex-row lg:items-center justify-between gap-4 w-full mt-2">
                  


                  {/* YEAR TOGGLE (Right Side) */}
                  <div className="flex flex-wrap lg:flex-nowrap bg-[#E9EBEF] rounded-3xl lg:rounded-full p-1 w-full lg:w-fit">
                    {[1, 2, 3, 4].map((year) => {
                      const yearLabel = year === 1 ? '1st Year' : year === 2 ? '2nd Year' : year === 3 ? '3rd Year' : '4th Year';
                      return (
                        <button
                          key={year}
                          onClick={() => handleYearChange(year)}
                          className={`flex-1 px-6 py-2 text-sm lg:text-base font-bold rounded-full transition-all whitespace-nowrap ${
                            selectedYear === year ? 'bg-[#003366] text-white shadow-md' : 'text-[#003366] hover:bg-black/5'
                          }`}
                        >
                          {yearLabel}
                        </button>
                      );
                    })}
                  </div>
                  {/* SEMESTER TOGGLE (Left Side) */}
                  <div className="flex bg-[#E9EBEF] rounded-full p-1 w-full lg:w-fit">
                    {['1st', '2nd', ...(selectedYear === 2 ? ['Summer'] : [])].map((sem) => (
                      <button
                        key={sem}
                        onClick={() => setSelectedSemester(sem)}
                        className={`flex-1 px-6 py-2 text-sm lg:text-base font-bold rounded-full transition-all whitespace-nowrap ${
                          selectedSemester === sem ? 'bg-[#003366] text-white shadow-md' : 'text-[#003366] hover:bg-black/5'
                        }`}
                      >
                        {sem === 'Summer' ? 'Summer' : `${sem} Sem`}
                      </button>
                    ))}
                  </div>

                  

                </div>
              </div>

              {/* Course Grid */}
              <div className="flex flex-col gap-6">
                {filteredCurriculum.map((term, termIndex) => (
                  <div key={termIndex} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b-2 border-gray-100 pb-3">
                      <div className="w-2 h-6 bg-[#003366] rounded-full"></div>
                      <h4 className="text-[#003366] font-bold font-['Calistoga'] text-xl m-0">
                        {term.semester}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {term.courses.map(course => {
                        const dbId = getDbIdByCode(course.code);
                        const status = dbId ? courseStatuses[dbId] : null;
                        const isPetitioned = dbId ? petitionStatuses[dbId] : false;

                        return (
                          <div 
                            key={course.code}
                            onClick={() => handleToggleCourse(course.code)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 relative ${
                              isPetitioned 
                                ? 'bg-purple-50/60 border-purple-300 shadow-sm' 
                                : status === 'passed' 
                                  ? 'bg-[#10B981]/5 border-[#10B981] shadow-sm' 
                                  : status === 'ongoing'
                                    ? 'bg-[#F59E0B]/5 border-[#F59E0B] shadow-sm'
                                    : 'bg-gray-50 border-gray-200 hover:border-[#003366]/40 hover:bg-white'
                            }`}
                          >
                            <div className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              status === 'passed' ? 'bg-[#10B981] border-[#10B981]' : 
                              status === 'ongoing' ? 'bg-[#F59E0B] border-[#F59E0B]' : 
                              'border-gray-400 bg-white'
                            }`}>
                              {status === 'passed' && <span className="text-white text-xs font-bold">✓</span>}
                              {status === 'ongoing' && <span className="text-white text-[10px] font-bold">⏳</span>}
                            </div>
                            
                            <div className="flex-1 flex flex-col pr-2">
                              <div className="flex justify-between items-start">
                                <div className={`font-bold font-['Inter'] text-sm ${
                                  isPetitioned ? 'text-purple-800' :
                                  status === 'passed' ? 'text-[#10B981]' : 
                                  status === 'ongoing' ? 'text-[#F59E0B]' : 
                                  'text-gray-700'
                                }`}>
                                  {course.code}
                                </div>
                                <div className="text-gray-500 font-bold text-xs bg-gray-200/70 px-2 py-0.5 rounded">
                                  {course.units}u
                                </div>
                              </div>
                              <div className="text-gray-500 text-xs font-medium mt-1 leading-tight line-clamp-2">
                                {course.title}
                              </div>
                              
                              {/* PETITION BUTTON (Unlocked) */}
                              <div className="mt-3 flex justify-start">
                                <button
                                  onClick={(e) => handleTogglePetition(e, course.code)}
                                  className={`px-3 py-1.5 text-[10px] font-bold rounded-full border transition-all ${
                                    isPetitioned 
                                      ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700 shadow-sm' 
                                      : 'bg-white text-purple-600 border-purple-200 hover:border-purple-600 hover:bg-purple-50 shadow-sm'
                                  }`}
                                >
                                  {isPetitioned ? '★ Petitioned' : '+ Petition'}
                                </button>
                              </div>

                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
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
        <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-4 shrink-0 z-10">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold font-['Inter'] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveCourses}
            disabled={isLoading}
            className={`px-8 py-2.5 rounded-xl text-white font-bold font-['Inter'] shadow-md transition-all flex items-center gap-2 ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#003366] hover:bg-[#002244]'
            }`}
          >
            <span>💾</span> Save Academic Record
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditCoursesModal;