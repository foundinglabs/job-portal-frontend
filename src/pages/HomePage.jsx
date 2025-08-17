// src/pages/HomePage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  Layers,
  CalendarDays,
} from "lucide-react"; // Icons
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

const HomePage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    role: "",
    location: "",
    type: "",
    experience: "",
  });

  // Debounce filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      const fetchJobs = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await api.get("/jobs", { params: filters });
          setJobs(response.data);
        } catch (err) {
          console.error("Error fetching jobs:", err);
          setError(
            err.response?.data?.message ||
              "Failed to fetch jobs. Please try again."
          );
        } finally {
          setLoading(false);
        }
      };
      fetchJobs();
    }, 300);

    return () => clearTimeout(handler);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      role: "",
      location: "",
      type: "",
      experience: "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-10 font-sans">
      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8 mb-12 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 border-b pb-3">
          Search & Filters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
            >
              Job Title / Role
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                name="role"
                id="role"
                value={filters.role}
                onChange={handleFilterChange}
                placeholder="e.g., Software Engineer"
                className="w-full pl-10 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all px-4 py-2 text-sm shadow-sm"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
            >
              Location
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                name="location"
                id="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="e.g., Remote, New York"
                className="w-full pl-10 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all px-4 py-2 text-sm shadow-sm"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
            >
              Job Type
            </label>
            <div className="relative">
              <Briefcase
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <select
                name="type"
                id="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full pl-10 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all px-4 py-2 text-sm shadow-sm"
              >
                <option value="">All</option>
                <option value="remote">Remote</option>
                <option value="onsite">Onsite</option>
                <option value="hybrid">Hybrid</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Experience */}
          <div>
            <label
              htmlFor="experience"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
            >
              Experience Level
            </label>
            <div className="relative">
              <Layers
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <select
                name="experience"
                id="experience"
                value={filters.experience}
                onChange={handleFilterChange}
                className="w-full pl-10 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all px-4 py-2 text-sm shadow-sm"
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
        </div>

        {/* Clear Filters */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleClearFilters}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md transition-all rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && <LoadingSpinner size="lg" />}
      {error && <ErrorMessage message={error} />}

      {/* No Jobs */}
      {!loading && !error && jobs.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 text-lg">
          No jobs found matching your criteria.
        </p>
      )}

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Header */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {job.title}
              </h3>

              {/* Location */}
              <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-1">
                <MapPin
                  size={16}
                  className="mr-1 text-blue-600 dark:text-blue-400"
                />
                {job.location}
              </div>

              {/* Posted Date */}
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-4">
                <CalendarDays size={14} className="mr-1" />
                {new Date(job.created_at).toLocaleDateString()}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-200">
                  {job.job_type}
                </span>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full dark:bg-green-900 dark:text-green-200">
                  {job.experience_level}
                </span>
                {job.salary_range_min && (
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full dark:bg-purple-900 dark:text-purple-200">
                    ${job.salary_range_min} - ${job.salary_range_max}
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col justify-between h-full">
              <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                {job.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {job.skills_required &&
                  job.skills_required.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs font-medium rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
              </div>

              {/* CTA Button */}
              <div className="flex justify-end">
                <Link
                  to={`/jobs/${job.id}`}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-all"
                >
                  See Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
