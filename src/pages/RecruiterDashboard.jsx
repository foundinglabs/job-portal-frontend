import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const RecruiterDashboard = () => {
  const { user, isAuthenticated, role, companyId, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [jobsPosted, setJobsPosted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobsPostedByCompany = async () => {
      if (!isAuthenticated || role !== 'recruiter' || !companyId) {
        setLoading(false);
        if (isAuthenticated && role !== 'recruiter') {
            setError("Access denied. Only recruiters can view this dashboard.");
            navigate('/');
        } else if (isAuthenticated && !companyId) {
            setError("Your recruiter profile is not fully set up (missing company ID). Please contact support or re-register as recruiter.");
            navigate('/jobs');
        } else {
            setError("Please log in as a recruiter associated with a company to view this dashboard.");
            navigate('/');
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/jobs', { params: { company_id: companyId } });
        setJobsPosted(response.data);
      } catch (err) {
        console.error('Error fetching jobs posted by company:', err);
        setError(err.response?.data?.message || 'Failed to load jobs posted by your company.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchJobsPostedByCompany();
    }
  }, [isAuthenticated, role, companyId, authLoading, navigate]);

  const handleViewApplications = (jobId) => {
    navigate(`/recruiter/manage-applications/${jobId}`);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job? This will soft-delete it and it will no longer be visible to candidates.")) return;

    setLoading(true);
    setError(null);
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobsPosted(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
      setError(err.response?.data?.message || 'Failed to delete job.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>;
  }

  if (error && (!isAuthenticated || role !== 'recruiter')) {
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
        Recruiter Dashboard
      </h2>

      <div className="card-container mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Your Company Overview</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-2">Email: {user?.email}</p>
        <p className="text-gray-700 dark:text-gray-300 mb-2">User ID: {user?.id}</p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Associated Company ID: {companyId || 'N/A'}</p>
      </div>

      <div className="card-container">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Jobs You've Posted</h3>
        {jobsPosted.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">You haven't posted any jobs yet. <Link to="/recruiter/post-job" className="text-primary-600 hover:underline">Post your first job!</Link></p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobsPosted.map((job) => (
              <div key={job.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h4 className="text-lg font-semibold text-primary-600 dark:text-primary-400">{job.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{job.location} ({job.job_type})</p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs">Posted: {new Date(job.created_at).toLocaleDateString()}</p>
                  <p className={`text-sm font-medium ${job.is_active ? 'text-accent-green-600' : 'text-accent-red-600'}`}>
                    Status: {job.is_active ? 'Active' : 'Inactive (Deleted)'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
                  <button
                    onClick={() => handleViewApplications(job.id)}
                    className="btn-primary px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600"
                  >
                    View Applications
                  </button>
                  <Link
                    to={`/recruiter/edit-job/${job.id}`}
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="px-4 py-2 bg-accent-red text-white rounded-lg hover:bg-accent-red-600 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;