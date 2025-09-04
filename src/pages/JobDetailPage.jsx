import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, CalendarDays, Briefcase, TrendingUp, Link as LinkIcon, IndianRupee } from "lucide-react";
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role, user, loading: authLoading } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('error');

  const showMessage = (msg, type = 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 5000);
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

    if (jobId) fetchJob();
    else {
      setError('No job ID provided.');
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (isAuthenticated && role === 'candidate' && user?.id && job) {
        try {
          const response = await api.get(`/saved-jobs/check/${job.id}`);
          setIsSaved(response.data.isSaved);
        } catch (err) {
          if (err.response?.status !== 404) console.error('Error checking saved job status:', err);
          setIsSaved(false);
        }
      } else setIsSaved(false);
    };

    if (!loading && job) checkSavedStatus();
  }, [job, isAuthenticated, role, user, loading]);

  const handleApplyNow = () => {
    if (role === 'recruiter') {
      showMessage('Error! Recruiters cannot apply for jobs.');
      setTimeout(() => navigate('/jobs'), 1500);
      return;
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
      await api.post(`/saved-jobs`, { jobId: job.id });
      setIsSaved(true);
      showMessage('Job saved successfully!', 'success');
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
      showMessage('Job unsaved successfully!', 'success');
    } catch (err) {
      console.error('Error unsaving job:', err);
      setSaveError(err.response?.data?.message || 'Failed to unsave job.');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDescription = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-2">{line}</p>
    ));
  };

  if (authLoading || loading) return <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="container mx-auto px-4 py-8"><ErrorMessage message={error} /></div>;

  return (
    <div className="flex justify-center px-4 py-10 font-inter">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg text-white z-50 ${messageType === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {message}
        </div>
      )}
      <div className="w-full max-w-4xl p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        {/* Title */}
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">{job.title}</h2>

        {/* Metadata with icons */}
        <div className="flex flex-wrap gap-6 mb-6 justify-center text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-red-600" /> {job.location}</div>
          <div className="flex items-center"><Briefcase className="w-4 h-4 mr-2 text-blue-600" /> {job.job_type}</div>
          <div className="flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-green-600" /> Experience: {job.experience_level}</div>
          {job.salary_range_min && (
            <div className="flex items-center"><IndianRupee className="w-4 h-4 mr-2 text-yellow-600" /> Salary: ₹{job.salary_range_min} - ₹{job.salary_range_max}</div>
          )}
          <div className="flex items-center"><CalendarDays className="w-4 h-4 mr-2 text-gray-500" /> Posted at: {new Date(job.created_at).toLocaleDateString()}</div>
          {/* Company website link with an icon */}
          {job.company_website && (
            <a href={job.company_website} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 dark:text-primary-400 hover:underline">
              <LinkIcon className="w-4 h-4 mr-2 text-primary-500" /> {job.company_name}
            </a>
          )}
        </div>

        {/* Description */}
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">Job Description</h3>
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
          {formatDescription(job.description)}
        </div>

        {/* Skills */}
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">Required Skills</h3>
        <div className="flex flex-wrap gap-3 mb-10">
          {job.skills_required && job.skills_required.map((skill, index) => (
            <span
              key={index}
              className="px-4 py-1.5 text-sm font-medium rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              {skill}
            </span>
          ))}
        </div>

        {saveError && <ErrorMessage message={saveError} />}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10">
          <button
            onClick={handleApplyNow}
            className="px-10 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-md transition-all"
          >
            Apply Now
          </button>
          {isAuthenticated && role === 'candidate' && (
            <button
              onClick={isSaved ? handleUnsaveJob : handleSaveJob}
              className={`px-10 py-3 rounded-lg text-lg font-semibold shadow-md transition-all
                ${isSaved
                  ? 'bg-gray-500 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'}
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