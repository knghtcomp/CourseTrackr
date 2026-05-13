import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#F4F7FA] font-sans pb-24">
      
      {/* Simple Header */}
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
          <div className="border-b-2 border-gray-100 pb-8 mb-8">
            <h1 className="text-[#003366] text-3xl lg:text-4xl font-bold font-['Calistoga'] m-0">
              Privacy Policy for CourseTrackr
            </h1>
            <p className="text-gray-500 font-medium font-['Inter'] mt-3">
              Effective Date: <span className="text-[#003366] font-bold">May 20, 2026</span>
            </p>
          </div>

          {/* Body Content */}
          <div className="flex flex-col gap-8 font-['Inter'] text-gray-600 leading-relaxed">
            
            <p className="text-lg text-gray-700">
              Welcome to CourseTrackr. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the CourseTrackr application. 
              By accessing or using CourseTrackr, you consent to the data practices described in this policy, which aligns with the principles of the <strong className="text-[#003366]">Philippine Data Privacy Act of 2012 (Republic Act No. 10173)</strong>.
            </p>

            <section className="flex flex-col gap-3">
              <h2 className="text-[#003366] text-2xl font-bold font-['Calistoga']">1. Information We Collect</h2>
              <p>To effectively suggest future courses and map your academic progression, we collect specific types of information:</p>
              <ul className="list-disc pl-6 flex flex-col gap-2 mt-2">
                <li><strong className="text-gray-800">Personal Identification Information:</strong> This may include your name, student identification number, and institutional email address used to access your student account.</li>
                <li><strong className="text-gray-800">Academic History and Records:</strong> To function accurately, CourseTrackr requires data regarding your completed courses, current academic standing, fulfilled prerequisites, and enrolled programs.</li>
                <li><strong className="text-gray-800">Technical Data:</strong> We automatically collect certain information when you visit, use, or navigate the application. This includes device and usage information, such as your IP address, browser and device characteristics, operating system, and information about how and when you use our web application.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-[#003366] text-2xl font-bold font-['Calistoga']">2. How We Use Your Information</h2>
              <p>We use the personal and academic information collected primarily to operate and enhance the application. Specifically, we use your data to:</p>
              <ul className="list-disc pl-6 flex flex-col gap-2 mt-2">
                <li>Analyze your completed prerequisites and academic history to generate accurate, personalized course recommendations.</li>
                <li>Manage your student account and provide personalized application features.</li>
                <li>Ensure the technical functionality and security of the platform.</li>
                <li>Respond to your inquiries and provide user support.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-[#003366] text-2xl font-bold font-['Calistoga']">3. Data Storage and Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect the security of any personal information we process. Your data is stored securely in our databases, and we utilize standard encryption protocols to protect your academic records and login credentials from unauthorized access, use, or disclosure. However, please note that no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-[#003366] text-2xl font-bold font-['Calistoga']">4. Sharing Your Information</h2>
              <p>We do not sell, rent, or trade your personal or academic information to third parties. We may only share information in the following situations:</p>
              <ul className="list-disc pl-6 flex flex-col gap-2 mt-2">
                <li><strong className="text-gray-800">With Academic Institutions:</strong> Information may be synchronized or shared with your university or educational institution's official systems to verify prerequisites and standing, depending on the system's integration.</li>
                <li><strong className="text-gray-800">For Legal Obligations:</strong> We may disclose your information where we are legally required to do so to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-[#003366] text-2xl font-bold font-['Calistoga']">5. Your Data Privacy Rights</h2>
              <p>Under the Data Privacy Act of 2012, you possess certain rights regarding your personal data:</p>
              <ul className="list-disc pl-6 flex flex-col gap-2 mt-2">
                <li><strong className="text-gray-800">Right to be Informed:</strong> You have the right to know whether your personal data is being, or has been, processed.</li>
                <li><strong className="text-gray-800">Right to Access:</strong> You can request access to the personal data we hold about you.</li>
                <li><strong className="text-gray-800">Right to Rectification:</strong> You have the right to dispute any inaccuracy or error in your personal data and have us correct it immediately.</li>
                <li><strong className="text-gray-800">Right to Erasure or Blocking:</strong> You have the right to suspend, withdraw, or order the blocking, removal, or destruction of your personal data from our systems.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-[#003366] text-2xl font-bold font-['Calistoga']">6. Changes to this Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes to our practices or for other operational, legal, or regulatory reasons. The updated version will be indicated by an updated "Effective Date" at the top of this document.
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;