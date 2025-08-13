import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const CandidateDashboard = () => {
  const { user, isAuthenticated, loading: authLoading, role } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !user?.id || role !== 'candidate') {
        setLoading(false);
        if (isAuthenticated && role !== 'candidate') {
          setError("Access denied. Only candidates can view this dashboard.");
          navigate('/jobs');
        } else {
          setError("Please log in as a candidate to view your dashboard.");
          navigate('/jobs');
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [savedJobsResponse, appliedJobsResponse] = await Promise.all([
          api.get('/saved-jobs'),
          api.get('/candidate/applied-jobs')
        ]);
        setSavedJobs(savedJobsResponse.data.data);
        setAppliedJobs(appliedJobsResponse.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user, authLoading, role, navigate]);

  const handleUnsaveJob = async (jobId) => {
    if (!isAuthenticated || !user?.id || role !== 'candidate') {
      setError("Please log in as a candidate to unsave jobs.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/saved-jobs/${jobId}`);
      setSavedJobs(prev => prev.filter(job => job.job_id !== jobId));
      setLoading(false);
    } catch (err) {
      console.error('Error unsaving job:', err);
      setError(err.response?.data?.message || 'Failed to unsave job.');
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>;
  }

  if (error && (!isAuthenticated || role !== 'candidate')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} />
        <div className="text-center mt-4">
          <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
        Welcome, {user?.email || 'Candidate'}!
      </h2>

      <div className="card-container mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Your Profile</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-2">Email: {user?.email}</p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">User ID: {user?.id}</p>
        <button
          onClick={() => alert("Profile editing functionality coming soon!")}
          className="btn-secondary px-4 py-2"
        >
          Edit Profile
        </button>
      </div>

      <div className="card-container mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Your Saved Jobs</h3>
        {savedJobs.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">You haven't saved any jobs yet. <Link to="/jobs" className="text-primary-600 hover:underline">Browse jobs</Link> to find some!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedJobs.map((job) => (
              job.job && (
                <div key={job.job_id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm flex justify-between items-center">
                  <div>
                    <Link
                      to={`/jobs/${job.job_id}`}
                      className="text-lg font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {job.job.title}
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{job.job.company_name}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">Saved: {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleUnsaveJob(job.job_id)}
                    className="px-3 py-1 bg-accent-red text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Unsave
                  </button>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      <div className="card-container">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Your Applied Jobs</h3>
        {appliedJobs.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">You haven't applied for any jobs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appliedJobs.map((job) => (
              job.job && (
                <div key={job.job_id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm flex justify-between items-center">
                  <div>
                    <Link
                      to={`/jobs/${job.job_id}`}
                      className="text-lg font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {job.job.title}
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{job.job.company_name}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">Applied: {new Date(job.applied_at).toLocaleDateString()}</p>
                    <p className={`text-sm font-medium mt-1 ${job.application_status === 'Hired' ? 'text-accent-green-600' : job.application_status === 'Rejected' ? 'text-accent-red' : 'text-gray-500'}`}>
                      Status: {job.application_status}
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;