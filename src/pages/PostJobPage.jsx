import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const PostJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role, loading: authLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [externalApplyLink, setExternalApplyLink] = useState('');
  const [applicationMode, setApplicationMode] = useState('internal');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (jobId) {
      setIsEditing(true);
      const fetchJobForEdit = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await api.get(`/jobs/${jobId}`);
          const job = response.data;
          setTitle(job.title);
          setDescription(job.description);
          setSkillsRequired(job.skills_required ? job.skills_required.join(', ') : '');
          setExperienceLevel(job.experience_level);
          setLocation(job.location);
          setJobType(job.job_type);
          setSalaryMin(job.salary_range_min || '');
          setSalaryMax(job.salary_range_max || '');
          setExternalApplyLink(job.external_apply_link || '');
          setApplicationMode(job.application_mode);
        } catch (err) {
          console.error('Error fetching job for edit:', err);
          setError(err.response?.data?.message || 'Failed to load job for editing.');
        } finally {
          setLoading(false);
        }
      };
      fetchJobForEdit();
    } else {
      setIsEditing(false);
      setLoading(false);
      setTitle(''); setDescription(''); setSkillsRequired(''); setExperienceLevel('');
      setLocation(''); setJobType(''); setSalaryMin(''); setSalaryMax('');
      setExternalApplyLink(''); setApplicationMode('internal');
    }
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!title || !description || !experienceLevel || !location || !jobType || (applicationMode === 'external' && !externalApplyLink)) {
        setError('Please fill in all required fields.');
        setSubmitting(false);
        return;
    }

    if (!isAuthenticated || role !== 'recruiter') {
      setError("You must be logged in as a recruiter to post/edit jobs.");
      setSubmitting(false);
      return;
    }

    const jobData = {
      title,
      description,
      skills_required: skillsRequired.split(',').map(s => s.trim()).filter(s => s),
      experience_level: experienceLevel,
      location,
      job_type: jobType,
      salary_range_min: salaryMin ? parseFloat(salaryMin) : null,
      salary_range_max: salaryMax ? parseFloat(salaryMax) : null,
      external_apply_link: externalApplyLink || null,
      application_mode: applicationMode,
    };

    try {
      let response;
      if (isEditing) {
        response = await api.put(`/jobs/${jobId}`, jobData);
        setSuccessMessage('Job updated successfully!');
      } else {
        response = await api.post('/jobs', jobData);
        setSuccessMessage('Job posted successfully!');
        setTitle(''); setDescription(''); setSkillsRequired(''); setExperienceLevel('');
        setLocation(''); setJobType(''); setSalaryMin(''); setSalaryMax('');
        setExternalApplyLink(''); setApplicationMode('internal');
      }
      console.log('Job operation successful:', response.data);
      setTimeout(() => {
        setSuccessMessage(null);
        navigate('/recruiter/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Job operation error:', err);
      setError(err.response?.data?.message || 'Failed to perform job operation. Please check your inputs.');
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.join(', '));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (isEditing && loading)) {
    return <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>;
  }

  if (!isAuthenticated || role !== 'recruiter') {
    return <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-300 text-lg">Access Denied: Only recruiters can post or edit jobs. Please log in as a recruiter.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        {isEditing ? 'Edit Job Posting' : 'Post a New Job'}
      </h2>

      <div className="card-container max-w-3xl mx-auto">
        {error && <ErrorMessage message={error} />}
        {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative text-sm mb-4">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Job Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Job Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="7"
              required
              className="input-field"
            ></textarea>
          </div>
          <div>
            <label htmlFor="skillsRequired" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Skills Required (Comma-separated)</label>
            <input
              type="text"
              id="skillsRequired"
              value={skillsRequired}
              onChange={(e) => setSkillsRequired(e.target.value)}
              placeholder="e.g., React, Node.js, SQL"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Experience Level *</label>
            <select
              id="experienceLevel"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              required
              className="input-field"
            >
              <option value="">Select experience level</option>
              <option value="entry">Entry Level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Location *</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="e.g., Remote, San Francisco, CA"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Job Type *</label>
            <select
              id="jobType"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              required
              className="input-field"
            >
              <option value="">Select job type</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Min Salary (Optional)</label>
              <input
                type="number"
                id="salaryMin"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="e.g., 80000"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Max Salary (Optional)</label>
              <input
                type="number"
                id="salaryMax"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="e.g., 120000"
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label htmlFor="applicationMode" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Application Mode *</label>
            <select
              id="applicationMode"
              value={applicationMode}
              onChange={(e) => setApplicationMode(e.target.value)}
              required
              className="input-field"
            >
              <option value="internal">Internal Form (through Job Portal)</option>
              <option value="external">External Link (redirect to company site)</option>
            </select>
          </div>

          {applicationMode === 'external' && (
            <div>
              <label htmlFor="externalApplyLink" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">External Apply Link *</label>
              <input
                type="url"
                id="externalApplyLink"
                value={externalApplyLink}
                onChange={(e) => setExternalApplyLink(e.target.value)}
                required={applicationMode === 'external'}
                placeholder="https://company.com/careers/job-id"
                className="input-field"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full text-lg font-semibold"
            disabled={submitting}
          >
            {submitting ? <LoadingSpinner size="sm" color="white" /> : (isEditing ? 'Update Job' : 'Post Job')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recruiter/dashboard')}
            className="btn-secondary w-full text-lg font-semibold mt-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJobPage;