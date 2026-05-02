import React, { useState, useEffect } from 'react';

// Sections
import { StudentDashboardHeaderSection } from "./StudentDashboardHeaderSection";
import { WelcomeMessageSection } from "./WelcomeMessageSection";

import { CompletedCoursesStatsSection } from './CompletedCourseStatSection';
import { OngoingCoursesStatsSection } from './OngoingCourseStatSection';
import { UnitsCompletedStatsSection } from './UnitsCompletedStatSection';
import { CurrentSemesterCourseListSection } from './CurrentSemesterCourseListSection';
import { ActiveCourseManagerSection } from './ActiveCourseManagerSection';

const API_BASE = "http://localhost:5000/api";

export const DashBoard = () => {
  const [myCourses, setMyCourses] = useState([]);

  // 🔹 Helper: Get current user
  const getCurrentUser = () => {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  };

  // 🔹 Fetch data
  const fetchMyData = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      const response = await fetch(`${API_BASE}/student-records/${currentUser.id}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      
      // 🚨 THE FIX: Merge dual records so the Dashboard knows which ones are petitioned
      const courseMap = new Map();
      
      data.forEach(record => {
        const id = Number(record.id || record.course_id);
        if (!courseMap.has(id)) {
          // Initialize with base data
          courseMap.set(id, { ...record, status: 'pending', isPetitioned: false });
        }
        
        const current = courseMap.get(id);
        if (record.status === 'petitioned') {
          current.isPetitioned = true;
        } else {
          current.status = record.status; // 'passed' or 'ongoing'
        }
      });

      // Convert the map back to a clean array of courses
      const mergedRecords = Array.from(courseMap.values());
      
      setMyCourses(mergedRecords);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  // 🔹 Load on mount
  useEffect(() => {
    fetchMyData();
  }, []);

  // 🔹 Update course progress
  const handleUpdateProgress = async (courseId) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      const response = await fetch(`${API_BASE}/update-progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          course_id: courseId,
          new_status: "passed",
        }),
      });

      if (!response.ok) throw new Error("Update failed");

      alert("Course updated to Completed!");
      fetchMyData(); // ✅ auto-refresh dashboard
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Failed to update progress.");
    }
  };

  // 🔹 Derived data (cleaner + reusable)
  const completedCourses = myCourses.filter(c => c.status === "passed");
  
  // This will cleanly grab courses that are 'ongoing' (even if they also have isPetitioned: true attached!)
  const ongoingCourses = myCourses.filter(c => c.status === "ongoing");

  const completedCount = completedCourses.length;
  const ongoingCount = ongoingCourses.length;
  const unitsCompletedCount = completedCourses.reduce(
    (total, course) => total + course.units,
    0
  );

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#F4F7FA] font-sans">
      <StudentDashboardHeaderSection />

      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-[58px] mt-8 flex flex-col gap-10 pb-10">

        {/* Welcome */}
        <section aria-label="Welcome message">
          <WelcomeMessageSection />
        </section>

        {/* Stats */}
        <section aria-label="Dashboard statistics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <CompletedCoursesStatsSection count={completedCount} />
            <OngoingCoursesStatsSection count={ongoingCount} />
            <UnitsCompletedStatsSection count={unitsCompletedCount} />
          </div>
        </section>

        {/* Current Semester */}
        <section aria-label="Current semester course list">
          <CurrentSemesterCourseListSection courses={ongoingCourses} />
        </section>

        {/* Active Course Manager */}
        <section aria-label="Active course manager">
          <ActiveCourseManagerSection
            courses={ongoingCourses}
            onMarkCompleted={handleUpdateProgress}
          />
        </section>

      </div>
    </main>
  );
};

export default DashBoard;