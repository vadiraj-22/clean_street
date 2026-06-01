// src/pages/CompleteProfile.jsx

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMapPin, FiUsers, FiHeart, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const backend_Url = import.meta.env.VITE_BACKEND_URL || "http://localhost:3002";

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Guard: if no user or profile is already complete, redirect
  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }
    if (user.isProfileComplete) {
      if (user.role === "admin") navigate("/AdminDashboard");
      else if (user.role === "volunteer") navigate("/VolunteerDashboard");
      else navigate("/UserDashboard");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location.trim()) {
      toast.error("Please enter your location.");
      return;
    }
    if (!role) {
      toast.error("Please select your role.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${backend_Url}/api/user/complete-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ location: location.trim(), role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to complete profile");

      // Update localStorage with new user data
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Profile completed! Redirecting...");

      setTimeout(() => {
        if (data.user.role === "volunteer") {
          navigate("/VolunteerDashboard");
        } else {
          navigate("/UserDashboard");
        }
      }, 500);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      value: "user",
      title: "Community User",
      description: "Report cleanliness issues in your area and track their resolution.",
      icon: <FiUsers className="text-2xl" />,
      gradient: "from-blue-500 to-indigo-500",
      lightBg: "bg-blue-50",
      border: "border-blue-200",
      selectedBorder: "border-blue-500 ring-2 ring-blue-200",
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      value: "volunteer",
      title: "Volunteer",
      description: "Help resolve reported issues and make a real impact in your community.",
      icon: <FiHeart className="text-2xl" />,
      gradient: "from-green-500 to-emerald-500",
      lightBg: "bg-green-50",
      border: "border-green-200",
      selectedBorder: "border-green-500 ring-2 ring-green-200",
      iconBg: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex transition-colors duration-300">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Left Column - Visual */}
      <div className="hidden lg:flex w-1/2 bg-cover bg-center relative group overflow-hidden" style={{ backgroundImage: "url('/images/street1.png')" }}>
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110" style={{ backgroundImage: "url('/images/street1.png')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-16 text-center space-y-6">
          <Link to="/" className="block mb-6 transform transition-transform duration-300 hover:scale-105">
            <img
              src={isDarkMode ? "/images/logo.png" : "/images/white_logo.png"}
              alt="Clean Street Logo"
              className={`w-72 animate-fade-in-down ${isDarkMode ? "brightness-0 invert" : ""}`}
            />
          </Link>
          <h1 className="text-4xl font-bold tracking-tight animate-fade-in-up animation-delay-200">
            Almost There!
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed animate-fade-in-up animation-delay-300">
            Just a few more details and you'll be ready to make a difference.
          </p>
        </div>
      </div>

      {/* Right Column - Complete Profile Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 animate-fade-in-up">
          {/* Header with user info */}
          <div className="text-center mb-8">
            {user?.profilePhoto && (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-indigo-100 shadow-md object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome, {user?.name?.split(" ")[0] || "there"}!
            </h2>
            <p className="text-gray-500 mt-2">
              Complete your profile to get started.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Location Input */}
            <div>
              <label htmlFor="complete-location" className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Location
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none transition-colors group-focus-within:text-indigo-600">
                  <FiMapPin size={18} />
                </span>
                <input
                  id="complete-location"
                  type="text"
                  placeholder="e.g. Mumbai, Maharashtra"
                  className="w-full pl-11 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                This helps us show you relevant issues in your area.
              </p>
            </div>

            {/* Role Selection Cards */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to join as...
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roleOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setRole(option.value)}
                    className={`relative p-5 rounded-xl border-2 text-left transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-md focus:outline-none ${
                      role === option.value
                        ? `${option.selectedBorder} ${option.lightBg} shadow-md`
                        : `${option.border} bg-white hover:${option.lightBg}`
                    }`}
                  >
                    {/* Selected check */}
                    {role === option.value && (
                      <div className="absolute top-3 right-3">
                        <FiCheckCircle className="text-lg text-green-500" />
                      </div>
                    )}

                    <div className={`inline-flex p-2.5 rounded-lg mb-3 ${option.iconBg}`}>
                      {option.icon}
                    </div>
                    <h3 className="font-semibold text-gray-800 text-base mb-1">
                      {option.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-600 text-sm text-center bg-red-50 p-2.5 rounded-md border border-red-200">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !role || !location.trim()}
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3.5 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Completing Profile...
                </>
              ) : (
                <>
                  Get Started
                  <FiArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
