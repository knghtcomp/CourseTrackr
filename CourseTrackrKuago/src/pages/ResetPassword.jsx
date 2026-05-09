import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout'; 

export const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // This grabs the token from the URL (e.g., /reset-password/abcdef123456)
  const { token } = useParams(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return setMessage("Passwords do not match!");
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password successfully reset! You can now log in.");
        navigate('/'); // Send them to login page
      } else {
        setMessage(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[440px]">
        <div className="mb-6">
          <h2 className="text-[32px] lg:text-[38px] font-bold text-[#003366] leading-tight mb-1 font-['Calistoga'] tracking-tight">
            Create New Password
          </h2>
          <p className="text-[#003366] font-bold text-sm lg:text-base font-['Calistoga']">
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full h-[44px] px-5 bg-[#E9EBEF] rounded-2xl outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base border border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-[44px] px-5 bg-[#E9EBEF] rounded-2xl outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base border border-transparent transition-all"
            />
          </div>

          {message && <p className="text-red-500 text-sm font-bold mt-2">{message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[48px] bg-[#003366] text-white text-[16px] lg:text-[18px] font-bold rounded-2xl mt-5 hover:bg-[#002244] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 transition-all duration-200 font-['Calistoga'] tracking-wider shadow-md uppercase"
          >
            {isLoading ? "Updating..." : "Save Password"}
          </button>
          
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;