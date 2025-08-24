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
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && (!isAuthenticated || role !== 'candidate')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} />
        <div className="text-center mt-4">
          <Link to="/jobs" className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition">
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 font-inter">
      {/* Welcome */}
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
        Welcome, <span className="text-blue-600">{user?.email || 'Candidate'}</span>!
      </h2>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow p-6 mb-10 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Profile</h3>
        <p className="text-gray-700 mb-2"><strong>Email:</strong> {user?.email}</p>
        <p className="text-gray-700 mb-4"><strong>User ID:</strong> {user?.id}</p>
        <button
          onClick={() => alert("Profile editing functionality coming soon!")}
          className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition"
        >
          Edit Profile
        </button>
      </div>

      {/* Saved Jobs */}
      <div className="bg-white rounded-2xl shadow p-6 mb-10 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Your Saved Jobs</h3>
        {savedJobs.length === 0 ? (
          <p className="text-gray-600">
            You haven't saved any jobs yet. <Link to="/jobs" className="text-blue-600 hover:underline">Browse jobs</Link> to find some!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {savedJobs.map((job) => (
              job.job && (
                <div key={job.job_id} className="bg-gray-50 p-5 rounded-xl shadow-sm border flex flex-col justify-between">
                  <div>
                    <Link
                      to={`/jobs/${job.job_id}`}
                      className="text-lg font-semibold text-blue-600 hover:underline"
                    >
                      {job.job.title}
                    </Link>
                    <p className="text-gray-600">{job.job.company_name}</p>
                    <p className="text-gray-500 text-sm">Saved: {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleUnsaveJob(job.job_id)}
                    className="mt-3 px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm self-start"
                  >
                    Unsave
                  </button>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Applied Jobs */}
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Your Applied Jobs</h3>
        {appliedJobs.length === 0 ? (
          <p className="text-gray-600">You haven't applied for any jobs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {appliedJobs.map((job) => (
              job.job && (
                <div key={job.job_id} className="bg-gray-50 p-5 rounded-xl shadow-sm border">
                  <Link
                    to={`/jobs/${job.job_id}`}
                    className="text-lg font-semibold text-blue-600 hover:underline"
                  >
                    {job.job.title}
                  </Link>
                  <p className="text-gray-600">{job.job.company_name}</p>
                  <p className="text-gray-500 text-sm">Applied: {new Date(job.applied_at).toLocaleDateString()}</p>
                  
                  {/* Status Badge */}
                  <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full 
                    ${job.application_status === 'Hired' ? 'bg-green-100 text-green-700' : 
                      job.application_status === 'Rejected' ? 'bg-red-100 text-red-600' : 
                      'bg-gray-100 text-gray-600'}`}>
                    {job.application_status}
                  </span>
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
