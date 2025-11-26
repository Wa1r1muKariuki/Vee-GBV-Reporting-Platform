"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertTriangle, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Report {
  id: number;
  county: string;
  type: string;
  story: string;
  timestamp: string;
  timeframe?: string;
  relationship?: string;
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("vee_admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    fetchReports(token);
  }, [router]);

  const fetchReports = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/reports/unverified`, {
        headers: { "x-admin-token": token }
      });

      if (res.status === 401) {
        localStorage.removeItem("vee_admin_token");
        router.push("/admin");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await res.json();
      
      // Handle both array response and object with data property
      const reportList = Array.isArray(data) ? data : (data.data || []);
      setReports(reportList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports");
      setLoading(false);
    }
  };

  const handleModeration = async (id: number, action: "approve" | "reject") => {
    const token = localStorage.getItem("vee_admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    setProcessingId(id);
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/reports/${id}/verify`, {
        method: "POST",
        headers: {
          "x-admin-token": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to process report");
      }

      const result = await res.json();
      console.log("Moderation result:", result);

      // Remove the report from the list
      setReports(prevReports => prevReports.filter(r => r.id !== id));
      
    } catch (err: any) {
      console.error("Error moderating report:", err);
      setError(`Failed to ${action} report: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vee_admin_token");
    router.push("/admin");
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-teal-400" />
          <p className="text-slate-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-teal-400">Vee Moderation Queue</h1>
          <p className="text-sm text-slate-500 mt-1">
            {reports.length} {reports.length === 1 ? "report" : "reports"} pending review
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Link
            href="/admin/reports"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg transition"
          >
            📊 Generate Reports
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3 text-red-400">
          <AlertTriangle size={20} />
          <p>{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <p className="text-xl text-slate-400">All caught up!</p>
          <p className="text-sm text-slate-600 mt-2">No pending reports to review.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-slate-700 transition"
            >
              {/* Report Header */}
              <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold uppercase">
                    {report.type.replace(/_/g, " ")}
                  </span>
                  {report.county && (
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                      📍 {report.county}
                    </span>
                  )}
                </div>
                <span className="text-slate-500 text-xs">
                  {formatDate(report.timestamp)}
                </span>
              </div>

              {/* Report Details */}
              <div className="bg-black/30 rounded-lg p-4 mb-4 border border-slate-800">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Incident Description:</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {report.story}
                </p>
              </div>

              {/* Additional Info */}
              {(report.timeframe || report.relationship) && (
                <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                  {report.timeframe && (
                    <div>
                      <span className="text-slate-500">Timeframe:</span>
                      <p className="text-slate-300 mt-1">{report.timeframe}</p>
                    </div>
                  )}
                  {report.relationship && (
                    <div>
                      <span className="text-slate-500">Perpetrator:</span>
                      <p className="text-slate-300 mt-1">{report.relationship}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleModeration(report.id, "approve")}
                  disabled={processingId === report.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600/20 text-green-400 py-3 rounded-lg hover:bg-green-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {processingId === report.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Verify & Publish
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleModeration(report.id, "reject")}
                  disabled={processingId === report.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600/20 text-red-400 py-3 rounded-lg hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {processingId === report.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}