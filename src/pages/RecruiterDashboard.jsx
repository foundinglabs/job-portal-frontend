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
  LinkIcon,
} from "lucide-react";

const RecruiterDashboard = () => {
  const { user, isAuthenticated, role, companyId, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [jobsPosted, setJobsPosted] = useState([]);
  const [recruiterName, setRecruiterName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        const [jobsResponse, profileResponse] = await Promise.all([
          api.get(`/jobs/recruiter/dashboard`),
          api.get(`/recruiter/profile`)
        ]);
        setJobsPosted(jobsResponse.data);
        if (profileResponse.data) {
          setRecruiterName(profileResponse.data.recruiter_name);
          setCompanyName(profileResponse.data.company_name);
          setCompanyWebsite(profileResponse.data.company_website);
        }
      } catch (err) {
        console.error("Error fetching jobs posted by company:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [isAuthenticated, role, companyId, authLoading, navigate]);

  const handleViewApplications = (jobId) => {
    navigate(`/recruiter/manage-applications/${jobId}`);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job? This will soft-delete it and it will no longer be visible to candidates.")) {
      return;
    }
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
      <div className="flex justify-center items-center h-screen">
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
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 font-inter">
      {/* Title */}
      <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6 md:mb-10 text-center">
        Hello! <span className="text-primary-600 break-words">{recruiterName || user?.email}</span> 🎉
      </h2>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Company Info */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6 lg:mb-0 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" /> Company Overview
          </h3>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary-500" />
              <span className="break-words">Recruiter: {recruiterName || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary-500" />
              <span className="break-words">Email: {user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-primary-500" />
              <span className="break-words">Company: {companyName || "N/A"}</span>
            </div>
            {companyWebsite && (
              <div className="flex items-center gap-3">
                <Link to={companyWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors break-words">
                  <LinkIcon className="w-5 h-5 text-primary-500" />
                  <span>Website: {companyWebsite || "N/A"}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Jobs Section */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" /> Jobs You’ve Posted
          </h3>

          {jobsPosted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-4">
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
            <div className="space-y-4 sm:space-y-6">
              {jobsPosted.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Job Details */}
                    <div className="flex-1">
                      <h4 className="text-base sm:text-xl font-bold text-primary-600 dark:text-primary-400">
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
                    <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 w-full">
                      <button
                        onClick={() => handleViewApplications(job.id)}
                        className="btn-primary flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg shadow-sm"
                      >
                        <Users className="w-4 h-4" /> View Applications
                      </button>
                      <Link
                        to={`/recruiter/edit-job/${job.id}`}
                        className="btn-secondary flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" /> Edit Job Description
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="bg-red-500 hover:bg-red-600 text-white flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors shadow-sm"
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
    </div>
  );
};

export default RecruiterDashboard;