import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const ApplyFormPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobTitle, setJobTitle] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantLinkedIn, setApplicantLinkedIn] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchJobTitle = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/jobs/${jobId}`);
        setJobTitle(response.data.title);
      } catch (err) {
        console.error('Error fetching job title for apply form:', err);
        setError(err.response?.data?.message || 'Failed to load job for application.');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobTitle();
    } else {
      setError('No job selected for application.');
      setLoading(false);
    }
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!resumeFile) {
      setError('Please upload your resume.');
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('job_id', jobId);
    formData.append('applicant_name', applicantName);
    formData.append('applicant_email', applicantEmail);
    formData.append('applicant_phone', applicantPhone);
    formData.append('applicant_linkedin_url', applicantLinkedIn);
    formData.append('cover_letter_text', coverLetter);
    formData.append('resume', resumeFile);

    try {
      const response = await api.post('/applications/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMessage(response.data.message || 'Application submitted successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        navigate('/jobs');
      }, 2000);
    } catch (err) {
      console.error('Application submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.join(', ') || 'Failed to submit application due to validation errors.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>;
  }

  if (error && !jobTitle) {
    return <div className="container mx-auto px-4 py-8"><ErrorMessage message={error} /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">Apply for: {jobTitle}</h2>

      <div className="card-container max-w-2xl mx-auto">
        {error && <ErrorMessage message={error} />}
        {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative text-sm mb-4">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="applicantName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full Name *</label>
            <input
              type="text"
              id="applicantName"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="applicantEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email Address *</label>
            <input
              type="email"
              id="applicantEmail"
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="applicantPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              id="applicantPhone"
              value={applicantPhone}
              onChange={(e) => setApplicantPhone(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="applicantLinkedIn" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">LinkedIn Profile URL (Optional)</label>
            <input
              type="url"
              id="applicantLinkedIn"
              value={applicantLinkedIn}
              onChange={(e) => setApplicantLinkedIn(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Cover Letter (Optional)</label>
            <textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows="5"
              className="input-field"
            ></textarea>
          </div>
          <div>
            <label htmlFor="resumeFile" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Resume Upload * (PDF/DOCX)</label>
            <input
              type="file"
              id="resumeFile"
              onChange={(e) => setResumeFile(e.target.files[0])}
              accept=".pdf,.doc,.docx"
              required
              className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200 dark:file:bg-primary-900 dark:file:text-primary-200 dark:hover:file:bg-primary-800"
            />
            {resumeFile && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Selected file: {resumeFile.name}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full text-lg font-semibold"
            disabled={submitting}
          >
            {submitting ? <LoadingSpinner size="sm" color="white" /> : 'Submit Application'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/jobs/${jobId}`)}
            className="btn-secondary w-full text-lg font-semibold mt-2"
          >
            Back to Job Details
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyFormPage;