import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { curriculum } from '../data/curriculumData'; 

export const Setup = () => {
  const navigate = useNavigate();
  const isLocked = localStorage.getItem('setupLocked') === 'true'; 
  
  // -- EXISTING STATES --
  const [yearStanding, setYearStanding] = useState(() => {
    // ✅ THE FIX 1: Look for the specific student memory key
    const savedUserStr = localStorage.getItem('studentUser');
    if (savedUserStr) {
      const parsedUser = JSON.parse(savedUserStr);
      const savedYear = parsedUser.yearStanding || parsedUser.year_standing;
      return savedYear ? Number(savedYear) : 1;
    }
    return 1;
  });
  
  const [selectedCourses, setSelectedCourses] = useState([]);

  // -- NEW STATES FOR TABS --
  const [viewYear, setViewYear] = useState(yearStanding || 1);
  const [viewSemester, setViewSemester] = useState('1st Semester');

  useEffect(() => {
    setViewYear(yearStanding || 1);
  }, [yearStanding]);

  // -- FETCH LOGIC (UPDATED FOR SINGLE-ROW RECORDS) --
  useEffect(() => {
    const fetchExistingSetup = async () => {
      // ✅ THE FIX 2: Look for the specific student memory key
      const currentUserStr = localStorage.getItem('studentUser');
      if (!currentUserStr) {
        alert("Session missing! Please log in to set up your account.");
        navigate('/login'); 
        return; 
      }
      const currentUser = JSON.parse(currentUserStr);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student-records/${currentUser.id}`);
        if (response.ok) {
          const savedRecords = await response.json();
          if (Array.isArray(savedRecords)) {
            
            const courseMap = new Map();
            
            savedRecords.forEach(record => {
              const id = Number(record.id || record.course_id);
              if (!courseMap.has(id)) {
                courseMap.set(id, { id, status: null, isPetitioned: false });
              }
              
              const current = courseMap.get(id);
              
              current.status = record.status; 
              current.isPetitioned = record.is_petitioned === true;
            });

            // Only grab courses that actually have a status
            const formattedForReact = Array.from(courseMap.values()).filter(c => c.status);
            setSelectedCourses(formattedForReact);
          }
        }
      } catch (error) {
        console.error("Failed to load existing setup:", error);
      }
      
    };

    fetchExistingSetup();
  }, [navigate]);

  // -- CALCULATIONS --
  const totalCourses = selectedCourses.length;
  const totalUnits = selectedCourses.reduce((sum, selectedCourse) => {
    const matchedCourse = curriculum.flatMap(sem => sem.courses).find(c => c.id === selectedCourse.course_id || c.id === selectedCourse.id);
    return sum + (matchedCourse ? Number(matchedCourse.units) : 0);
  }, 0);

  // Calculate completed courses (status === 'passed')
  const completedCoursesCount = selectedCourses.filter(c => c.status === 'passed').length;
  
  // Calculate total units ONLY for completed courses
  const completedUnits = selectedCourses
    .filter(c => c.status === 'passed')
    .reduce((sum, selectedCourse) => {
      const matchedCourse = curriculum.flatMap(sem => sem.courses).find(c => c.id === selectedCourse.id);
      return sum + (matchedCourse ? matchedCourse.units : 0);
    }, 0);

  // Count ONLY the courses that are actively enrolled (ongoing)
  const enrolledCoursesCount = selectedCourses.filter(course => course.status === 'ongoing').length;

  // 🚨 NEW: PREREQUISITE SCANNER HELPER
  // 🚨 NEW: PREREQUISITE SCANNER HELPER (UPDATED FOR OJT)
  const checkPrereqs = (course) => {
    const prereqString = course.prereq;

    // 1. STRICT OJT CHECK: "No subjects behind"
    const isOJT = course.title && (course.title.toLowerCase().includes('on the job') || course.title.toLowerCase().includes('ojt'));
    const isNoSubjectsBehind = prereqString && prereqString.toLowerCase().includes('no subjects behind');

    if (isOJT || isNoSubjectsBehind) {
      let missingCount = 0;
      let reachedCurrentSem = false;
      
      // Scan the curriculum chronologically from 1st Year onwards
      curriculum.forEach(sem => {
        // If we find the semester containing OJT, stop scanning previous semesters
        if (sem.courses.some(c => c.id === course.id)) {
          reachedCurrentSem = true;
        }
        
        // For every semester BEFORE the OJT semester, check if all courses are passed
        if (!reachedCurrentSem) {
          sem.courses.forEach(c => {
            const isPassed = selectedCourses.some(sc => sc.id === c.id && sc.status === 'passed');
            if (!isPassed) missingCount++;
          });
        }
      });

      if (missingCount > 0) {
        // Return a custom error message specifically for OJT
        return { 
          met: false, 
          missing: [`Strict Rule: You have ${missingCount} uncompleted subject(s) behind you. All previous courses must be completed first`] 
        };
      }
    }

    // 2. STANDARD PREREQUISITE CHECK (For all other normal courses)
    if (!prereqString || prereqString.toLowerCase() === 'none') return { met: true, missing: [] };
    
    const prereqCodes = prereqString.split(',').map(s => s.trim().toUpperCase());
    const missing = [];

    prereqCodes.forEach(code => {
      if (code.includes("YEAR") || code.includes("STANDING")) return;

      const pCourse = curriculum.flatMap(term => term.courses).find(c => c.code.toUpperCase() === code);
      
      if (pCourse) {
        const isPassed = selectedCourses.some(c => c.id === pCourse.id && c.status === 'passed');
        if (!isPassed) missing.push(code);
      }
    });

    return { met: missing.length === 0, missing };
  };

  // 🚨 UPDATED: TOGGLE COURSE LOGIC (Secured Enrollment & Override)
  const toggleCourse = (course) => {
    const existingCourseIndex = selectedCourses.findIndex(c => c.id === course.id);

    if (existingCourseIndex >= 0) {
      const existingCourse = selectedCourses[existingCourseIndex];
      
      if (existingCourse.status === 'passed') {
        
       // New way
const prereqCheck = checkPrereqs(course);
        
        // Allow enrollment if prereqs are met OR if it's explicitly petitioned
        if (prereqCheck.met || existingCourse.isPetitioned) {
          const updatedCourses = [...selectedCourses];
          updatedCourses[existingCourseIndex] = { ...existingCourse, status: 'ongoing' };
          setSelectedCourses(updatedCourses);
        } else {
          // Block Enrollment and cycle to removal
          alert(`Cannot enroll in ${course.code}.\nMissing completed prerequisites: ${prereqCheck.missing.join(', ')}\n\nIf you have an approved petition for this, please click the petition button first before changing its status.`);
          setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
        }

      } 
      else if (existingCourse.status === 'ongoing') {
        // Cycle to removed
        setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
      }
    } else {
      // First click ALWAYS adds as 'passed' to effortlessly handle historical data entry
      setSelectedCourses([...selectedCourses, { ...course, status: 'passed', isPetitioned: false }]);
    }
  };

  // 🚨 UPDATED: TOGGLE PETITION LOGIC
  const togglePetition = (course, e) => {
    e.stopPropagation(); 

    const existingCourseIndex = selectedCourses.findIndex(c => c.id === course.id);

    if (existingCourseIndex >= 0) {
      // Flip the petition switch if it already exists
      const updatedCourses = [...selectedCourses];
      updatedCourses[existingCourseIndex].isPetitioned = !updatedCourses[existingCourseIndex].isPetitioned;
      setSelectedCourses(updatedCourses);
    } else {
      // If they click petition on an unselected course, automatically add it to handle historical petition entries
      setSelectedCourses([...selectedCourses, { ...course, status: 'passed', isPetitioned: true }]);
    }
  };

  // -- SAVE LOGIC (CLEAN SINGLE-ROW VERSION) --
  const handleSaveSetup = async () => {
    // ✅ THE FIX 3: Look for the specific student memory key
    const currentUserStr = localStorage.getItem('studentUser');
    if (!currentUserStr) {
      alert("Error: You must be logged in to save your setup.");
      navigate('/login');
      return;
    }
    const currentUser = JSON.parse(currentUserStr);

    const formattedRecords = selectedCourses
      .filter(course => course.status) 
      .map(course => ({
        course_id: course.id,
        status: course.status,
        is_petitioned: course.isPetitioned || false 
      }));

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          year_standing: yearStanding, 
          records: formattedRecords
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        const updatedUser = { ...currentUser, yearStanding: yearStanding };
        // ✅ THE FIX 4: Save updates back to the specific student memory key
        localStorage.setItem('studentUser', JSON.stringify(updatedUser));
        alert("Setup saved successfully! Redirecting to dashboard...");
        navigate('/dashboard');
      } else {
        alert(`Failed to save: ${data.message || data.error || JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error("Setup save error:", error);
      alert("Could not connect to the server. Is it running on port 5000?");
    }
  };

  // -- TAB HANDLING & FILTERING LOGIC --
  const handleYearTabClick = (year) => {
    setViewYear(year);
    if (year !== 2 && viewSemester === 'Summer') {
      setViewSemester('1st Semester');
    }
  };

  const numberPrefix = viewYear === 1 ? '1st' : viewYear === 2 ? '2nd' : viewYear === 3 ? '3rd' : '4th';
  const filteredCurriculum = curriculum.filter(sem => 
    sem.semester.toLowerCase().includes(`${numberPrefix} year`) &&
    sem.semester.toLowerCase().includes(viewSemester.toLowerCase())
  );

  // -- RENDER LOCKED SCREEN --
  if (isLocked) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#F4F7FA] p-6 text-center">
        <div className="bg-white p-10 rounded-3xl border border-black/10 shadow-lg max-w-md">
          <span className="text-6xl mb-4 block">🔒</span>
          <h2 className="text-[#003366] text-3xl font-bold font-['Calistoga'] mb-4">Setup is Locked</h2>
          <p className="text-gray-600 font-medium font-['Inter'] mb-8">
            The academic setup is currently closed by the Admin. Please contact the admin if you need to update your records.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-[#003366] text-white rounded-xl font-bold hover:bg-[#002244] transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    );
  }

  // -- MAIN RENDER --
  // -- MAIN RENDER --
  return (
    <main className="flex flex-col w-full min-h-screen bg-white font-sans pb-32">
      
      {/* Header */}
      <header className="w-full h-20 lg:h-24 bg-slate-100 flex items-center px-6 lg:px-[90px] gap-5 shadow-sm">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#003366] rounded-xl flex items-center justify-center shrink-0 shadow-md">
          <img src="/gradhat.svg" alt="Academic Setup Icon" className="w-6 h-6 lg:w-7 lg:h-7 object-contain" />
        </div>
        <h1 className="text-black text-xl lg:text-2xl font-normal font-['Calistoga'] m-0">
          Academic Setup
        </h1>
      </header>

      {/* 🚨 THE FIX: Reduced gap-6 to gap-4 md:gap-5 to pull all the cards closer together! */}
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-[90px] mt-4 flex flex-col gap-4 md:gap-5">

        {/* 1. Select Courses Banner */}
        <section className="w-full bg-gradient-to-r from-[#001A33] to-[#004080] rounded-xl p-4 lg:p-6 flex flex-row items-center justify-between shadow-md text-left gap-2">
          <div className="flex flex-col gap-0.5 lg:gap-1">
            <h2 className="text-white text-lg md:text-2xl lg:text-3xl font-normal font-['Calistoga'] m-0 drop-shadow-sm leading-tight">
              Select Courses
            </h2>
            <p className="text-gray-200 text-xs md:text-base lg:text-lg font-light font-['Fjord'] m-0 leading-snug">
              <span className="hidden md:inline">You have completed </span>
              <strong className="text-[#FFCC00]">{completedCoursesCount}</strong> courses 
              <span className="md:hidden"> done </span>
              <span className="hidden md:inline"> totaling </span> 
              (<strong className="text-[#FFCC00]">{completedUnits}</strong> units)
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[#FFCC00] text-3xl md:text-5xl lg:text-6xl font-extrabold font-['Inter'] leading-none drop-shadow-md">
              {completedCoursesCount}
            </span>
          </div>
        </section>

        {/* 2. Standing Year Selection */}
        <section className="w-full bg-white rounded-xl border border-gray-200 p-4 lg:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 lg:gap-4 shadow-sm">
          <div className="flex-1">
            <h3 className="text-[#003366] text-base md:text-lg lg:text-xl font-bold font-['Calistoga'] m-0 leading-tight">
              Current Year Standing
            </h3>
            <p className="text-gray-500 font-medium font-['Inter'] text-xs md:text-sm mt-0.5 md:mt-1 leading-snug">
              Select your current academic level to help us personalize your track.
            </p>
          </div>

          <div className="relative w-full md:w-48 shrink-0">
            <select
              value={yearStanding}
              onChange={(e) => {
                const val = Number(e.target.value);
                setYearStanding(val);
                setViewYear(val); 
              }}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-[#003366] font-bold font-['Inter'] text-xs md:text-sm py-2 md:py-2.5 px-3 md:px-4 pr-8 md:pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] cursor-pointer shadow-sm"
            >
              {[1, 2, 3, 4, 5].map(year => (
                <option key={year} value={year}>
                  {year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 md:px-4 text-[#003366]">
              <svg className="fill-current h-3 w-3 md:h-4 md:w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </section>

        {/* 3. Toggles for Curriculum Navigation */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
          
          {/* YEAR TOGGLE */}
          <div className="grid grid-cols-2 lg:flex lg:flex-nowrap bg-[#E9EBEF] rounded-3xl lg:rounded-full p-1 w-full lg:w-fit gap-1 lg:gap-0">
            {[1, 2, 3, 4].map(y => (
              <button
                key={y}
                onClick={() => handleYearTabClick(y)}
                className={`w-full px-2 lg:px-6 py-2 text-sm lg:text-base font-bold rounded-full transition-all whitespace-nowrap ${
                  viewYear === y ? 'bg-[#003366] text-white shadow-md' : 'text-[#003366] hover:bg-black/5'
                }`}
              >
                {y === 1 ? '1st Year' : y === 2 ? '2nd Year' : y === 3 ? '3rd Year' : '4th Year'}
              </button>
            ))}
          </div>
          
          {/* SEMESTER TOGGLE */}
          <div className="flex bg-[#E9EBEF] rounded-full p-1 w-full lg:w-fit">
            {['1st Semester', '2nd Semester', ...(viewYear === 2 ? ['Summer'] : [])].map(sem => (
              <button
                key={sem}
                onClick={() => setViewSemester(sem)}
                className={`flex-1 px-3 lg:px-6 py-2 text-xs lg:text-base font-bold rounded-full transition-all whitespace-nowrap ${
                  viewSemester === sem ? 'bg-[#003366] text-white shadow-md' : 'text-[#003366] hover:bg-black/5'
                }`}
              >
                {sem}
              </button>
            ))}
          </div>

        </section>

        {/* 4. Table Layout for Courses */}
        <section className="w-full bg-white rounded-xl border border-stone-300 overflow-hidden shadow-sm">
          
          {/* MOBILE FIX: Slim List (Hidden on Desktop) */}
          <div className="block lg:hidden">
            {filteredCurriculum.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-['Inter']">
                No courses found for this semester.
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredCurriculum.flatMap(sem => sem.courses).map((course, index) => {
                  const isSelected = selectedCourses.find(c => c.id === course.id);
                  const isPetitioned = isSelected?.isPetitioned || false;
                  
                  let rowClass = "transition-colors cursor-pointer border-b border-stone-200 p-4 flex items-center justify-between gap-3 ";
                  
                  if (isPetitioned) {
                    rowClass += "bg-purple-100 hover:bg-purple-200"; 
                  } else if (!isSelected) {
                    rowClass += "bg-white hover:bg-gray-50"; 
                  } else if (isSelected.status === 'passed') {
                    rowClass += "bg-[#10B981]/15 hover:bg-[#10B981]/25"; 
                  } else if (isSelected.status === 'ongoing') {
                    rowClass += "bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25"; 
                  }

                  return (
                    <div 
                      key={course.id} 
                      onClick={() => toggleCourse(course)}
                      className={rowClass}
                    >
                      {/* Description (Title) */}
                      <span className={`font-['Caladea'] text-sm leading-tight flex-1 pr-2 ${isPetitioned ? 'text-purple-900 font-bold' : 'text-gray-800 font-bold'}`}>
                        {course.title}
                      </span>

                      {/* Status & Petition Star */}
                      <div className="flex items-center gap-2 shrink-0">
                        
                        {/* Status Badge */}
                        {!isSelected ? (
                          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-300 whitespace-nowrap">
                            Pending
                          </span>
                        ) : isSelected.status === 'passed' ? (
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
                          onClick={(e) => togglePetition(course, e)}
                          disabled={!isSelected} 
                          className={`w-7 h-7 flex items-center justify-center text-sm font-bold rounded-full border transition-all shadow-sm shrink-0 ${
                            !isSelected 
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                              : isPetitioned 
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

          {/* DESKTOP VIEW: Full Table (Hidden on Mobile) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-100 text-[#003366] border-b-2 border-stone-300 font-['Calistoga'] text-base">
                  <th className="py-2 px-4 w-12 text-center">#</th>
                  <th className="py-2 px-4 w-36 whitespace-nowrap">Course Code</th>
                  <th className="py-2 px-4">Description</th>
                  <th className="py-2 px-4 w-20 text-center">Units</th>
                  <th className="py-2 px-4 w-36">Requisite</th>
                  <th className="py-2 px-4 w-36">Co-Requisite</th>
                  <th className="py-2 px-4 w-32 text-center">Status</th>
                  <th className="py-2 px-4 w-36 text-center">Petition Credits</th> 
                </tr>
              </thead>
              <tbody>
                {filteredCurriculum.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500 font-['Inter']">
                      No courses found for this semester.
                    </td>
                  </tr>
                ) : (
                  filteredCurriculum.flatMap(sem => sem.courses).map((course, index) => {
                    const isSelected = selectedCourses.find(c => c.id === course.id);
                    const isPetitioned = isSelected?.isPetitioned || false;
                    
                    let rowClass = "transition-colors cursor-pointer border-b border-stone-200 ";
                    
                    if (isPetitioned) {
                      rowClass += "bg-purple-100 hover:bg-purple-200 border-purple-200"; 
                    } else if (!isSelected) {
                      rowClass += "bg-white hover:bg-gray-50"; 
                    } else if (isSelected.status === 'passed') {
                      rowClass += "bg-[#10B981]/15 hover:bg-[#10B981]/25 border-[#10B981]/20"; 
                    } else if (isSelected.status === 'ongoing') {
                      rowClass += "bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 border-[#F59E0B]/20"; 
                    }

                    return (
                      <tr 
                        key={course.id} 
                        onClick={() => toggleCourse(course)}
                        className={rowClass}
                      >
                        <td className={`py-3 px-4 text-center font-bold ${isPetitioned ? 'text-purple-600' : 'text-gray-500'}`}>{index + 1}</td>
                        <td className={`py-3 px-4 font-bold whitespace-nowrap ${isPetitioned ? 'text-purple-900' : 'text-[#003366]'}`}>{course.code}</td>
                        <td className={`py-3 px-4 font-['Caladea'] ${isPetitioned ? 'text-purple-900 font-medium' : 'text-gray-800'}`}>{course.title}</td>
                        <td className="py-3 px-4 text-center font-bold text-gray-700">{course.units}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{course.prereq || 'None'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{course.coreq || 'None'}</td>
                        <td className="py-3 px-4 text-center">
                          {!isSelected ? (
                            <span className="whitespace-nowrap inline-block text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
                              Pending
                            </span>
                          ) : isSelected.status === 'passed' ? (
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
                            onClick={(e) => togglePetition(course, e)}
                            disabled={!isSelected} 
                            className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all shadow-sm whitespace-nowrap ${
                              !isSelected 
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                : isPetitioned 
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

      </div>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-stone-300 p-3 md:p-4 lg:p-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
        <div className="w-full max-w-[1440px] mx-auto flex flex-row items-center justify-between gap-2 px-1 lg:px-[90px]">
          
          <div className="text-black/70 text-[11px] sm:text-xs lg:text-lg font-['Caladea'] whitespace-nowrap shrink overflow-hidden text-ellipsis">
            <span className="md:hidden font-bold">
              {enrolledCoursesCount} Enrolled | Yr {yearStanding}
            </span>
            
            <span className="hidden md:inline">
              {enrolledCoursesCount === 0 
                ? "0 Courses Currently Enrolled" 
                : `${enrolledCoursesCount} Courses Currently Enrolled`} 
              <span className="mx-2">|</span> 
              <span className="font-bold text-[#003366]">Standing: Year {yearStanding}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 md:px-6 md:py-2.5 rounded-lg md:rounded-xl border border-stone-300 text-black font-['Caladea'] text-xs md:text-base hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
            <button 
              onClick={handleSaveSetup} 
              className="px-4 py-1.5 md:px-8 md:py-2.5 rounded-lg md:rounded-xl bg-[#003366] text-white font-['Caladea'] text-xs md:text-base hover:bg-[#002244] hover:shadow-lg transition-all"
            >
              <span className="md:hidden">Save</span>
              <span className="hidden md:inline">Complete SetUp</span>
            </button>
          </div>

        </div>
      </div>

    </main>
  );
};

export default Setup;