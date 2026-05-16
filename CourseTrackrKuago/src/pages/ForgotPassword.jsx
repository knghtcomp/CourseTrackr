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
      // 🚨 FRONTEND FIX: Add a 10-second timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: controller.signal // Link the timeout to the fetch
      });

      clearTimeout(timeoutId); // Clear the timeout if the server responds in time!

      // Safely parse the response (just in case the server crashes and sends HTML text instead of JSON)
      const contentType = response.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data.message = await response.text();
      }

      if (response.ok) {
        alert(`Success! A password reset link has been sent to ${email}`);
        navigate('/'); // Send them back to login after success
      } else {
        setMessage(data.message || "Failed to send reset email.");
      }
    } catch (error) {
      console.error("Error:", error);
      // Let the user know exactly WHY it failed
      if (error.name === 'AbortError') {
        setMessage("Request timed out. The server took too long to respond.");
      } else {
        setMessage("Could not connect to the server. Please check your internet or server connection.");
      }
    } finally {
      setIsLoading(false); // This will now ALWAYS run!
    }
  };

  return (
    <AuthLayout>
      <button 
        type="button"
        onClick={() => navigate('/')} 
        // MOBILE FIX: Shrunk to absolute minimum sizes for phones, pushed to very top-left corner (top-3 left-3).
        className="group absolute top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 lg:top-10 lg:left-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 py-1.5 sm:px-3 md:px-4 md:py-2 lg:px-5 lg:py-2.5 bg-gray-50 border border-gray-200 text-[#003366] rounded-full hover:bg-[#003366] hover:text-[#FFCC00] hover:border-[#003366] hover:shadow-md transition-all duration-300 z-50"
        aria-label="Back to Login"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          // MOBILE FIX: Tiny 12px icon on phones, standard size on desktop
          className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 transition-transform duration-300 group-hover:-translate-x-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {/* MOBILE FIX: Tiny text on phones, standard size on desktop */}
        <span className="font-bold font-['Inter'] text-[10px] sm:text-xs md:text-sm lg:text-base tracking-wide">Back</span>
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