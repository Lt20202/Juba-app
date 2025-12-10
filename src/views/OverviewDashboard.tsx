

import React, { useEffect, useState } from 'react';
import { InspectionData } from '../types';

interface OverviewDashboardProps {
    appScriptUrl: string;
    onNavigate: (module: string) => void;
    userRole?: string;
}

interface AggregatedStats {
    totalInspections: number;
    passRate: number;
    totalActiveVehicles: number;
    criticalIssues: number;
    byType: {
        general: number;
        petroleum: number;
        acid: number;
    };
    recentActivity: (InspectionData & { type: string })[];
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ appScriptUrl, onNavigate, userRole }) => {
    const [stats, setStats] = useState<AggregatedStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (appScriptUrl) {
            fetchAllData();
        }
    }, [appScriptUrl]);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${appScriptUrl}?t=${new Date().getTime()}`);
            const json = await response.json();
            
            // Helper to process rows into objects
            const processSheet = (rows: any[], headers: string[]): InspectionData[] => {
                if (!Array.isArray(rows) || rows.length <= 1) return [];
                return rows.slice(1).map((row: any[]) => {
                    const item: any = {};
                    headers.forEach((h, i) => { item[h] = row[i]; });
                    return item;
                });
            };

            // Define headers (simplified for stats extraction)
            // We mainly need rate, timestamp, truckNo, remarks
            const generalList = processSheet(json['General'], ['id', 'timestamp', 'truckNo', 'trailerNo', 'inspectedBy', 'driverName', 'location', 'odometer', 'rate', 'remarks']);
            const petroleumList = processSheet(json['Petroleum'], ['id', 'timestamp', 'truckNo', 'trailerNo', 'jobCard', 'location', 'odometer', 'inspectedBy', 'driverName', 'rate', 'remarks']);
            const petroleumV2List = processSheet(json['Petroleum_V2'], ['id', 'timestamp', 'truckNo', 'trailerNo', 'jobCard', 'location', 'odometer', 'inspectedBy', 'driverName', 'rate', 'remarks']);
            const acidList = processSheet(json['Acid'], ['id', 'timestamp', 'truckNo', 'trailerNo', 'jobCard', 'location', 'odometer', 'inspectedBy', 'driverName', 'rate', 'remarks']);

            const allInspections = [
                ...generalList.map(i => ({...i, type: 'General'})),
                ...petroleumList.map(i => ({...i, type: 'Petroleum'})),
                ...petroleumV2List.map(i => ({...i, type: 'Petroleum V2'})),
                ...acidList.map(i => ({...i, type: 'Acid'}))
            ];

            const total = allInspections.length;
            const passed = allInspections.filter(i => Number(i.rate) >= 4).length;
            const critical = allInspections.filter(i => Number(i.rate) <= 2).length;
            const vehicles = new Set(allInspections.map(i => i.truckNo)).size;

            // Sort by date desc for recent activity
            const sorted = allInspections.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            setStats({
                totalInspections: total,
                passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
                totalActiveVehicles: vehicles,
                criticalIssues: critical,
                byType: {
                    general: generalList.length,
                    petroleum: petroleumList.length + petroleumV2List.length,
                    acid: acidList.length
                },
                recentActivity: sorted.slice(0, 10)
            });

        } catch (error) {
            console.error("Dashboard Fetch Error", error);
        } finally {
            setIsLoading(false);
        }
    };

    const StatCard = ({ title, value, subtext, icon, color }: any) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between transition hover:shadow-md">
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
                <h3 className="text-3xl font-black text-slate-800">{value}</h3>
                <p className={`text-xs mt-1 font-medium ${subtext.includes('+') ? 'text-green-600' : 'text-gray-400'}`}>{subtext}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${color}`}>
                {icon}
            </div>
        </div>
    );

    const QuickAction = ({ label, module, color }: any) => (
        <button 
            onClick={() => onNavigate(module)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition gap-2 group`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">{label}</span>
        </button>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Executive Dashboard</h1>
                    <p className="text-gray-500 font-medium mt-1">Overview of fleet safety and inspection operations</p>
                </div>
                <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-gray-400 uppercase bg-gray-100 px-3 py-1 rounded-full">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                     </span>
                     <button onClick={fetchAllData} className="p-2 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition">
                        <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                     </button>
                </div>
            </div>

            {isLoading && !stats ? (
                 <div className="h-64 flex items-center justify-center text-gray-400">Loading Analytics...</div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Total Inspections" 
                            value={stats?.totalInspections || 0} 
                            subtext="All time records" 
                            color="from-blue-500 to-blue-700"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>}
                        />
                        <StatCard 
                            title="Safety Score" 
                            value={`${stats?.passRate || 0}%`} 
                            subtext="Average compliance" 
                            color="from-green-500 to-emerald-700"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        />
                         <StatCard 
                            title="Active Vehicles" 
                            value={stats?.totalActiveVehicles || 0} 
                            subtext="Unique trucks inspected" 
                            color="from-purple-500 to-indigo-700"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>}
                        />
                         <StatCard 
                            title="Critical Failures" 
                            value={stats?.criticalIssues || 0} 
                            subtext="Requires immediate attention" 
                            color="from-red-500 to-rose-700"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}
                        />
                    </div>

                    {/* Middle Section: Distribution & Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Inspection Distribution */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                             <h3 className="text-lg font-bold text-gray-800 mb-6">Inspection Breakdown</h3>
                             <div className="space-y-6">
                                 {/* General */}
                                 <div>
                                     <div className="flex justify-between text-sm font-medium mb-1">
                                         <span className="text-gray-600">General Inspections</span>
                                         <span className="text-gray-900">{stats?.byType.general}</span>
                                     </div>
                                     <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                         <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(stats?.byType.general || 0) / (stats?.totalInspections || 1) * 100}%` }}></div>
                                     </div>
                                 </div>
                                 {/* Petroleum */}
                                 <div>
                                     <div className="flex justify-between text-sm font-medium mb-1">
                                         <span className="text-gray-600">Petroleum Tankers</span>
                                         <span className="text-gray-900">{stats?.byType.petroleum}</span>
                                     </div>
                                     <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                         <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${(stats?.byType.petroleum || 0) / (stats?.totalInspections || 1) * 100}%` }}></div>
                                     </div>
                                 </div>
                                 {/* Acid */}
                                 <div>
                                     <div className="flex justify-between text-sm font-medium mb-1">
                                         <span className="text-gray-600">Acid Tankers</span>
                                         <span className="text-gray-900">{stats?.byType.acid}</span>
                                     </div>
                                     <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                         <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${(stats?.byType.acid || 0) / (stats?.totalInspections || 1) * 100}%` }}></div>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* Quick Start */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <QuickAction label="General" module="general" color="bg-blue-600" />
                                <QuickAction label="Petroleum" module="petroleum" color="bg-orange-600" />
                                <QuickAction label="Petro V2" module="petroleum_v2" color="bg-red-600" />
                                <QuickAction label="Acid" module="acid" color="bg-purple-600" />
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400 text-center">
                                    Start a new inspection based on vehicle type.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Recent Activity Feed</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Vehicle</th>
                                        <th className="px-6 py-4">Inspector</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {stats?.recentActivity.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded 
                                                    ${item.type === 'General' ? 'bg-blue-100 text-blue-700' : 
                                                      item.type === 'Acid' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}
                                                `}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">{item.truckNo}</td>
                                            <td className="px-6 py-4 text-gray-600">{item.inspectedBy}</td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                 <span className={`font-bold ${Number(item.rate) >= 4 ? 'text-green-600' : Number(item.rate) <= 2 ? 'text-red-600' : 'text-amber-600'}`}>
                                                     {item.rate}/5
                                                 </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {stats?.recentActivity.length === 0 && (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">No recent activity found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default OverviewDashboard;
