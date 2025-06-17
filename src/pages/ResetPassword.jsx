import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  // Countdown timer for redirect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (success && cooldown === 0) {
      navigate("/login");
    }
  }, [cooldown, success, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully!");
      setSuccess(true);
      setCooldown(8);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md space-y-4">
        <h2 className="text-xl font-bold text-center">Set New Password</h2>

        {message && (
          <div className={`p-3 text-sm rounded border 
            ${success ? "text-green-800 bg-green-100 border-green-300" : "text-red-800 bg-red-100 border-red-300"}
          `}>
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={success}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={success}
            className="cursor-pointer w-full py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {success ? `Redirecting in ${cooldown}s` : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
