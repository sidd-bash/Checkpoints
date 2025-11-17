import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getChainById, updateChain } from "../utils/chains";

// Drag and drop
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function CheckpointEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Undo/redo buffers
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  // Debounce timers
  const saveTitleTimer = useRef(null);
  const saveNodesTimer = useRef(null);

  // Prevent applying remote changes while typing locally
  const isEditingTitle = useRef(false);
  const isEditingNode = useRef(false);

  /** ----------------------------------------------
   *   LOAD + REALTIME SNAPSHOT
   * -----------------------------------------------*/
  useEffect(() => {
    const ref = doc(db, "chains", id);

    // Firestore live listener
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();

      // TITLE MERGE
      if (!isEditingTitle.current) {
        setTitle(data.title);
      }

      // NODES MERGE
      if (!isEditingNode.current) {
        setNodes(data.checkpoints || []);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  /** ----------------------------------------------
   *   UNDO / REDO HANDLERS
   * -----------------------------------------------*/
  const pushUndoState = useCallback(() => {
    undoStack.current.push({ title, nodes: JSON.parse(JSON.stringify(nodes)) });
    redoStack.current = []; // reset redo
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

  /** key listeners for undo/redo */
  useEffect(() => {
    const listener = (e) => {
      if (e.ctrlKey && e.key === "z") {
        undo();
      }
      if (e.ctrlKey && e.shiftKey && e.key === "Z") {
        redo();
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  });

  /** ----------------------------------------------
   *   SAVE FUNCTIONS (debounced)
   * -----------------------------------------------*/
  const debouncedSaveTitle = useCallback((newTitle) => {
    clearTimeout(saveTitleTimer.current);
    saveTitleTimer.current = setTimeout(() => {
      updateChain(id, { title: newTitle });
      isEditingTitle.current = false;
    }, 400);
  }, [id]);

  const debouncedSaveNodes = useCallback((newNodes) => {
    clearTimeout(saveNodesTimer.current);
    saveNodesTimer.current = setTimeout(() => {
      updateChain(id, { checkpoints: newNodes });
      isEditingNode.current = false;
    }, 400);
  }, [id]);

  /** ----------------------------------------------
   *   TITLE CHANGE
   * -----------------------------------------------*/
  function handleTitleChange(e) {
    pushUndoState();
    const val = e.target.value;
    setTitle(val);
    isEditingTitle.current = true;
    debouncedSaveTitle(val);
  }

  /** ----------------------------------------------
   *   NODE TEXT EDIT
   * -----------------------------------------------*/
  function handleNodeChange(index, value) {
    pushUndoState();
    const updated = [...nodes];
    updated[index].text = value;

    setNodes(updated);
    isEditingNode.current = true;
    debouncedSaveNodes(updated);
  }

  /** ----------------------------------------------
   *   ADD STEP
   * -----------------------------------------------*/
  function addNode() {
    pushUndoState();

    const updated = [
      ...nodes,
      { text: `Step ${nodes.length + 1}`, completed: false },
    ];

    setNodes(updated);
    updateChain(id, { checkpoints: updated }); // immediate

    // Auto-scroll to last node
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 150);
  }

  /** ----------------------------------------------
   *   TOGGLE COMPLETION
   * -----------------------------------------------*/
  function toggleCompletion(index) {
    pushUndoState();

    const updated = [...nodes];
    for (let i = 0; i < updated.length; i++) {
      updated[i].completed = i <= index;
    }

    setNodes(updated);
    updateChain(id, { checkpoints: updated });
  }

  /** ----------------------------------------------
   *   DRAG / DROP
   * -----------------------------------------------*/
  function onDragEnd(result) {
    if (!result.destination) return;

    pushUndoState();

    const items = Array.from(nodes);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setNodes(items);
    updateChain(id, { checkpoints: items });
  }

  /** ----------------------------------------------
   *   CANCEL
   * -----------------------------------------------*/
  function handleCancel() {
    navigate("/my-checkpoints");
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Editing: {title}</h2>

        {/* Title */}
        <input
          type="text"
          className="border p-2 w-full mb-4 rounded"
          value={title}
          onChange={handleTitleChange}
          placeholder="Checkpoint Title"
        />

        {/* Drag and Drop Editable Nodes */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="steps">
            {(provided) => (
              <div
                className="flex flex-col gap-4 mb-6"
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
                        className="border p-2 w-full rounded"
                        value={node.text}
                        onChange={(e) =>
                          handleNodeChange(index, e.target.value)
                        }
                      />
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

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
              <div
                className={`absolute -left-6 top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold
                  ${
                    node.completed
                      ? "bg-green-600 text-white"
                      : "border-2 border-gray-400 bg-white text-gray-600"
                  }`}
              >
                {i + 1}
              </div>

              <div className="p-4 bg-white shadow rounded border">
                <p className="text-lg font-semibold">{node.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
