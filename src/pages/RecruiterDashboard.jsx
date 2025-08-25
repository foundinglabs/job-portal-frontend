// RecruiterDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { useAuth } from "../hooks/useAuth";
import {
  Briefcase,
  Mail,
  Building2,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Users,
} from "lucide-react";

const RecruiterDashboard = () => {
  const { user, isAuthenticated, role, companyId, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [jobsPosted, setJobsPosted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobsPostedByCompany = async () => {
      if (!isAuthenticated || role !== "recruiter" || !companyId) {
        setLoading(false);
        if (isAuthenticated && role !== "recruiter") {
          setError("Access denied. Only recruiters can view this dashboard.");
          navigate("/");
        } else if (isAuthenticated && !companyId) {
          setError(
            "Your recruiter profile is not fully set up (missing company ID). Please contact support or re-register as recruiter."
          );
          navigate("/jobs");
        } else {
          setError("Please log in as a recruiter associated with a company to view this dashboard.");
          navigate("/");
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/jobs/recruiter/dashboard`);
        setJobsPosted(response.data);
      } catch (err) {
        console.error("Error fetching jobs posted by company:", err);
        setError(err.response?.data?.message || "Failed to load jobs posted by your company.");
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
    if (
      !window.confirm(
        "Are you sure you want to delete this job? This will soft-delete it and it will no longer be visible to candidates."
      )
    )
      return;

    setLoading(true);
    setError(null);
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobsPosted((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error("Error deleting job:", err);
      setError(err.response?.data?.message || "Failed to delete job.");
    } finally {
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

  if (error && (!isAuthenticated || role !== "recruiter")) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <ErrorMessage message={error} />
        <div className="text-center mt-6">
          <Link to="/jobs" className="btn-primary">
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 font-inter">
      {/* Title */}
      <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-10 text-center">
        Hello! {user?.email}
      </h2>

      {/* Company Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-10 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary-600" /> Company Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary-500" />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary-500" />
            <span>User ID: {user?.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-primary-500" />
            <span>Company ID: {companyId || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary-600" /> Jobs You’ve Posted
        </h3>

        {jobsPosted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              You haven’t posted any jobs yet.
            </p>
            <Link
              to="/recruiter/post-job"
              className="btn-primary px-6 py-3 text-base rounded-xl shadow-md"
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {jobsPosted.map((job) => (
              <div
                key={job.id}
                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Job Details */}
                  <div>
                    <h4 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {job.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {job.location} ({job.job_type})
                    </p>
                    <p className="flex items-center text-gray-500 text-xs mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Posted: {new Date(job.created_at).toLocaleDateString()}
                    </p>
                    <p
                      className={`flex items-center text-sm font-medium mt-2 ${
                        job.is_active ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {job.is_active ? (
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-1" />
                      )}
                      {job.is_active ? "Active" : "Inactive (Deleted)"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleViewApplications(job.id)}
                      className="btn-primary flex items-center gap-2 px-4 py-2 text-sm rounded-lg shadow-sm"
                    >
                      <Users className="w-4 h-4" /> View Applications
                    </button>
                    <Link
                      to={`/recruiter/edit-job/${job.id}`}
                      className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" /> Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
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
