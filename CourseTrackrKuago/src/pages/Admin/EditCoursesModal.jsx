import React, { useState, useEffect } from 'react';
import { curriculum } from '../../data/curriculumData'; 

export const EditCoursesModal = ({ student, onClose }) => {
  const [courseStatuses, setCourseStatuses] = useState({});
  // 🚨 NEW: State specifically for tracking petitions
  const [petitionStatuses, setPetitionStatuses] = useState({});
  
  const [dbCourses, setDbCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State to track selected Year and Semester
  const [selectedYear, setSelectedYear] = useState(
    Number(student.yearLevel || student.year_standing || 1)
  );
  const [selectedSemester, setSelectedSemester] = useState('1st');

  const normalize = (str) => str ? str.toString().trim().toUpperCase() : "";

  // 1. Fetch data on load (UPDATED FOR DUAL RECORDS)
  useEffect(() => {
    const fetchModalData = async () => {
      if (!student || !student.id) return;
      
      setIsLoading(true);
      try {
        const coursesRes = await fetch('http://localhost:5000/api/courses');
        const coursesData = await coursesRes.json();
        setDbCourses(coursesData);

        const recordsRes = await fetch(`http://localhost:5000/api/student-records/${student.id}`);
        const recordsData = await recordsRes.json();

        const initialStatuses = {};
        const initialPetitions = {};

        // 🚨 THE FIX: Separate the base status and the petition status
        recordsData.forEach(record => {
          const id = Number(record.id || record.course_id);
          if (record.status === 'petitioned') {
            initialPetitions[id] = true;
          } else if (record.status === 'passed' || record.status === 'ongoing') {
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

  // 2. THE TRI-STATE TOGGLE ENGINE (Unchanged, handles Enrolled/Passed/Pending)
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

  // 🚨 NEW: TOGGLE PETITION LOGIC
  const handleTogglePetition = (e, code) => {
    e.stopPropagation(); // Stop the card's onClick from firing

    const dbId = getDbIdByCode(code);
    if (!dbId) return;

    // Only allow petition toggling if the course is already Enrolled or Completed
    if (courseStatuses[dbId]) {
      setPetitionStatuses(prev => ({
        ...prev,
        [dbId]: !prev[dbId]
      }));
    }
  };

  // 3. SAVE LOGIC (UPDATED FOR DUAL RECORDS)
  const handleSaveCourses = async () => {
    try {
      const recordsToSave = [];
      
      Object.keys(courseStatuses).forEach(idStr => {
        const id = Number(idStr);
        // 1. Save base status (passed/ongoing)
        recordsToSave.push({ course_id: id, status: courseStatuses[id] });
        
        // 2. Save petition status if it exists AND the course isn't pending
        if (petitionStatuses[id]) {
          recordsToSave.push({ course_id: id, status: 'petitioned' });
        }
      });

      const response = await fetch('http://localhost:5000/api/records', {
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

  // 🚨 SMART FILTER LOGIC
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
          <div>
            <h2 className="text-[#003366] text-2xl font-bold font-['Calistoga'] m-0">Edit Student Academic Record</h2>
            <p className="text-gray-500 font-medium font-['Inter'] mt-1">
              {student.name} ({student.studentId || student.school_id}) - Year {student.yearLevel || student.year_standing}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-2xl">
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
                  Click a course to cycle its status: <strong className="text-[#10B981]">Passed</strong> → <strong className="text-[#F59E0B]">Ongoing</strong> → <strong>Pending</strong>.
                </p>
                
                <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                  
                  {/* Year Toggle */}
                  <div className="flex gap-1 p-1.5 bg-gray-200/50 rounded-xl w-max">
                    {[1, 2, 3, 4].map(year => (
                      <button
                        key={year}
                        onClick={() => handleYearChange(year)}
                        className={`px-4 py-2 rounded-lg font-bold font-['Inter'] text-sm transition-all ${
                          selectedYear === year
                            ? 'bg-white text-[#003366] shadow-sm'
                            : 'text-gray-500 hover:text-[#003366]'
                        }`}
                      >
                        Year {year}
                      </button>
                    ))}
                  </div>

                  {/* Semester Toggle */}
                  <div className="flex gap-1 p-1.5 bg-gray-200/50 rounded-xl w-max">
                    <button
                      onClick={() => setSelectedSemester('1st')}
                      className={`px-4 py-2 rounded-lg font-bold font-['Inter'] text-sm transition-all ${
                        selectedSemester === '1st'
                          ? 'bg-white text-[#003366] shadow-sm'
                          : 'text-gray-500 hover:text-[#003366]'
                      }`}
                    >
                      1st Sem
                    </button>
                    
                    <button
                      onClick={() => setSelectedSemester('2nd')}
                      className={`px-4 py-2 rounded-lg font-bold font-['Inter'] text-sm transition-all ${
                        selectedSemester === '2nd'
                          ? 'bg-white text-[#003366] shadow-sm'
                          : 'text-gray-500 hover:text-[#003366]'
                      }`}
                    >
                      2nd Sem
                    </button>

                    {selectedYear === 2 && (
                      <button
                        onClick={() => setSelectedSemester('Summer')}
                        className={`px-4 py-2 rounded-lg font-bold font-['Inter'] text-sm transition-all ${
                          selectedSemester === 'Summer'
                            ? 'bg-white text-[#F59E0B] shadow-sm'
                            : 'text-gray-500 hover:text-[#F59E0B]'
                        }`}
                      >
                        Summer
                      </button>
                    )}
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
                              
                              {/* 🚨 THE PETITION BUTTON */}
                              <div className="mt-3 flex justify-start">
                                <button
                                  onClick={(e) => handleTogglePetition(e, course.code)}
                                  disabled={!status} // Disabled if course is pending
                                  className={`px-3 py-1.5 text-[10px] font-bold rounded-full border transition-all ${
                                    !status 
                                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                                      : isPetitioned 
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