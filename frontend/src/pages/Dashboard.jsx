import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="p-8 max-w-5xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <p>Welcome to your app dashboard. Customize it to show your micro SaaS features and data.</p>
    </div>
  );
}
