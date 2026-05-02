import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { curriculum } from '../data/curriculumData'; 

export const Setup = () => {
  const navigate = useNavigate();
  const isLocked = localStorage.getItem('setupLocked') === 'true'; 
  
  // -- EXISTING STATES --
  const [yearStanding, setYearStanding] = useState(() => {
    const savedUserStr = localStorage.getItem('currentUser');
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

  // -- FETCH LOGIC (UPDATED FOR DUAL RECORDS) --
  useEffect(() => {
    const fetchExistingSetup = async () => {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        alert("Session missing! Please log in to set up your account.");
        navigate('/login'); 
        return; 
      }
      const currentUser = JSON.parse(currentUserStr);

      try {
        const response = await fetch(`http://localhost:5000/api/student-records/${currentUser.id}`);
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
              if (record.status === 'petitioned') {
                current.isPetitioned = true;
              } else {
                current.status = record.status; 
              }
            });

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
    const matchedCourse = curriculum.flatMap(sem => sem.courses).find(c => c.id === selectedCourse.id);
    return sum + (matchedCourse ? matchedCourse.units : 0);
  }, 0);

  // 🚨 NEW: PREREQUISITE SCANNER HELPER
  const checkPrereqs = (prereqString) => {
    if (!prereqString || prereqString.toLowerCase() === 'none') return { met: true, missing: [] };
    
    // Split prereqs (e.g., "CPE111, MATH101")
    const prereqCodes = prereqString.split(',').map(s => s.trim().toUpperCase());
    const missing = [];

    prereqCodes.forEach(code => {
      // Ignore text-based rules like "3rd Year Standing" for now
      if (code.includes("YEAR") || code.includes("STANDING")) return;

      // Find the prerequisite course ID in the curriculum
      const pCourse = curriculum.flatMap(term => term.courses).find(c => c.code.toUpperCase() === code);
      
      if (pCourse) {
        // Check if this prereq is marked as 'passed' in the student's selections
        const isPassed = selectedCourses.some(c => c.id === pCourse.id && c.status === 'passed');
        if (!isPassed) missing.push(code);
      }
    });

    return { met: missing.length === 0, missing };
  };

  // 🚨 UPDATED: TOGGLE COURSE LOGIC (Secured Enrollment)
  const toggleCourse = (course) => {
    const existingCourseIndex = selectedCourses.findIndex(c => c.id === course.id);

    if (existingCourseIndex >= 0) {
      const existingCourse = selectedCourses[existingCourseIndex];
      
      if (existingCourse.status === 'passed') {
        
        // 🚨 SECURITY CHECK: Can they take this future course?
        const prereqCheck = checkPrereqs(course.prereq);
        
        if (prereqCheck.met) {
          // Allow Enrollment
          const updatedCourses = [...selectedCourses];
          updatedCourses[existingCourseIndex] = { ...existingCourse, status: 'ongoing' };
          setSelectedCourses(updatedCourses);
        } else {
          // Block Enrollment and cycle to removal
          alert(`Cannot enroll in ${course.code}.\nMissing completed prerequisites: ${prereqCheck.missing.join(', ')}`);
          setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
        }

      } 
      else if (existingCourse.status === 'ongoing') {
        setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
      }
    } else {
      // First click ALWAYS adds as 'passed' (Freely checking past progress)
      setSelectedCourses([...selectedCourses, { ...course, status: 'passed', isPetitioned: false }]);
    }
  };

  // -- TOGGLE PETITION LOGIC --
  const togglePetition = (course, e) => {
    e.stopPropagation(); 

    const existingCourseIndex = selectedCourses.findIndex(c => c.id === course.id);

    if (existingCourseIndex >= 0) {
      const updatedCourses = [...selectedCourses];
      updatedCourses[existingCourseIndex].isPetitioned = !updatedCourses[existingCourseIndex].isPetitioned;
      setSelectedCourses(updatedCourses);
    }
  };

  // -- SAVE LOGIC --
  // -- SAVE LOGIC (CLEAN SINGLE-ROW VERSION) --
  const handleSaveSetup = async () => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      alert("Error: You must be logged in to save your setup.");
      navigate('/login');
      return;
    }
    const currentUser = JSON.parse(currentUserStr);

    // 🚨 THE FIX: Just map the courses directly to the new database format!
    const formattedRecords = selectedCourses
      .filter(course => course.status) // Only save if it has a base status
      .map(course => ({
        course_id: course.id,
        status: course.status,
        is_petitioned: course.isPetitioned || false // Send the new boolean flag!
      }));

    try {
      const response = await fetch('http://localhost:5000/api/records', {
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
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
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
            The academic setup is currently closed by the Admin. Please contact the registrar if you need to update your records.
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

      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-[90px] mt-6 flex flex-col gap-6">

        {/* 1. Shorter "Select Courses" Banner */}
        <section className="w-full bg-gradient-to-r from-[#001A33] to-[#004080] rounded-xl p-5 lg:p-6 flex flex-col md:flex-row items-center justify-between shadow-md text-center md:text-left">
          <div className="flex flex-col gap-1">
            <h2 className="text-white text-2xl lg:text-3xl font-normal font-['Calistoga'] m-0 drop-shadow-sm">
              Select Courses
            </h2>
            <p className="text-gray-200 text-base lg:text-lg font-light font-['Fjord'] m-0">
              You have selected <strong className="text-[#FFCC00]">{totalCourses}</strong> courses totaling <strong className="text-[#FFCC00]">{totalUnits}</strong> units
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-center">
            <span className="text-[#FFCC00] text-5xl lg:text-6xl font-extrabold font-['Inter'] leading-none drop-shadow-md">
              {totalCourses}
            </span>
          </div>
        </section>

        {/* 2. Standing Year Selection */}
        <section className="w-full bg-white rounded-xl border border-gray-200 p-5 lg:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-[#003366] text-lg lg:text-xl font-bold font-['Calistoga'] m-0">
              Current Year Standing
            </h3>
            <p className="text-gray-500 font-medium font-['Inter'] text-sm mt-1">
              Select your current academic level to help us personalize your track.
            </p>
          </div>
          <div className="relative w-full lg:w-48">
            <select
              value={yearStanding}
              onChange={(e) => {
                const val = Number(e.target.value);
                setYearStanding(val);
                setViewYear(val); 
              }}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-[#003366] font-bold font-['Inter'] text-sm py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] cursor-pointer shadow-sm"
            >
              {[1, 2, 3, 4, 5].map(year => (
                <option key={year} value={year}>
                  {year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#003366]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </section>

        {/* 3. Toggles for Curriculum Navigation */}
        <section className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
          <div className="flex p-1.5 bg-gray-100/80 rounded-2xl w-full md:w-auto border border-gray-200/60">
            {[1, 2, 3, 4].map(y => (
              <button
                key={y}
                onClick={() => handleYearTabClick(y)}
                className={`flex-1 md:flex-none px-4 md:px-8 py-2.5 rounded-xl font-bold font-['Inter'] text-sm transition-all duration-300 ${
                  viewYear === y 
                    ? 'bg-white text-[#003366] shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Year {y}
              </button>
            ))}
          </div>

          <div className="flex p-1.5 bg-gray-100/80 rounded-2xl w-full md:w-auto border border-gray-200/60">
            {['1st Semester', '2nd Semester', ...(viewYear === 2 ? ['Summer'] : [])].map(sem => (
              <button
                key={sem}
                onClick={() => setViewSemester(sem)}
                className={`flex-1 md:flex-none px-4 md:px-8 py-2.5 rounded-xl font-bold font-['Inter'] text-sm transition-all duration-300 ${
                  viewSemester === sem 
                    ? 'bg-white text-[#003366] shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {sem}
              </button>
            ))}
          </div>
        </section>

        {/* 4. Table Layout for Courses */}
        <section className="w-full bg-white rounded-xl border border-stone-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
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
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-stone-300 p-4 lg:p-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-2 lg:px-[90px]">
          
          <div className="text-black/70 text-base lg:text-lg font-['Caladea']">
            {totalCourses === 0 ? "No Course Selected Yet" : `${totalCourses} Courses Selected`} 
            <span className="hidden md:inline mx-2">|</span> 
            <span className="font-bold text-[#003366] block md:inline mt-1 md:mt-0">Standing: Year {yearStanding}</span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-stone-300 text-black font-['Caladea'] hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
            <button 
              onClick={handleSaveSetup} 
              className="flex-1 md:flex-none px-8 py-2.5 rounded-xl bg-[#003366] text-white font-['Caladea'] hover:bg-[#002244] hover:shadow-lg transition-all"
            >
              Complete SetUp
            </button>
          </div>

        </div>
      </div>

    </main>
  );
};

export default Setup;