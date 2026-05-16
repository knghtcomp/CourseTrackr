import React, { useState } from 'react';

export const StudentStatusSection = ({ students, onVerify, onEdit, onEditProfile, onArchive }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.includes(searchQuery)
  );

  // Helper function to force "Title Case" (e.g., "jOhN doE" -> "John Doe")
  const formatTitleCase = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    // MOBILE FIX: Scaled down outer padding (p-4) and tightened gaps (gap-4)
    <section className="w-full bg-white rounded-2xl md:rounded-3xl border border-black/10 p-4 md:p-6 lg:p-10 shadow-sm flex flex-col gap-4 md:gap-6">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 border-b-2 border-gray-100 pb-3 md:pb-4">
        {/* MOBILE FIX: Scaled down title text */}
        <h3 className="text-[#003366] text-xl md:text-2xl lg:text-3xl font-bold font-['Calistoga'] m-0">
          Student Status
        </h3>
        
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search ID or Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // MOBILE FIX: Slightly smaller padding on cell phones
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 md:py-2.5 px-4 pl-10 text-xs md:text-sm font-medium font-['Inter'] focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all"
          />
          <span className="absolute left-3 top-2 md:top-2.5 text-gray-400 text-sm md:text-base">🔍</span>
        </div>
      </div>

      {/* ==========================================
          MOBILE FIX: Slim Card List (Hidden on Desktop) 
      ========================================== */}
      <div className="block lg:hidden">
        {filteredStudents.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                
                {/* Top Row: Name, Email, and Year Badge */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col">
                    <span className="text-black font-bold font-['Inter'] text-base leading-tight">
                      {formatTitleCase(student.name)}
                    </span>
                    <span className="text-gray-500 font-medium font-['Inter'] text-xs mt-0.5">
                      {student.email ? student.email.toLowerCase() : 'No email'}
                    </span>
                  </div>
                  <span className="bg-[#003366]/10 text-[#003366] px-2.5 py-1 rounded-md font-bold font-['Inter'] text-[10px] uppercase tracking-wide shrink-0">
                    Year {student.yearLevel}
                  </span>
                </div>

                {/* Middle Row: Student ID & Edit Profile Pencil */}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <button 
                    onClick={() => onEditProfile(student)}
                    className="p-1.5 text-blue-500 bg-blue-100 hover:bg-blue-200 hover:text-blue-700 rounded-md transition-colors shadow-sm shrink-0"
                    title="Edit Student Profile"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <span className="text-[#003366] font-bold font-['Inter'] text-sm">
                    {student.studentId}
                  </span>
                </div>

                {/* Bottom Row: Action Buttons (Scaled Down Icons) */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button 
                    onClick={() => onEdit(student)}
                    className="bg-[#FFCC00] text-[#003366] py-2 rounded-lg text-base md:text-lg hover:brightness-110 transition-all shadow-sm flex justify-center items-center"
                    title="Edit Courses"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => onVerify(student)}
                    className="bg-[#003366] text-white py-2 rounded-lg text-base md:text-lg hover:bg-[#002244] transition-all shadow-sm flex justify-center items-center"
                    title="Verify Student"
                  >
                    👁️
                  </button>
                  <button 
                    onClick={() => onArchive(student)}
                    className="bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-base md:text-lg hover:bg-red-600 hover:text-white transition-all shadow-sm flex justify-center items-center"
                    title="Archive Student"
                  >
                    📦
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500 font-medium font-['Inter'] bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No students found matching your search.
          </div>
        )}
      </div>

      {/* ==========================================
          DESKTOP VIEW: Full Table (Hidden on Mobile)
      ========================================== */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-[#003366]/20">
              <th className="py-4 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-sm">Student ID</th>
              <th className="py-4 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-sm">Name</th>
              <th className="py-4 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-sm">Email</th>
              <th className="py-4 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-sm text-center">Year Level</th>
              <th className="py-4 px-4 text-[#003366] font-bold font-['Inter'] uppercase tracking-wider text-sm text-center">Admin Actions</th>
            </tr>
          </thead>
          
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  
                  {/* Student ID Column with Colored Pencil */}
                  <td className="py-4 px-4 text-[#003366] font-bold font-['Inter'] text-base whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => onEditProfile(student)}
                        className="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-md transition-colors border border-blue-100 shadow-sm shrink-0"
                        title="Edit Student Profile"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <span>{student.studentId}</span>
                    </div>
                  </td>

                  {/* Name column */}
                  <td className="py-4 px-4 text-black font-semibold font-['Inter'] text-base whitespace-nowrap">
                    {formatTitleCase(student.name)}
                  </td>
                  
                  {/* Email column */}
                  <td className="py-4 px-4 text-gray-600 font-medium font-['Inter'] text-sm">
                    {student.email ? student.email.toLowerCase() : ''}
                  </td>
                  
                  {/* Year Level Column */}
                  <td className="py-4 px-4 text-center">
                    <span className="bg-[#003366]/10 text-[#003366] px-3 py-1 rounded-md font-bold font-['Inter'] text-sm">
                      Year {student.yearLevel}
                    </span>
                  </td>
                  
                  {/* Admin Actions Column */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => onEdit(student)}
                        className="bg-[#FFCC00] text-[#003366] px-4 py-2 rounded-lg font-bold font-['Inter'] text-sm hover:brightness-110 transition-all shadow-sm"
                      >
                        Edit Courses
                      </button>
                      <button 
                        onClick={() => onVerify(student)}
                        className="bg-[#003366] text-white px-4 py-2 rounded-lg font-bold font-['Inter'] text-sm hover:bg-[#002244] transition-all shadow-sm flex items-center gap-2"
                      >
                        <span>👁️</span> Verify
                      </button>
                      <button 
                        onClick={() => onArchive(student)}
                        className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-bold font-['Inter'] text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                      >
                        <span>📦</span> Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 font-medium font-['Inter']">
                  No students found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default StudentStatusSection;