import React, { useState } from 'react';

export const EditStudentProfileModal = ({ student, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    first_name: student.firstName || '',
    last_name: student.lastName || '',
    school_id: student.studentId || '',
    email: student.email || '',
    year_standing: student.yearLevel || 1
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`http://localhost:5000/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        onRefresh(); // Refresh the Admin Dashboard list
        onClose();   // Close the modal
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Database connection error.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-[#003366] text-xl font-bold font-['Calistoga'] m-0">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-xl">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
          
          {/* FIX: Stacked vertically instead of side-by-side to prevent stretching */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase font-['Inter']">First Name</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] font-['Inter'] text-sm" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase font-['Inter']">Last Name</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] font-['Inter'] text-sm" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase font-['Inter']">School ID</label>
            <input type="text" name="school_id" value={formData.school_id} onChange={handleChange} required className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] font-['Inter'] text-sm" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase font-['Inter']">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] font-['Inter'] text-sm" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase font-['Inter']">Year Level</label>
            <select name="year_standing" value={formData.year_standing} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] font-['Inter'] text-sm bg-white">
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-bold font-['Inter'] transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-5 py-2 bg-[#FFCC00] hover:bg-[#E6B800] text-[#001A33] rounded-lg text-sm font-bold font-['Inter'] transition-colors shadow-sm disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};