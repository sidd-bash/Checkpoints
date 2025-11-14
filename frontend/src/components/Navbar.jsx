import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-4 px-6 bg-white shadow-md">
      <Link to="/" className="text-2xl font-bold text-indigo-600">MicroSaaS</Link>
      <div>
        <Link to="/login" className="text-indigo-600 hover:text-indigo-800 mr-6">Login</Link>
        <Link to="/signup" className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">Sign Up</Link>
      </div>
    </nav>
  );
}
