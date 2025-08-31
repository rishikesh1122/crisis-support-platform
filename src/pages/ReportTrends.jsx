import React, { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaChartBar, FaClipboardList, FaHourglassHalf, FaTachometerAlt } from "react-icons/fa";

// --- Mock API Data ---
// In a real app, this data would come from your backend (e.g., GET /api/reports/stats)
const getMockStats = () => {
    const reportsOverTime = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
            date: date.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 15) + 1,
        };
    });

    return {
        totalReports: 1245,
        pendingCount: 78,
        avgResolutionTime: "36.5 hours",
        categoryCounts: [
            { name: "Technical", count: 450 },
            { name: "Billing", count: 150 },
            { name: "Account", count: 275 },
            { name: "Content", count: 300 },
            { name: "Other", count: 70 },
        ],
        reportsOverTime,
        recentReports: [
            { id: 'rep-1', title: 'Cannot login on mobile', status: 'Pending', user: 'Alice' },
            { id: 'rep-2', title: 'Billing invoice incorrect', status: 'In Progress', user: 'Bob' },
            { id: 'rep-3', title: 'User profile picture not updating', status: 'Resolved', user: 'Charlie' },
            { id: 'rep-4', title: 'Feature request: Dark Mode', status: 'Resolved', user: 'David' },
        ],
    };
};

const ReportTrends = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1200));
            try {
                // In a real app: const res = await axios.get('/api/reports/stats', ...);
                const mockData = getMockStats();
                setStats(mockData);
            } catch (err) {
                console.error("Error fetching report stats:", err);
                setError("Failed to load analytics data.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);
    
    if (loading) return <SkeletonLoader />;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!stats) return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <FaChartBar className="text-3xl text-purple-600 dark:text-purple-400" />
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Report Trends & Analytics</h2>
            </div>
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<FaClipboardList className="text-blue-500"/>} label="Total Reports" value={stats.totalReports} />
                <StatCard icon={<FaHourglassHalf className="text-amber-500"/>} label="Pending Issues" value={stats.pendingCount} />
                <StatCard icon={<FaTachometerAlt className="text-emerald-500"/>} label="Avg. Resolution Time" value={stats.avgResolutionTime} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border dark:border-slate-700">
                    <TrendsLineChart data={stats.reportsOverTime} />
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border dark:border-slate-700">
                    <CategoryBarChart data={stats.categoryCounts} />
                </div>
            </div>
            
            {/* Recent Reports Table */}
            <RecentReportsTable reports={stats.recentReports} />
        </div>
    );
};

// --- Sub-components for a Cleaner Structure ---

const StatCard = ({ icon, label, value }) => (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md flex items-center gap-5 transition-transform hover:scale-105">
        <div className="text-4xl bg-slate-100 dark:bg-slate-700 p-4 rounded-full">{icon}</div>
        <div>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    </div>
);

const TrendsLineChart = ({ data }) => (
    <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Reports Filed (Last 30 Days)</h3>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white' }} />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="count" name="Reports" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const CategoryBarChart = ({ data }) => (
    <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Reports by Category</h3>
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
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Recent Activity</h3>
        <div className="overflow-x-auto bg-white dark:bg-slate-800/50 rounded-lg shadow-md border dark:border-slate-700">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                    <tr>
                        <th className="px-6 py-3">Report Title</th>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map(report => (
                        <tr key={report.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50 transition">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{report.title}</td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{report.user}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${ report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : report.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800' }`}>{report.status}</span></td>
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
