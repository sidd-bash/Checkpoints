import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="w-full px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
      <Link to="/my-checkpoints" className="text-xl font-semibold">
        Checkpoints
      </Link>
      
      <div className="flex items-center gap-4">
        <Link to="/my-checkpoints" className="hover:underline">
          My Checkpoints
        </Link>
        <Link to="/auth" className="hover:underline">
          Logout
        </Link>
      </div>
    </div>
  );
}
