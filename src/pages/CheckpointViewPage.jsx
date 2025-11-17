import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getChainById, updateChain } from "../utils/chains";
import { auth } from "../firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
i
export const functions = getFunctions();
export const sendWhatsapp = httpsCallable(functions, "sendWhatsapp");


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

    <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#00224D] text-white px-4 py-6">

      {/* HEADER SECTION */}
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
            {chain.title}
          </h2>

          <p className="text-gray-300 text-sm mt-1">
            {isOwner ? "Tap a step to update progress." : "View progress in real-time."}
          </p>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3">
          {isOwner && (
            <Link
              to={`/checkpoint/${chain.id}/edit`}
              className="px-4 py-2 bg-[#FF4F6D] hover:bg-[#ff3558] rounded-xl font-semibold shadow-lg transition"
            >
              Edit
            </Link>
          )}

          <button
            onClick={handleShare}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl font-semibold shadow-lg transition"
          >
            Share
          </button>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="max-w-3xl mx-auto mt-6">

        <div className="relative pl-10 sm:pl-16">

          {/* Vertical Gradient Line */}
          <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 via-gray-300 to-blue-300 rounded-full opacity-50"></div>

          {chain.checkpoints?.map((node, index) => (
            <div
              key={index}
              onClick={() => handleStepClick(index)}
              className={`relative mb-10 cursor-pointer transition group`}
            >
              {/* Step Circle */}
              <div
                className={`
                  absolute left-0 sm:left-0 top-0 w-8 h-8 sm:w-12 sm:h-12 
                  rounded-full flex items-center justify-center font-bold border-4 
                  transition-all shadow-lg
                  ${
                    node.completed
                      ? "bg-green-500 border-green-700 text-white scale-110"
                      : "bg-white text-gray-700 border-gray-300 group-hover:border-[#FF4F6D] group-hover:scale-105"
                  }
                `}
              >
                {index + 1}
              </div>

              {/* Step Card */}
              <div className="
                ml-10 sm:ml-16 
                bg-white/10 backdrop-blur border border-white/10 
                rounded-xl p-4 sm:p-5 shadow-md 
                hover:bg-white/20 hover:shadow-xl transition-all text-gray-100
              ">
                <p className="text-base sm:text-lg font-medium">{node.text}</p>
              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  </>
);

}
