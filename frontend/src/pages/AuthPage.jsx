// src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startPhoneSignIn, ensureLocalPersistence } from "../firebase";

export default function AuthPage() {
  const [phone, setPhone] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSendCode(e) {
    e?.preventDefault();
    setLoading(true);
    try {
      await ensureLocalPersistence();
      const result = await startPhoneSignIn(phone, "recaptcha-container");
      setConfirmation(result);
      setMessage("Code sent. Check your phone.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to send code: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmCode(e) {
    e?.preventDefault();
    if (!confirmation) return;
    setLoading(true);
    try {
      const userCred = await confirmation.confirm(code);
      setMessage("Signed in as " + userCred.user.phoneNumber);
      navigate("/my-checkpoints");
    } catch (err) {
      console.error(err);
      setMessage("Failed to confirm code: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">Sign in with phone</h1>

        {!confirmation ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <input
              placeholder="+1 555 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <div id="recaptcha-container" />
            <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
              Send code
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmCode} className="space-y-4">
            <input
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button disabled={loading} className="w-full bg-green-600 text-white py-2 rounded">
              Confirm code
            </button>
          </form>
        )}

        {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
      </div>
    </div>
  );
}
