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
    <section className="w-full bg-white rounded-3xl border border-black/10 p-6 lg:p-10 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-gray-100 pb-4">
        <h3 className="text-[#003366] text-2xl lg:text-3xl font-bold font-['Calistoga'] m-0">
          Student Status
        </h3>
        
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search ID or Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 pl-10 text-sm font-medium font-['Inter'] focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      <div className="overflow-x-auto">
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
                  {/* Example of how the name block might look in your table */}

                  {/* FIX: Student ID Column with Colored Pencil strictly on the left */}
                  <td className="py-4 px-4 text-[#003366] font-bold font-['Inter'] text-base whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {/* THE COLORED PENCIL BUTTON */}
                      <button 
                        onClick={() => onEditProfile(student)}
                        className="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-md transition-colors border border-blue-100 shadow-sm shrink-0"
                        title="Edit Student Profile"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      {/* THE STUDENT ID */}
                      <span>{student.studentId}</span>
                    </div>
                  </td>

                  {/* UNTOUCHED: Name column exactly as it originally was */}
                  <td className="py-4 px-4 text-black font-semibold font-['Inter'] text-base whitespace-nowrap">
                    {formatTitleCase(student.name)}
                  </td>
                  
                  {/* FIX: Forces the email to always be lowercase */}
                  <td className="py-4 px-4 text-gray-600 font-medium font-['Inter'] text-sm">
                    {student.email ? student.email.toLowerCase() : ''}
                  </td>
                  
                  <td className="py-4 px-4 text-center">
                    <span className="bg-[#003366]/10 text-[#003366] px-3 py-1 rounded-md font-bold font-['Inter'] text-sm">
                      Year {student.yearLevel}
                    </span>
                  </td>
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