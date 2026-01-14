import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaChartBar, FaClipboardList, FaHourglassHalf, FaTachometerAlt } from "react-icons/fa";

const RANGE_OPTIONS = [
    { label: "Last 30 days", value: 30 },
    { label: "Last 3 months", value: 90 },
    { label: "Last 6 months", value: 180 },
    { label: "Last year", value: 365 },
];

const ReportTrends = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rangeDays, setRangeDays] = useState(30);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`/api/reports/stats?rangeDays=${rangeDays}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching report stats:", err);
                setError("Failed to load analytics data.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [rangeDays]);
    const showSkeleton = loading && !stats;
    const refreshing = loading && !!stats;

    if (showSkeleton) return <SkeletonLoader />;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!stats) return null;

    return (
        <div className="space-y-8 text-slate-100">
            <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                    <FaChartBar className="text-3xl text-cyan-300" />
                    <div>
                        <h2 className="text-3xl font-bold text-white">Report Trends & Analytics</h2>
                        <p className="text-sm text-slate-300">Range: {stats.rangeDays || rangeDays} days</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {RANGE_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setRangeDays(opt.value)}
                            className={`px-3 py-2 rounded-lg text-sm border transition ${rangeDays === opt.value
                                ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-transparent shadow"
                                : "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10"}`}
                            disabled={refreshing && rangeDays === opt.value}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
            {refreshing && <p className="text-sm text-slate-300">Updating…</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<FaClipboardList className="text-blue-400"/>} label="Total Reports" value={stats.totalReports} />
                <StatCard icon={<FaHourglassHalf className="text-amber-300"/>} label="Pending" value={stats.pendingCount} />
                <StatCard icon={<FaTachometerAlt className="text-emerald-300"/>} label="Resolved" value={stats.resolvedCount} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white/5 border border-white/10 p-6 rounded-xl shadow-md backdrop-blur-xl relative overflow-hidden">
                    {refreshing && <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center text-slate-200 text-sm">Updating…</div>}
                    <TrendsLineChart data={stats.reportsOverTime} label={`Last ${stats.rangeDays || rangeDays} Days`} />
                </div>
                <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 rounded-xl shadow-md backdrop-blur-xl">
                    <CategoryBarChart data={stats.statusCounts} />
                </div>
            </div>
            
            <RecentReportsTable reports={stats.recentReports} />
        </div>
    );
};

// --- Sub-components for a Cleaner Structure ---

const StatCard = ({ icon, label, value }) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded-xl shadow-md flex items-center gap-5 transition-transform hover:scale-105 backdrop-blur-xl">
        <div className="text-4xl bg-white/10 p-4 rounded-full text-white">{icon}</div>
        <div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-300">{label}</p>
        </div>
    </div>
);

const TrendsLineChart = ({ data, label }) => {
    const total = data.reduce((sum, d) => sum + (d.count || 0), 0);
    const hasData = total > 0;
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Reports Filed ({label})</h3>
                <span className="text-sm text-slate-300">Total: {total}</span>
            </div>
            {!hasData && <p className="text-sm text-slate-400 mb-3">No reports in this range.</p>}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" />
                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white' }} />
                        <Legend iconType="circle" />
                        <Line type="monotone" dataKey="count" name="Reports" stroke="#7c3aed" strokeWidth={2.4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const CategoryBarChart = ({ data }) => (
    <div>
        <h3 className="text-lg font-bold text-white mb-4">Reports by Status</h3>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={70} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white' }} />
                    <Bar dataKey="count" name="Count" fill="#82ca9d" background={{ fill: 'rgba(128, 128, 128, 0.05)' }} radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const RecentReportsTable = ({ reports }) => (
    <div>
        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
        <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-lg shadow-md backdrop-blur-xl">
            <table className="w-full text-sm text-left text-slate-200">
                <thead className="text-xs uppercase bg-white/5 text-slate-200">
                    <tr>
                        <th className="px-6 py-3">Report Title</th>
                        <th className="px-6 py-3">Created</th>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map(report => (
                        <tr key={report.id} className="border-b border-white/10 hover:bg-white/5 transition">
                            <td className="px-6 py-4 font-medium text-white">{report.title}</td>
                            <td className="px-6 py-4 text-slate-300">{new Date(report.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-slate-300">{report.user}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${ report.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-100' : report.status === 'Pending' ? 'bg-amber-500/20 text-amber-100' : 'bg-blue-500/20 text-blue-100' }`}>{report.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const SkeletonLoader = () => (
    <div className="space-y-8 animate-pulse">
        <div className="h-9 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            <div className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            <div className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 h-80 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
        <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
    </div>
);


export default ReportTrends;
