import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getChainById, updateChain } from "../utils/chains";
import { auth } from "../firebase";

export default function CheckpointViewPage() {
  const { id } = useParams();
  const [chain, setChain] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = auth.currentUser?.uid || null;

  const isOwner = chain?.ownerId === currentUserId;

  useEffect(() => {
    async function load() {
      const data = await getChainById(id);
      setChain(data || null);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!chain) return <p className="p-6">Checkpoint not found.</p>;

  // ----------------------------
  // OWNER CLICK TO COMPLETE STEP
  // ----------------------------
  async function handleStepClick(index) {
    if (!isOwner) return;

    const updated = chain.checkpoints.map((step, i) => ({
      ...step,
      completed: i <= index
    }));

    setChain({ ...chain, checkpoints: updated });

    await updateChain(chain.id, { checkpoints: updated });
  }

  // ----------------------------
  // SHARE BUTTON
  // ----------------------------
  function handleShare() {
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: chain.title,
        text: "Check out this checkpoint chain!",
        url: shareUrl,
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  }

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="p-6 max-w-3xl mx-auto flex justify-between items-center mb-10">
        <h2 className="text-4xl font-bold tracking-tight text-gray-800">
          {chain.title}
        </h2>

        <div className="flex gap-3">
          {isOwner && (
            <Link
              to={`/checkpoint/${chain.id}/edit`}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm transition"
            >
              Edit
            </Link>
          )}

          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 shadow-sm transition"
          >
            Share
          </button>
        </div>
      </div>

      {/* CHECKPOINT LINKED LIST */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="relative">

          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 
                          bg-gradient-to-b from-blue-300 via-gray-300 to-blue-300 
                          rounded-full">
          </div>

          {chain.checkpoints?.map((node, index) => (
            <div 
              key={index} 
              className={`relative pl-16 mb-10 group 
                          ${isOwner ? "cursor-pointer" : "cursor-default"}`}
              onClick={() => handleStepClick(index)}
            >

              {/* Node Circle */}
              <div
                className={`absolute left-0 top-0 w-12 h-12 rounded-full 
                            flex items-center justify-center font-bold border-4 
                            transition-all
                  ${
                    node.completed
                      ? "bg-green-600 border-green-700 text-white shadow-lg"
                      : "bg-white border-gray-300 text-gray-600 group-hover:border-blue-400"
                  }
                `}
              >
                {index + 1}
              </div>

              {/* Node Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 
                              shadow-sm hover:shadow-md transition-all">
                <p className="text-lg font-medium text-gray-800">
                  {node.text}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </>
  );
}
