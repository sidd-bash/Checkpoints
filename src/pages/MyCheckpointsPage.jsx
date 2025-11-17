import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { listChainsForOwner, createChain } from "../utils/chains";

export default function MyCheckpointsPage() {
  const navigate = useNavigate();
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    // If not signed in, send to login
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

    // Create new chain in DB
    const newChain = await createChain(user.uid, "Untitled Checkpoint");

    // Redirect to edit page for this chain
    navigate(`/checkpoint/${newChain.id}/edit`);
  }

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Checkpoints</h2>

          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            + Create New
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : chains.length === 0 ? (
          <p className="text-gray-600">
            You haven't created any checkpoints yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {chains.map((cp) => (
              <Link
                key={cp.id}
                to={`/checkpoint/${cp.id}`}
                className="p-4 border rounded-lg shadow hover:bg-gray-50"
              >
                <h3 className="text-xl font-semibold">{cp.title}</h3>

                <p className="text-sm text-gray-500 mt-1">
                  {cp.checkpoints?.length || 0} steps
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
