import { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // ✅ import

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate(); // ✅ hook

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();

    axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/login`, form)
      .then(response => {
        const token = response.data.access_token;
        if (token) {
          localStorage.setItem("access_token", token);
          toast.success("Login successful!");
          console.log("Login successful, token stored. about to navigate");
          navigate("/dashboard"); // ✅ redirect after successful login
        } else {
          toast.error("Login succeeded but no token received!");
        }
      })
      .catch(error => {
        console.error("Login failed:", error.response.data.detail);
        toast.error(error.response.data.detail || "Something went wrong!");
      });
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded shadow">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          className="w-full p-3 mb-4 border rounded" 
          name="email" 
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input 
          className="w-full p-3 mb-6 border rounded" 
          name="password" 
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700">
          Login
        </button>
      </form>
    </div>
  );
}