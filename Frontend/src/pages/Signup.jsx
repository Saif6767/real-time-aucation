import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "../services/axiosConfig";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    // basic validation
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post("/auth/register", { username, email, password });
      // auto-login after register
      const res = await axios.post("/auth/login", { email, password });
      const { token, user } = res.data;
      login(token, user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <form onSubmit={handleSignup} className="bg-white shadow-md rounded-2xl p-6 w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Sign Up</h2>
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          className="border rounded-md w-full p-2 mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="border rounded-md w-full p-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded-md w-full p-2 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <p className="text-sm text-center mt-3 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
