// src/pages/CheckpointEditPage.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getChainById, updateChain } from "../utils/chains";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function CheckpointEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mobileView, setMobileView] = useState("edit"); // "edit" | "preview"

  const undoStack = useRef([]);
  const redoStack = useRef([]);

  const saveTitleTimer = useRef(null);
  const saveNodesTimer = useRef(null);

  const isEditingTitle = useRef(false);
  const isEditingNode = useRef(false);

  // --------------------------------------------------
  // LOAD + LIVE SNAPSHOT
  // --------------------------------------------------
  useEffect(() => {
    const ref = doc(db, "chains", id);

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();

      if (!isEditingTitle.current) setTitle(data.title);
      if (!isEditingNode.current) setNodes(data.checkpoints || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // --------------------------------------------------
  // UNDO / REDO
  // --------------------------------------------------
  const pushUndoState = useCallback(() => {
    undoStack.current.push({
      title,
      nodes: JSON.parse(JSON.stringify(nodes)),
    });
    redoStack.current = [];
  }, [title, nodes]);

  const undo = () => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop();
    redoStack.current.push({ title, nodes });

    setTitle(prev.title);
    setNodes(prev.nodes);
    updateChain(id, { title: prev.title, checkpoints: prev.nodes });
  };

  const redo = () => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop();
    undoStack.current.push({ title, nodes });

    setTitle(next.title);
    setNodes(next.nodes);
    updateChain(id, { title: next.title, checkpoints: next.nodes });
  };

  useEffect(() => {
    const listener = (e) => {
      if (e.ctrlKey && e.key === "z") undo();
      if (e.ctrlKey && e.shiftKey && e.key === "Z") redo();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  });

  // --------------------------------------------------
  // SAVE FUNCTIONS (debounced)
  // --------------------------------------------------
  const debouncedSaveTitle = useCallback(
    (newTitle) => {
      clearTimeout(saveTitleTimer.current);
      saveTitleTimer.current = setTimeout(() => {
        updateChain(id, { title: newTitle });
        isEditingTitle.current = false;
      }, 400);
    },
    [id]
  );

  const debouncedSaveNodes = useCallback(
    (newNodes) => {
      clearTimeout(saveNodesTimer.current);
      saveNodesTimer.current = setTimeout(() => {
        updateChain(id, { checkpoints: newNodes });
        isEditingNode.current = false;
      }, 400);
    },
    [id]
  );

  // --------------------------------------------------
  // TITLE CHANGE
  // --------------------------------------------------
  function handleTitleChange(e) {
    pushUndoState();
    const val = e.target.value;
    setTitle(val);
    isEditingTitle.current = true;
    debouncedSaveTitle(val);
  }

  // --------------------------------------------------
  // EDIT NODE TEXT
  // --------------------------------------------------
  function handleNodeChange(index, value) {
    pushUndoState();
    const updated = [...nodes];
    updated[index].text = value;

    setNodes(updated);
    isEditingNode.current = true;
    debouncedSaveNodes(updated);
  }

  // --------------------------------------------------
  // ADD STEP
  // --------------------------------------------------
  function addNode() {
    pushUndoState();

    const updated = [
      ...nodes,
      { text: `Step ${nodes.length + 1}`, completed: false },
    ];

    setNodes(updated);
    updateChain(id, { checkpoints: updated });

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 150);
  }

  // --------------------------------------------------
  // TOGGLE COMPLETION
  // --------------------------------------------------
  function toggleCompletion(i) {
    pushUndoState();

    const updated = nodes.map((n, idx) => ({
      ...n,
      completed: idx <= i,
    }));

    setNodes(updated);
    updateChain(id, { checkpoints: updated });
  }

  // --------------------------------------------------
  // DRAG & DROP
  // --------------------------------------------------
  function onDragEnd(result) {
    if (!result.destination) return;

    pushUndoState();

    const items = Array.from(nodes);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setNodes(items);
    updateChain(id, { checkpoints: items });
  }

  // --------------------------------------------------
  // CANCEL BUTTON
  // --------------------------------------------------
  function handleCancel() {
    navigate("/my-checkpoints");
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  if (loading) return <p className="p-6 text-white">Loading...</p>;

  const editPanel = (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold text-white mb-4">
        Editing: {title || "Untitled"}
      </h2>

      <input
        type="text"
        className="w-full p-3 rounded-lg bg-[#0f172a] text-white border border-[#1e293b]"
        value={title}
        onChange={handleTitleChange}
        placeholder="Checkpoint Title"
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div
              className="flex flex-col gap-4 mt-6"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {nodes.map((node, index) => (
                <Draggable
                  key={index}
                  draggableId={`step-${index}`}
                  index={index}
                >
                  {(provided) => (
                    <input
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="p-3 bg-[#0f172a] text-white rounded-lg border border-[#1e293b]"
                      value={node.text}
                      onChange={(e) => handleNodeChange(index, e.target.value)}
                    />
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        onClick={addNode}
        className="mt-4 px-4 py-3 rounded-lg bg-[#e11d48] hover:bg-[#be123c] text-white font-semibold"
      >
        + Add Step
      </button>

      <div className="mt-6 text-right">
        <button
          onClick={handleCancel}
          className="px-4 py-2 rounded-lg bg-gray-400 text-black hover:bg-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const previewPanel = (
    <div className="w-full p-4">
      <h3 className="text-2xl font-bold text-white mb-4">Preview</h3>

      <div className="relative pl-6 border-l-2 border-[#334155]">
        {nodes.map((node, i) => (
          <div
            key={i}
            className="mb-8 relative cursor-pointer"
            onClick={() => toggleCompletion(i)}
          >
            <div
              className={`absolute -left-7 w-10 h-10 rounded-full flex items-center justify-center font-bold 
              ${
                node.completed
                  ? "bg-green-600 text-white"
                  : "border-2 border-gray-400 bg-[#0f172a] text-white"
              }`}
            >
              {i + 1}
            </div>

            <div className="p-4 rounded-lg bg-[#1e293b] border border-[#334155] text-white">
              {node.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Navbar />

      {/* MOBILE TOGGLE */}
      <div className="md:hidden flex justify-center mt-4 gap-4">
        <button
          onClick={() => setMobileView("edit")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            mobileView === "edit"
              ? "bg-[#1e3a8a] text-white"
              : "bg-gray-300 text-black"
          }`}
        >
          Edit
        </button>

        <button
          onClick={() => setMobileView("preview")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            mobileView === "preview"
              ? "bg-[#1e3a8a] text-white"
              : "bg-gray-300 text-black"
          }`}
        >
          Preview
        </button>
      </div>

      {/* DESKTOP SPLIT — MOBILE STACKED */}
      <div
        className="
          mt-4
          md:grid md:grid-cols-2
          gap-6 
          p-4 
          bg-[#0f172a] 
          min-h-screen
        "
      >
        {/* Editor on mobile only if selected */}
        <div className={`${mobileView === "edit" ? "block" : "hidden"} md:block`}>
          {editPanel}
        </div>

        {/* Preview on mobile only if selected */}
        <div
          className={`${mobileView === "preview" ? "block" : "hidden"} md:block`}
        >
          {previewPanel}
        </div>
      </div>
    </>
  );
}
