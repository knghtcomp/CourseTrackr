import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout'; 

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Success! A password reset link has been sent to ${email}`);
        navigate('/'); // Send them back to login after success
      } else {
        setMessage(data.message || "Failed to send reset email.");
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
      <button 
        type="button"
        onClick={() => navigate('/')} 
        className="group absolute top-6 left-6 lg:top-10 lg:left-10 flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2.5 bg-gray-50 border border-gray-200 text-[#003366] rounded-full hover:bg-[#003366] hover:text-[#FFCC00] hover:border-[#003366] hover:shadow-md transition-all duration-300 z-50"
        aria-label="Back to Login"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 lg:h-5 lg:w-5 transition-transform duration-300 group-hover:-translate-x-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-bold font-['Inter'] text-sm lg:text-base tracking-wide">Back</span>
      </button>

      <div className="w-full max-w-[440px]">
        <div className="mb-6">
          <h2 className="text-[32px] lg:text-[38px] font-bold text-[#003366] leading-tight mb-1 font-['Calistoga'] tracking-tight">
            Forgot Password
          </h2>
          <p className="text-[#003366] font-bold text-sm lg:text-base font-['Calistoga']">
            Enter the email address of your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          
          <div>
            <label className="block text-black font-extrabold mb-1 font-['Calistoga'] text-sm lg:text-base tracking-wide">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              spellCheck="false"
              autoComplete="email"
              className="w-full h-[44px] px-5 bg-[#E9EBEF] rounded-2xl outline-none focus:ring-2 focus:ring-[#003366] font-['Fjord'] text-sm lg:text-base border border-transparent transition-all"
            />
          </div>

          {/* Show error message if the email doesn't exist */}
          {message && <p className="text-red-500 text-sm font-bold mt-2">{message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[48px] bg-[#003366] text-white text-[16px] lg:text-[18px] font-bold rounded-2xl mt-5 hover:bg-[#002244] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 transition-all duration-200 font-['Calistoga'] tracking-wider shadow-md uppercase"
          >
            {isLoading ? "Sending..." : "Reset Password"}
          </button>
          
        </form>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;