import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const ManageApplicationsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role, loading: authLoading } = useAuth();

  const [jobTitle, setJobTitle] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeApplicationId, setActiveApplicationId] = useState(null);

  const applicationStatuses = ['New', 'Shortlisted', 'Screened', 'Interview', 'Hired', 'Rejected'];

  useEffect(() => {
    const fetchApplications = async () => {
      if (!isAuthenticated || role !== 'recruiter' || !jobId) {
        setLoading(false);
        if (isAuthenticated && role !== 'recruiter') {
          setError("Access denied. Only recruiters can view this page.");
          navigate('/');
        } else {
          setError("Access denied or no job selected. Please log in as a recruiter and select a job.");
          navigate('/recruiter/dashboard');
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const jobResponse = await api.get(`/jobs/${jobId}`);
        setJobTitle(jobResponse.data.title);

        const appResponse = await api.get(`/applications/job/${jobId}`);
        setApplications(appResponse.data);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.response?.data?.message || 'Failed to load applications for this job.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && jobId) {
      fetchApplications();
    } else if (!jobId && !authLoading) {
      setError("No job ID provided to manage applications.");
      setLoading(false);
      navigate('/recruiter/dashboard');
    }
  }, [isAuthenticated, role, jobId, authLoading, navigate]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setActiveApplicationId(applicationId);
    setSubmitting(true);
    setError(null);
    try {
      const response = await api.patch(`/applications/${applicationId}/status`, {
        status: newStatus,
      });
      setApplications(prev => prev.map(app =>
        app.id === applicationId ? { ...app, application_status: response.data.application_status } : app
      ));
    } catch (err) {
      console.error('Error updating application status:', err);
      setError(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setSubmitting(false);
      setActiveApplicationId(null);
    }
  };

  const handleViewResume = async (applicationId) => {
    setActiveApplicationId(applicationId);
    setSubmitting(true);
    setError(null);
    try {
      const response = await api.get(`/applications/${applicationId}/resume`);
      window.open(response.data.url, '_blank');
    } catch (err) {
      console.error('Error getting signed URL for resume:', err);
      setError(err.response?.data?.message || 'Failed to get resume. It might not be available or you lack permission.');
    } finally {
      setSubmitting(false);
      setActiveApplicationId(null);
    }
  };


  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8"><ErrorMessage message={error} /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        Applications for: {jobTitle}
      </h2>

      <button
        onClick={() => navigate('/recruiter/dashboard')}
        className="btn-secondary mb-6 px-4 py-2"
      >
        &larr; Back to Dashboard
      </button>

      <div className="card-container">
        {applications.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">No applications received for this job yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-3 md:mb-0 md:w-1/3">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{app.applicant_name}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{app.applicant_email}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                  {app.match_percentage !== null && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Match: <span className="font-bold text-primary-600 dark:text-primary-400">{app.match_percentage.toFixed(2)}%</span></p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:w-2/3 md:justify-end">
                  <select
                    value={app.application_status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    disabled={submitting && activeApplicationId === app.id}
                    className="input-field text-sm px-3 py-2 sm:w-auto"
                  >
                    {applicationStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleViewResume(app.id)}
                    className="btn-primary px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600"
                    disabled={submitting && activeApplicationId === app.id}
                  >
                    {submitting && activeApplicationId === app.id ? <LoadingSpinner size="sm" color="white" /> : 'View Resume'}
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

export default ManageApplicationsPage;