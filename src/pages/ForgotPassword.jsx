import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }

    // Optional: redirect after cooldown ends
    if (emailSent && cooldown === 0) {
      navigate("/login");
    }
  }, [cooldown, emailSent, navigate]);

  const handleRecover = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset email sent! Please check your inbox");
      setEmailSent(true);
      setCooldown(8);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md space-y-4">
        <h2 className="text-xl font-bold text-center">Recover Password</h2>

        {message && (
          <div className="p-3 text-sm text-blue-800 bg-blue-100 border border-blue-300 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleRecover} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={emailSent}
          />
          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="cursor-pointer w-full py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Sending..."
              : cooldown > 0
              ? `Redirecting in ${cooldown}s`
              : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
