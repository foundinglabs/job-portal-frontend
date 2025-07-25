// src/pages/HomePage.jsx - This is now your main job listing page with search and filters

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const HomePage = () => { // Renamed from JobsPage to HomePage
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    role: '',
    location: '',
    type: '',
    experience: '',
  });

  // Debounce filter changes to avoid too many API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      const fetchJobs = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await api.get('/jobs', { params: filters });
          setJobs(response.data);
        } catch (err) {
          console.error('Error fetching jobs:', err);
          setError(err.response?.data?.message || 'Failed to fetch jobs. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchJobs();
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      role: '',
      location: '',
      type: '',
      experience: '',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">Explore Job Opportunities</h2>

      {/* Filters Section (Search Bar & Dropdowns) */}
      <div className="card-container mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Job Title / Role</label>
            <input
              type="text"
              name="role"
              id="role"
              value={filters.role}
              onChange={handleFilterChange}
              placeholder="e.g., Software Engineer"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Location</label>
            <input
              type="text"
              name="location"
              id="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="e.g., Remote, New York"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Job Type</label>
            <select
              name="type"
              id="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Experience Level</label>
            <select
              name="experience"
              id="experience"
              value={filters.experience}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All</option>
              <option value="entry">Entry Level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleClearFilters}
            className="btn-secondary px-4 py-2"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner size="lg" />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && jobs.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-300 text-lg">No jobs found matching your criteria.</p>
      )}

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className="card-container flex flex-col justify-between cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            <div>
              <h3 className="text-xl font-semibold text-primary-700 dark:text-primary-400 mb-2">{job.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{job.location}</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mb-3">Posted: {new Date(job.created_at).toLocaleDateString()}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-200">{job.job_type}</span>
                <span className="bg-accent-green-100 text-accent-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-accent-green-900 dark:text-accent-green-200">{job.experience_level}</span>
                {job.salary_range_min && (
                    <span className="bg-accent-yellow-100 text-accent-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-accent-yellow-900 dark:text-accent-yellow-200">${job.salary_range_min} - ${job.salary_range_max}</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300 text-base line-clamp-3 mb-4">{job.description}</p>
              <div className="flex flex-wrap gap-2">
                {job.skills_required && job.skills_required.map(skill => (
                  <span key={skill} className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-md dark:bg-gray-700 dark:text-gray-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;