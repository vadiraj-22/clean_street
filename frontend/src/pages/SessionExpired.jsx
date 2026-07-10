import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FiClock, FiLogOut, FiArrowRight } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const SessionExpired = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme() || { isDarkMode: false };

  useEffect(() => {
    // Optionally automatically redirect after a countdown, 
    // but giving user control is often better UX.
    const timer = setTimeout(() => {
      navigate("/login");
    }, 10000); // 10 seconds auto-redirect

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-gray-900"}`}>
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <div
          className={`relative w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] ${
            isDarkMode
              ? "bg-[#141414] border border-gray-800 shadow-black/50"
              : "bg-white border border-gray-100 shadow-indigo-100/50"
          }`}
        >
          {/* Abstract Background Elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse delay-700"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Icon Container with animation */}
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div
                className={`relative p-5 rounded-full shadow-inner ${
                  isDarkMode
                    ? "bg-gradient-to-br from-gray-800 to-gray-900"
                    : "bg-gradient-to-br from-white to-gray-50"
                }`}
              >
                <FiClock className="w-12 h-12 text-indigo-500 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-red-500 p-1.5 rounded-full border-2 border-white dark:border-[#141414]">
                <FiLogOut className="w-4 h-4 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Session Expired
            </h1>
            
            <p
              className={`text-base mb-8 leading-relaxed ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              For your security, your session has timed out due to inactivity. Please log in again to continue managing your tasks.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full hover:from-indigo-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg shadow-indigo-500/30 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <span className="relative flex items-center gap-2">
                Go to Login
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
            
            <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
              Redirecting automatically in 10 seconds...
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SessionExpired;
