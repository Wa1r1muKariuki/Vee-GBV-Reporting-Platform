"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  TrendingUp,
  LogOut,
  Loader2,
  Download
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Stats {
  total: number;
  unverified: number;
  verified: number;
  rejected: number;
  by_type: Record<string, number>;
  by_county: Record<string, number>;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifiedReports, setVerifiedReports] = useState<any[]>([]);
  const [rejectedReports, setRejectedReports] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("vee_admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    fetchAllData(token);
  }, [router]);

  const fetchAllData = async (token: string) => {
    try {
      // Fetch stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { "x-admin-token": token }
      });

      if (statsRes.status === 401) {
        localStorage.removeItem("vee_admin_token");
        router.push("/admin");
        return;
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      // Fetch verified reports
      const verifiedRes = await fetch(`${API_URL}/admin/reports/verified`, {
        headers: { "x-admin-token": token }
      });

      if (verifiedRes.ok) {
        const verifiedData = await verifiedRes.json();
        setVerifiedReports(verifiedData.data || []);
      }

      // Fetch rejected reports
      const rejectedRes = await fetch(`${API_URL}/admin/reports/rejected`, {
        headers: { "x-admin-token": token }
      });

      if (rejectedRes.ok) {
        const rejectedData = await rejectedRes.json();
        setRejectedReports(rejectedData.data || []);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vee_admin_token");
    router.push("/admin");
  };

  const handleExportCSV = async () => {
    const token = localStorage.getItem("vee_admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/reports/export`, {
        headers: { "x-admin-token": token }
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vee_reports_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export reports");
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
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
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-teal-400">📊 Analytics & Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive overview of all reports
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            ← Back to Queue
          </Link>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition flex items-center gap-2 text-sm"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-blue-400" size={24} />
              <span className="text-3xl font-bold text-white">{stats.total}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Reports</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-yellow-400" size={24} />
              <span className="text-3xl font-bold text-white">{stats.unverified}</span>
            </div>
            <p className="text-slate-400 text-sm">Pending Review</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-400" size={24} />
              <span className="text-3xl font-bold text-white">{stats.verified}</span>
            </div>
            <p className="text-slate-400 text-sm">Verified</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="text-red-400" size={24} />
              <span className="text-3xl font-bold text-white">{stats.rejected}</span>
            </div>
            <p className="text-slate-400 text-sm">Rejected</p>
          </div>
        </div>
      )}

      {/* By Type */}
      {stats && Object.keys(stats.by_type).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="text-teal-400" size={24} />
            Reports by Incident Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.by_type).map(([type, count]) => (
              <div key={type} className="bg-black/30 rounded-lg p-4 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 capitalize">{type.replace(/_/g, " ")}</span>
                  <span className="text-2xl font-bold text-teal-400">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By County */}
      {stats && Object.keys(stats.by_county).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="text-teal-400" size={24} />
            Reports by County
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.by_county).map(([county, count]) => (
              <div key={county} className="bg-black/30 rounded-lg p-4 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">{county}</span>
                  <span className="text-2xl font-bold text-teal-400">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Reports */}
      {verifiedReports.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-green-400">✅ Verified Reports</h2>
          <div className="space-y-4">
            {verifiedReports.slice(0, 10).map((report) => (
              <div key={report.id} className="bg-black/30 rounded-lg p-4 border border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                    {report.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-slate-500">{formatDate(report.timestamp)}</span>
                </div>
                <p className="text-slate-400 text-sm">📍 {report.county} {report.specific_area && `- ${report.specific_area}`}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Reports */}
      {rejectedReports.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-red-400">❌ Rejected Reports</h2>
          <div className="space-y-4">
            {rejectedReports.slice(0, 10).map((report) => (
              <div key={report.id} className="bg-black/30 rounded-lg p-4 border border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                    {report.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-slate-500">{formatDate(report.timestamp)}</span>
                </div>
                <p className="text-slate-400 text-sm">📍 {report.county}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}