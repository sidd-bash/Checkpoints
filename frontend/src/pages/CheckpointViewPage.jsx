import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function CheckpointViewPage() {
  const { id } = useParams();

  // Temporary data — later will be fetched from Firebase
  const checkpoint = {
    id,
    title: "My Checkpoint Example",
    ownerId: "user123",         // TEMP: will come from Firestore
    nodes: [
      { text: "Start", completed: true },
      { text: "Middle", completed: true },
      { text: "End", completed: false },
    ],
  };

  // TEMP LOGIC — replace with Firebase later
  const currentUserId = "user123"; // simulate logged-in user
  const isOwner = checkpoint.ownerId === currentUserId;

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-2xl mx-auto flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{checkpoint.title}</h2>

        {/* EDIT BUTTON — owner only */}
        {isOwner && (
          <Link
            to={`/checkpoint/${checkpoint.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </Link>
        )}
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="relative border-l-2 border-gray-300 ml-4">
          {checkpoint.nodes.map((node, i) => (
            <div key={i} className="mb-8 ml-4 relative">
              {/* Step Circle */}
              <div
                className={`absolute -left-6 top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold
                ${
                  node.completed
                    ? "bg-green-600 text-white"
                    : "border-2 border-gray-400 bg-white text-gray-600"
                }
              `}
              >
                {i + 1}
              </div>

              {/* Step Text */}
              <div className="p-4 bg-white shadow rounded border">
                <p className="text-lg font-semibold">{node.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
