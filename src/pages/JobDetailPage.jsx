import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAuth } from '../hooks/useAuth';

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role, user, token } = useAuth(); // Destructure token from useAuth

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [message, setMessage] = useState(null); // State for the message
  const [messageType, setMessageType] = useState('error'); // 'error' or 'success'


  const showMessage = (msg, type = 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };


  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/jobs/${jobId}`);
        setJob(response.data);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.response?.data?.message || 'Failed to fetch job details. It might not exist or be active.');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    } else {
      setError('No job ID provided.');
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (isAuthenticated && role === 'candidate' && user?.id && job) {
        try {
          const response = await api.get(`/saved-jobs/${job.id}/status`);
          setIsSaved(response.data.isSaved);
        } catch (err) {
          console.error('Error checking saved job status:', err);
          setIsSaved(false);
        }
      } else {
        setIsSaved(false);
      }
    };
    if (!loading && job) {
      checkSavedStatus();
    }
  }, [job, isAuthenticated, role, user, loading]);

  const handleApplyNow = () => {
    // --- THIS IS THE KEY CHANGE ---
    if (role === 'recruiter') {
        showMessage('Error! Recruiters cannot apply for jobs.');
        setTimeout(() => {
            navigate('/jobs');
        }, 1500); // Redirect after 1.5 seconds
        return; // Stop the function here
    }

    if (job?.application_mode === 'external' && job?.external_apply_link) {
      window.open(job.external_apply_link, '_blank');
    } else if (job?.application_mode === 'internal') {
      navigate(`/apply/${job.id}`);
    } else {
      alert('Application mode or link is not correctly configured.');
    }
  };

  const handleSaveJob = async () => {
    if (!isAuthenticated || role !== 'candidate') {
      setSaveError("Please log in as a candidate to save jobs.");
      return;
    }
    setSaveLoading(true);
    setSaveError(null);
    try {
      await api.post('/saved-jobs', { jobId: job.id });
      setIsSaved(true);
    } catch (err) {
      console.error('Error saving job:', err);
      setSaveError(err.response?.data?.message || 'Failed to save job.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUnsaveJob = async () => {
    if (!isAuthenticated || role !== 'candidate') {
      setSaveError("Please log in as a candidate to unsave jobs.");
      return;
    }
    setSaveLoading(true);
    setSaveError(null);
    try {
      await api.delete(`/saved-jobs/${job.id}`);
      setIsSaved(false);
    } catch (err) {
      console.error('Error unsaving job:', err);
      setSaveError(err.response?.data?.message || 'Failed to unsave job.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8"><ErrorMessage message={error} /></div>;
  }

  if (!job) {
    return <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-300 text-lg">Job not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      {/* Conditionally render the message */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg text-white z-50 ${messageType === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {message}
        </div>
      )}
      <div className="card-container p-8">
        <h2 className="text-4xl font-bold text-primary-700 dark:text-primary-400 mb-4">{job.title}</h2>

        <div className="flex flex-wrap gap-3 mb-6">
          <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-primary-900 dark:text-primary-200">{job.job_type}</span>
          <span className="bg-accent-green-100 text-accent-green-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-accent-green-900 dark:text-accent-green-200">{job.experience_level}</span>
          <span className="bg-primary-200 text-primary-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-primary-800 dark:text-primary-200">{job.location}</span>
          {job.salary_range_min && (
            <span className="bg-accent-yellow-100 text-accent-yellow-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-accent-yellow-900 dark:text-accent-yellow-200">${job.salary_range_min} - ${job.salary_range_max}</span>
          )}
        </div>

        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">Job Description</h3>
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
          <p>{job.description}</p>
        </div>

        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">Required Skills</h3>
        <div className="flex flex-wrap gap-2 mb-8">
          {job.skills_required && job.skills_required.map(skill => (
            <span key={skill} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-md dark:bg-gray-700 dark:text-gray-300">
              {skill}
            </span>
          ))}
        </div>

        {saveError && <ErrorMessage message={saveError} />}

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <button
            onClick={handleApplyNow}
            className="btn-primary px-10 py-4 text-xl font-bold transform hover:scale-105 transition-all duration-300 ease-in-out"
          >
            Apply Now
          </button>
          {isAuthenticated && role === 'candidate' && (
            <button
              onClick={isSaved ? handleUnsaveJob : handleSaveJob}
              className={`px-10 py-4 text-xl font-bold rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-card
                ${isSaved ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-200 dark:hover:bg-primary-800'}
              `}
              disabled={saveLoading}
            >
              {saveLoading ? <LoadingSpinner size="sm" color="gray" /> : (isSaved ? 'Saved!' : 'Save Job')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;