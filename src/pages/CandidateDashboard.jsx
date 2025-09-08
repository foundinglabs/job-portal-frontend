import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import {
  User,
  Mail,
  Bookmark,
  Briefcase,
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit3,
} from "lucide-react";

const CandidateDashboard = () => {
  const { user, isAuthenticated, loading: authLoading, role } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !user?.id || role !== "candidate") {
        setLoading(false);
        if (isAuthenticated && role !== "candidate") {
          setError("Access denied. Only candidates can view this dashboard.");
          navigate("/jobs");
        } else {
          setError("Please log in as a candidate to view your dashboard.");
          navigate("/jobs");
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [savedJobsResponse, appliedJobsResponse] = await Promise.all([
          api.get("/saved-jobs"),
          api.get("/candidate/applied-jobs"),
        ]);
        setSavedJobs(savedJobsResponse.data.data);
        setAppliedJobs(appliedJobsResponse.data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user, authLoading, role, navigate]);

  const handleUnsaveJob = async (jobId) => {
    if (!isAuthenticated || !user?.id || role !== "candidate") {
      setError("Please log in as a candidate to unsave jobs.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/saved-jobs/${jobId}`);
      setSavedJobs((prev) => prev.filter((job) => job.job_id !== jobId));
      setLoading(false);
    } catch (err) {
      console.error("Error unsaving job:", err);
      setError(err.response?.data?.message || "Failed to unsave job.");
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

  if (error && (!isAuthenticated || role !== "candidate")) {
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
        Welcome, <span className="text-primary-600 ">{user?.email}</span> 🎉
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" /> Your Profile
          </h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary-500" /> {user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 md:mt-12">
        {/* Saved Jobs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6 md:mb-10 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" /> Your Saved Jobs
          </h3>
          {savedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
              <Bookmark className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-4">
                You haven’t saved any jobs yet.
              </p>
              <Link to="/jobs" className="btn-primary">
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {savedJobs.map((job) => (
                job.job && (
                  <div
                    key={job.job_id}
                    className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition flex flex-col sm:flex-row justify-between items-start sm:items-center"
                  >
                    <div>
                      <Link
                        to={`/jobs/${job.job_id}`}
                        className="text-base sm:text-lg font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {job.job.title}
                      </Link>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {job.job.company_name}
                      </p>
                      <p className="flex items-center text-gray-500 text-xs mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Saved: {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnsaveJob(job.job_id)}
                      className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors shadow-sm mt-4 sm:mt-0"
                    >
                      <Trash2 className="w-4 h-4" /> Unsave
                    </button>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Applied Jobs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" /> Your Applied Jobs
          </h3>
          {appliedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
              <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
                You haven’t applied for any jobs yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {appliedJobs.map(
                (job) =>
                  job.job && (
                    <div
                      key={job.job_id}
                      className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <Link
                            to={`/jobs/${job.job_id}`}
                            className="text-base sm:text-lg font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            {job.job.title}
                          </Link>
                          <p className="text-gray-600 dark:text-gray-300">
                            {job.job.company_name}
                          </p>
                          <p className="flex items-center text-gray-500 text-xs mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            Applied: {new Date(job.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 sm:px-4 py-1.5 mt-2 sm:mt-0 text-xs font-semibold rounded-full shadow-sm whitespace-nowrap
                            ${
                              job.application_status === "Hired"
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : job.application_status === "Rejected"
                                ? "bg-red-100 text-red-600 border border-red-300"
                                : "bg-gray-100 text-gray-600 border border-gray-300"
                            }`}
                        >
                          {job.application_status}
                        </span>
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;