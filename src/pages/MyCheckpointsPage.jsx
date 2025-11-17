// src/pages/MyCheckpointsPage.jsx

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { listChainsForOwner, createChain } from "../utils/chains";
import { PlusCircle } from "lucide-react";

export default function MyCheckpointsPage() {
  const navigate = useNavigate();
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/");
      return;
    }

    async function load() {
      const list = await listChainsForOwner(user.uid);
      setChains(list);
      setLoading(false);
    }

    load();
  }, [navigate]);

  async function handleCreateNew() {
    const user = auth.currentUser;
    if (!user) {
      navigate("/");
      return;
    }

    const newChain = await createChain(user.uid, "Untitled Checkpoint");
    navigate(`/checkpoint/${newChain.id}/edit`);
  }

  return (
  <>
    <Navbar />

    <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#00224D] text-white px-4 py-6">
      
      {/* Hero Section */}
      <div className="max-w-xl mx-auto mt-4">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          Your <br />
          <span className="text-[#FF4F6D]">Checkpoints</span>
        </h1>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm sm:text-base text-gray-300 max-w-xs">
            Track, manage, and share your progress seamlessly.
          </p>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-[#FF4F6D] hover:bg-[#ff3558] transition px-4 py-2 rounded-lg shadow"
          >
            <PlusCircle size={18} />
            <span className="text-sm font-semibold">New</span>
          </button>
        </div>
      </div>

      {/* List Section */}
      <div className="max-w-xl mx-auto mt-8 space-y-4">
        {loading ? (
          <p className="text-gray-300">Loading...</p>
        ) : chains.length === 0 ? (
          <p className="text-gray-300">You haven't created any checkpoints yet.</p>
        ) : (
          chains.map((cp) => (
            <Link
              key={cp.id}
              to={`/checkpoint/${cp.id}`}
              className="block bg-white/10 backdrop-blur rounded-xl p-4 shadow hover:scale-[1.02] transition"
            >
              <h3 className="text-lg font-semibold text-white">{cp.title}</h3>

              <p className="text-sm text-gray-300 mt-1">
                {cp.checkpoints?.length || 0} steps
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  </>
);

}
