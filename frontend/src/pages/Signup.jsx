import { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

export default function Signup() {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    // Call backend signup API here
    console.log("Signing up:", form);
    let base_url = import.meta.env.VITE_SERVER_URL;
    console.log("Base URL:", base_url);

    axios.post(`${base_url}/auth/signup`, {
      username: form.username,
      password: form.password,
      email: form.email
    })
      .then(response => {
        console.log("Signup successful:", response.data);
        toast.success("Signup successful!");
        // Handle successful signup (e.g., redirect to login)
      })
      .catch(error => {
        console.error("Signup failed:", error);
        toast.error("Something went wrong!");
        // Handle signup failure (e.g., show error message)
      });
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded shadow">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
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
          className="w-full p-3 mb-4 border rounded" 
          name="username" 
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input 
          className="w-full p-3 mb-4 border rounded" 
          name="password" 
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input 
          className="w-full p-3 mb-6 border rounded" 
          name="confirmPassword" 
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700">Sign Up</button>
      </form>
    </div>
  );
}
