import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import MyCheckpointsPage from "../pages/MyCheckpointsPage";
import CheckpointViewPage from "../pages/CheckpointViewPage";
import CheckpointEditPage from "../pages/CheckpointEditPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/my-checkpoints" element={<MyCheckpointsPage />} />
        <Route path="/checkpoint/:id" element={<CheckpointViewPage />} />
        <Route path="/checkpoint/:id/edit" element={<CheckpointEditPage />} />
      </Routes>
    </BrowserRouter>
  );
}
