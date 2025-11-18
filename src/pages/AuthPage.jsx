import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startPhoneSignIn, ensureLocalPersistence } from "../firebase";
import { motion } from "framer-motion";
import { FiPhone, FiLock, FiCheckCircle } from "react-icons/fi";

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
      setMessage("Verification code sent.");
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
      navigate("/my-checkpoints");
    } catch (err) {
      console.error(err);
      setMessage("Incorrect code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="min-h-screen w-full bg-gradient-to-br from-[#0A1A2F] to-[#00224D] text-white">

  {/* --- NAVBAR BRAND --- */}
  <div className="w-full py-5 px-6">
    <h1 className="text-2xl italic font-extrabold tracking-tight md:text-3xl">
      Checkpoints
    </h1>
  </div>

  {/* --- CONTENT AREA --- */}
  <div className="
    flex flex-col md:flex-row 
    items-center md:items-center 
    justify-center md:justify-between 
    min-h-[80vh] w-full 
    px-6 md:px-16 lg:px-24 
    gap-12 pb-20
  ">

    {/* LEFT HERO TEXT */}
    <div className="w-full md:w-1/2 text-left pt-10 md:pt-0">
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
        Your Workflow.
        <br />
        <span className="text-[#FF4664]">Perfectly Tracked.</span>
      </h1>

      <p className="mt-4 text-base md:text-lg text-gray-300 max-w-md">
        Create, manage, and share progress checkpoints with anyone.
        Stay aligned and track every step effortlessly.
      </p>

      <ul className="mt-6 space-y-3 text-gray-200 text-lg">
        <li className="flex gap-2 items-center">
          <span className="text-[#FF4664]">✔</span>
          Create unlimited checkpoint chains
        </li>
        <li className="flex gap-2 items-center">
          <span className="text-[#FF4664]">✔</span>
          Share with anyone using a simple link
        </li>
        <li className="flex gap-2 items-center">
          <span className="text-[#FF4664]">✔</span>
          Mark progress in real-time
        </li>
      </ul>
    </div>

    {/* --- RIGHT LOGIN CARD --- */}
    <div className="w-full md:w-1/2 flex justify-center">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-center text-xl font-semibold mb-4">
          Sign in
        </h2>

        {!confirmation ? (
          <form onSubmit={handleSendCode} className="space-y-4">

            <div className="flex items-center gap-2 bg-white/5 border border-white/20 rounded-lg px-3 py-2">
              <span className="text-gray-300">📞</span>
              <input
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent w-full outline-none text-white placeholder-gray-400"
              />
            </div>

            <div id="recaptcha-container" />

            <button
              disabled={loading}
              className="w-full bg-[#FF4664] hover:bg-[#e33a55] transition-all py-2 rounded-lg text-white font-semibold"
            >
              Send Code
            </button>

          </form>
        ) : (
          <form onSubmit={handleConfirmCode} className="space-y-4">
            <input
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-white/5 border border-white/20 text-white placeholder-gray-400 p-2 rounded-lg outline-none"
            />
            <button
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg text-white font-semibold"
            >
              Confirm Code
            </button>
          </form>
        )}

        {message && (
          <div className="mt-3 text-sm text-gray-200 text-center">
            {message}
          </div>
        )}
      </div>
    </div>
  </div>
</div>

);

}
