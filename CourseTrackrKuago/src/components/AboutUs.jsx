import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#F4F7FA] font-sans pb-24">
      
      {/* Header */}
      <header className="w-full h-[90px] flex items-center shadow-md z-50 shrink-0 bg-gradient-to-r from-[#001A33] to-[#004080]">
        <div className="w-full max-w-[1440px] mx-auto flex items-center px-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-[#FFCC00] transition-colors font-['Inter'] font-bold"
          >
            <span>←</span> Back
          </button>
        </div>
      </header>

      {/* Content Container */}
      <div className="w-full max-w-4xl mx-auto px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-12">
          
          {/* Title Section */}
          <div className="border-b-2 border-gray-100 pb-8 mb-8 text-center">
            <h1 className="text-[#003366] text-4xl lg:text-5xl font-bold font-['Calistoga'] m-0">
              About Us
            </h1>
            <p className="text-[#003366]/70 text-lg lg:text-xl italic font-['Calistoga'] mt-3">
              Welcome to CourseTrackr, your ultimate academic compass.
            </p>
          </div>

          {/* Body Content */}
          <div className="flex flex-col gap-10 font-['Inter'] text-gray-600 leading-relaxed">
            
            {/* Intro */}
            <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto">
              Navigating university life and planning your academic future can be overwhelming. Between deciphering prerequisite chains, balancing credit loads, and figuring out which classes align with your degree, it is easy to feel lost in the system. That is exactly why we built CourseTrackr.
            </p>

            {/* Mission & Vision Grid */}
            <div className="grid md:grid-cols-2 gap-8 mt-4">
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <h2 className="text-[#003366] text-2xl font-bold font-['Calistoga'] mb-3 flex items-center gap-2">
                  <span>🎯</span> Our Mission
                </h2>
                <p>
                  Our mission is to empower students to take control of their educational journey. We aim to eliminate the confusion and stress of course enrollment by providing smart, personalized course suggestions that keep you confidently on track for graduation.
                </p>
              </div>
              
              <div className="bg-yellow-50/50 p-6 rounded-2xl border border-yellow-100">
                <h2 className="text-[#003366] text-2xl font-bold font-['Calistoga'] mb-3 flex items-center gap-2">
                  <span>🔭</span> Our Vision
                </h2>
                <p>
                  We envision a campus environment where no student is delayed or discouraged by administrative hurdles or curriculum confusion. By leveraging technology to map out clear academic pathways, we want to help every student graduate on time and with a schedule tailored to their unique academic goals.
                </p>
              </div>
            </div>

            {/* What We Do */}
            <section className="flex flex-col gap-4 mt-2">
              <h2 className="text-[#003366] text-3xl font-bold font-['Calistoga']">What We Do</h2>
              <p>CourseTrackr is designed to act as a personalized academic advisor right in your pocket. Here is how we help you succeed:</p>
              
              <div className="grid gap-4 mt-2">
                <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="bg-[#003366] text-[#FFCC00] w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <strong className="text-[#003366] block mb-1">Smart Suggestions:</strong>
                    We analyze your completed courses, current standing, and degree program to recommend the best classes for your upcoming semesters.
                  </div>
                </div>
                <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="bg-[#003366] text-[#FFCC00] w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <strong className="text-[#003366] block mb-1">Prerequisite Tracking:</strong>
                    We map out exactly what you need to take before enrolling in advanced subjects, ensuring you never hit a roadblock.
                  </div>
                </div>
                <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="bg-[#003366] text-[#FFCC00] w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <strong className="text-[#003366] block mb-1">Pathway Planning:</strong>
                    We help you visualize your route to graduation with clear, step-by-step course sequences.
                  </div>
                </div>
                <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="bg-[#003366] text-[#FFCC00] w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <strong className="text-[#003366] block mb-1">Empowered Decisions:</strong>
                    By laying out all your viable options, we give you the data you need to build a schedule that works for you.
                  </div>
                </div>
              </div>
            </section>

            {/* The Team */}
            <section className="flex flex-col gap-4 mt-4 border-t-2 border-gray-100 pt-10">
              <h2 className="text-[#003366] text-3xl font-bold font-['Calistoga'] text-center">The Team Behind CourseTrackr</h2>
              <p className="text-center max-w-3xl mx-auto">
                We are a passionate group of developers, designers, and—most importantly—fellow students. We experienced the frustration of manual course planning firsthand, which inspired us to build a seamless solution not just for ourselves, but for the entire student body. We are dedicated to continuously improving CourseTrackr to make your academic life as stress-free as possible.
              </p>
            </section>

            {/* Closing Quote */}
            <div className="mt-8 text-center bg-[#003366] py-8 px-6 rounded-2xl shadow-inner">
              <p className="text-[#FFCC00] text-xl lg:text-2xl font-bold font-['Calistoga'] m-0">
                "Your journey, mapped. Your future, tracked."
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
};

export default AboutUs;