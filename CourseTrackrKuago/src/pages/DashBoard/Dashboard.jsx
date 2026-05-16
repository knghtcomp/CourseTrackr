import React, { useState, useEffect } from 'react';
import { StudentDashboardHeaderSection } from "./StudentDashboardHeaderSection";
import { WelcomeMessageSection } from "./WelcomeMessageSection";
import { CompletedCoursesStatsSection } from './CompletedCourseStatSection';
import { OngoingCoursesStatsSection } from './OngoingCourseStatSection';
import { UnitsCompletedStatsSection } from './UnitsCompletedStatSection';
import { CurrentSemesterCourseListSection } from './CurrentSemesterCourseListSection';
import { ActiveCourseManagerSection } from './ActiveCourseManagerSection';

export const DashBoard = () => {
  const [myCourses, setMyCourses] = useState([]);

  // 🔹 Helper: Get current user
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('studentUser');
    return userStr ? JSON.parse(userStr) : null;
  };

  // 🔹 Fetch data
  const fetchMyData = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      // ✅ FIX 1: Using backticks instead of double quotes so the API URL works perfectly
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student-records/${currentUser.id}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      
      // ✅ FIX 2: Our backend is super smart now! It sends perfect data, 
      // so we skip the messy mapping and drop it straight into state.
      setMyCourses(data);
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
      // ✅ FIX 3: Backticks here too
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/update-progress`, {
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
      fetchMyData(); // auto-refresh dashboard
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Failed to update progress.");
    }
  };

  // 🔹 Derived data (cleaner + reusable)
  const completedCourses = myCourses.filter(c => c.status === "passed");
  const ongoingCourses = myCourses.filter(c => c.status === "ongoing");

  const completedCount = completedCourses.length;
  const ongoingCount = ongoingCourses.length;
  
  // ✅ FIX 4: Wrap units in Number() so the math calculates perfectly
  const unitsCompletedCount = completedCourses.reduce(
    (total, course) => total + Number(course.units || 0),
    0
  );

  return (
// ... (keep the rest of your return component exactly as it is)
    <main className="flex flex-col w-full min-h-screen bg-[#F4F7FA] font-sans">
      <StudentDashboardHeaderSection />

      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-[58px] mt-4 md:mt-8 flex flex-col gap-6 md:gap-10 pb-6 md:pb-10">

        {/* Welcome */}
        <section aria-label="Welcome message">
          <WelcomeMessageSection />
        </section>

        {/* Stats */}
        <section aria-label="Dashboard statistics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
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