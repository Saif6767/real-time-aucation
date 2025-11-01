import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-600">
        RealBid
      </Link>
      {isAuthenticated && (
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-100 hover:bg-red-100 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4.5A1.5 1.5 0 014.5 3h6A1.5 1.5 0 0112 4.5v3a.5.5 0 01-1 0v-3a.5.5 0 00-.5-.5h-6a.5.5 0 00-.5.5v11c0 .276.224.5.5.5h6a.5.5 0 00.5-.5v-3a.5.5 0 011 0v3A1.5 1.5 0 0110.5 19h-6A1.5 1.5 0 013 17.5v-13z"
              clipRule="evenodd"
            />
            <path d="M14.354 10.354a.5.5 0 000-.708L12.172 7.464a.5.5 0 10-.707.707L12.793 10l-1.328 1.828a.5.5 0 10.707.707l2.182-2.182z" />
          </svg>
          <span className="text-sm font-medium">Logout</span>
        </button>
      )}
    </nav>
  );
};

export default Navbar;
