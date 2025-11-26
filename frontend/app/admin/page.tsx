"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn, AlertTriangle, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminLogin() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!token.trim()) {
      setError("Please enter a token");
      setLoading(false);
      return;
    }

    try {
      console.log("Testing connection to:", API_URL);
      
      // Test basic connectivity first
      const healthCheck = await fetch(`${API_URL}/health`, {
        method: "GET",
      }).catch(() => null);

      if (!healthCheck) {
        setError("Cannot connect to backend. Is it running on port 8000?");
        setLoading(false);
        return;
      }

      console.log("Health check passed, testing admin auth...");

      // Now test admin authentication
      const response = await fetch(`${API_URL}/admin/reports/unverified`, {
        method: "GET",
        headers: {
          "x-admin-token": token,
          "Accept": "application/json"
        }
      });

      console.log("Admin auth response:", response.status);

      if (response.status === 200) {
        // Success! Save token and redirect
        localStorage.setItem("vee_admin_token", token);
        console.log("Login successful, redirecting...");
        router.push("/admin/dashboard");
      } else if (response.status === 401) {
        setError("Invalid admin token. Check your .env file.");
      } else if (response.status === 500) {
        const errorData = await response.json().catch(() => ({}));
        setError(`Server error: ${errorData.detail || "Database connection failed"}`);
      } else {
        setError(`Unexpected error: ${response.status}`);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      
      if (err.message.includes("fetch")) {
        setError("Cannot reach backend. Make sure it's running on http://localhost:8000");
      } else {
        setError(`Connection error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950">
      <div className="bg-slate-900 p-10 rounded-2xl shadow-2xl border border-slate-800 w-96">
        <div className="flex justify-center mb-6 text-teal-400">
          <Lock size={48} />
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2">Vee Moderator Login</h1>
        <p className="text-center text-sm text-slate-500 mb-6">Access is restricted.</p>
        
        <input
          type="password"
          placeholder="Enter Admin Token"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white mb-4 focus:ring-2 focus:ring-teal-500 outline-none"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
          disabled={loading}
        />
        
        {error && (
          <div className="text-red-400 text-xs mb-4 p-3 bg-red-900/20 rounded-lg border border-red-500/30 flex items-start gap-2">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={loading || !token.trim()}
          className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-lg transition shadow-lg bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <LogIn size={18} />
              Log In
            </>
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-600">Backend: {API_URL}</p>
          <p className="text-xs text-slate-600 mt-1">Token from .env: VEE_ADMIN_TOKEN</p>
        </div>
      </div>
    </div>
  );
}