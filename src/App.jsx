import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/common/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';

import HomePage from './pages/HomePage'; // This now IS your main job listing page
import JobDetailPage from './pages/JobDetailPage';
import ApplyFormPage from './pages/ApplyFormPage';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostJobPage from './pages/PostJobPage';
import ManageApplicationsPage from './pages/ManageApplicationsPage';
import Footer from './pages/Footer';

function App() {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-background font-inter">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Loading user session...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-linkedin-black flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* The root path now directly shows the job listing with search and filters */}
          <Route path="/" element={<HomePage />} />
          {/* Optional: If you want /jobs to also point to the same page */}
          <Route path="/jobs" element={<HomePage />} />

          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          <Route path="/apply/:jobId" element={<ApplyFormPage />} />

          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />

          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/post-job" element={<PostJobPage />} />
          <Route path="/recruiter/edit-job/:jobId" element={<PostJobPage />} />
          <Route path="/recruiter/manage-applications/:jobId" element={<ManageApplicationsPage />} />

          <Route path="*" element={<h1 className="text-center text-3xl font-bold mt-20 text-red-500">404: Page Not Found</h1>} />
        </Routes>
      </main>
      <Footer/>
    </div>
  );
}

export default App;