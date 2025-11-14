import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState } from "react";

export default function CheckpointEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNew = id === "new";

  const [title, setTitle] = useState("Untitled Checkpoint");
  const [nodes, setNodes] = useState([
    { text: "Step 1", completed: true },
    { text: "Step 2", completed: false },
  ]);

  function addNode() {
    setNodes([...nodes, { text: `Step ${nodes.length + 1}`, completed: false }]);
  }

  function editNodeText(index, value) {
    const updated = [...nodes];
    updated[index].text = value;
    setNodes(updated);
  }

  function toggleCompletion(index) {
    const updated = [...nodes];

    // Mark all steps before & including this as completed
    for (let i = 0; i < nodes.length; i++) {
      updated[i].completed = i <= index;
    }

    setNodes(updated);
  }

  function handleSave() {
    console.log("Saving...", { title, nodes });

    const checkpointId = isNew ? "temp123" : id;
    navigate(`/checkpoint/${checkpointId}`);
  }

  function handleCancel() {
    navigate("/my-checkpoints");
  }

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          {isNew ? "Create New Checkpoint" : `Editing: ${id}`}
        </h2>

        {/* Title */}
        <input
          type="text"
          className="border p-2 w-full mb-4 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Checkpoint Title"
        />

        {/* Editable list */}
        <div className="flex flex-col gap-4 mb-6">
          {nodes.map((node, i) => (
            <input
              key={i}
              type="text"
              className="border p-2 w-full rounded"
              value={node.text}
              onChange={(e) => editNodeText(i, e.target.value)}
            />
          ))}
        </div>

        {/* Add Step */}
        <button
          onClick={addNode}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add Step
        </button>

        {/* LIVE PREVIEW */}
        <h3 className="text-xl font-bold mt-8 mb-4">Preview</h3>

        <div className="relative border-l-2 border-gray-300 ml-4">
          {nodes.map((node, i) => (
            <div
              key={i}
              className="mb-8 ml-4 relative cursor-pointer"
              onClick={() => toggleCompletion(i)}
            >
              {/* Step Circle */}
              <div
                className={`absolute -left-6 top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold
                ${node.completed ? "bg-green-600 text-white" : "border-2 border-gray-400 bg-white text-gray-600"}
                `}
              >
                {i + 1}
              </div>

              <div className="p-4 bg-white shadow rounded border">
                <p className="text-lg font-semibold">{node.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
