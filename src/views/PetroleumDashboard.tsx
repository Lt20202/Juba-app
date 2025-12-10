import React, { useState, useMemo } from 'react';
import { InspectionData } from '../types';

interface PetroleumDashboardProps {
    stats: { total: number, passRate: number | string };
    startNewInspection: () => void;
    fetchHistory: () => void;
    isLoadingHistory: boolean;
    historyList: InspectionData[];
    onViewReport: (item: InspectionData) => void;
    onPrint: (item: InspectionData) => void;
    userRole?: string;
}

const PetroleumDashboard: React.FC<PetroleumDashboardProps> = ({ stats, startNewInspection, fetchHistory, isLoadingHistory, historyList, onViewReport, onPrint, userRole }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const displayList = useMemo(() => {
        let list = historyList;
        
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase();
            list = list.filter(item => 
                (item.truckNo && item.truckNo.toLowerCase().includes(lowerSearch)) ||
                (item.driverName && item.driverName.toLowerCase().includes(lowerSearch)) ||
                (item.inspectedBy && item.inspectedBy.toLowerCase().includes(lowerSearch))
            );
        } else {
            list = list.slice(0, 10);
        }
        return list;
    }, [historyList, searchTerm]);

    const handleShareWhatsApp = (item: InspectionData) => {
        const status = Number(item.rate) >= 4 ? '✅ PASSED' : Number(item.rate) === 3 ? '⚠️ WARNING' : '🛑 CRITICAL FAIL';
        const text = `*PETROLEUM INSPECTION SUMMARY*\n\n*Vehicle:* ${item.truckNo}\n*Trailer:* ${item.trailerNo}\n*Inspector:* ${item.inspectedBy}\n*Date:* ${new Date(item.timestamp).toLocaleDateString()}\n\n*Result:* ${status} (${item.rate}/5)\n*Remarks:* ${item.remarks || 'None'}\n\n_Please log in to SafetyCheck Pro to download the full PDF report._`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleShareEmail = (item: InspectionData) => {
        const status = Number(item.rate) >= 4 ? 'PASSED' : 'ATTENTION REQUIRED';
        const subject = `Petroleum Inspection: ${item.truckNo} - ${status}`;
        const body = `Dear Team,\n\nPlease find the petroleum inspection summary below:\n\nVEHICLE DETAILS\n----------------\nTruck: ${item.truckNo}\nTrailer: ${item.trailerNo}\nLocation: ${item.location}\n\nINSPECTION STATUS\n----------------\nInspector: ${item.inspectedBy}\nDate: ${new Date(item.timestamp).toLocaleString()}\nRating: ${item.rate}/5\nResult: ${status}\n\nREMARKS\n----------------\n${item.remarks || 'No specific remarks.'}\n\nNote: The full PDF report can be downloaded from the SafetyCheck Pro dashboard.`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const canCreate = userRole === 'Admin' || userRole === 'Inspector';

    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
          {/* Header Card - Compact */}
          <div className="bg-gradient-to-r from-amber-700 to-orange-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                   <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
               </div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div>
                       <h2 className="text-2xl font-bold mb-4">Petroleum Inspection #1</h2>
                       <div className="flex flex-wrap gap-4">
                           {canCreate && (
                               <button 
                                 onClick={startNewInspection}
                                 className="px-6 py-2.5 bg-white text-orange-900 hover:bg-gray-100 font-bold rounded-xl shadow-lg transition transform hover:scale-105 flex items-center gap-2"
                               >
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                   Start New Inspection
                               </button>
                           )}
                           <button 
                             onClick={fetchHistory}
                             className="px-6 py-2.5 bg-black/20 hover:bg-black/30 text-white font-semibold rounded-xl backdrop-blur-sm transition flex items-center gap-2"
                           >
                               <svg className={`w-5 h-5 ${isLoadingHistory ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                               Refresh Data
                           </button>
                       </div>
                   </div>
                   
                   <div className="flex gap-4">
                       <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 text-center min-w-[90px]">
                           <div className="text-2xl font-bold">{stats.total}</div>
                           <div className="text-[10px] text-orange-200 uppercase tracking-wide">Total</div>
                       </div>
                       <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 text-center min-w-[90px]">
                           <div className="text-2xl font-bold">{stats.passRate}%</div>
                           <div className="text-[10px] text-orange-200 uppercase tracking-wide">Compliance</div>
                       </div>
                   </div>
               </div>
          </div>
          
           {/* List Section */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      Recent Petroleum Inspections
                      {!searchTerm && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Last 10</span>}
                  </h3>
                  
                   {/* Search Bar */}
                   <div className="relative w-full md:w-72">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      </div>
                      <input 
                          type="text" 
                          placeholder="Search Truck, Driver or Inspector..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                      />
                  </div>
              </div>

              {isLoadingHistory ? (
                  <div className="py-12 text-center text-gray-500">Loading records...</div>
              ) : displayList.length === 0 ? (
                  <div className="py-12 text-center">
                      <div className="text-gray-400 mb-2">No petroleum inspections found.</div>
                      <p className="text-sm text-gray-500">{searchTerm ? 'Try a different search term.' : (canCreate ? 'Submit a new inspection to see it here.' : 'Ask an inspector to submit reports.')}</p>
                  </div>
              ) : (
                  <div className="divide-y divide-gray-100">
                      {displayList.map((item, i) => (
                          <div key={i} className="flex flex-col md:flex-row justify-between items-center p-4 hover:bg-gray-50 transition-colors gap-4">
                              <div className="flex items-center gap-4 w-full md:w-auto">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                                      ${Number(item.rate) >= 4 ? 'bg-gray-400' : Number(item.rate) === 3 ? 'bg-gray-400' : 'bg-gray-500'}
                                  `}>
                                      {item.rate}
                                  </div>
                                  <div>
                                      <div className="font-bold text-gray-800 text-sm">{item.truckNo}</div>
                                      <div className="text-xs text-gray-500 flex items-center gap-2">
                                          <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                          <span className="text-gray-300">•</span>
                                          <span className="font-medium text-gray-500">{item.inspectedBy}</span>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-1 w-full md:w-auto justify-end">
                                  {/* ACTION ICONS - GREY SCALE & SMALL */}
                                  <button 
                                    onClick={() => onViewReport(item)}
                                    title="View & Download Report"
                                    className="p-1.5 text-gray-500 bg-white hover:bg-gray-100 hover:text-blue-600 border border-gray-200 rounded transition-colors"
                                  >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                  </button>

                                  <button 
                                    onClick={() => handleShareWhatsApp(item)}
                                    title="Share Summary via WhatsApp"
                                    className="p-1.5 text-gray-500 bg-white hover:bg-gray-100 hover:text-green-600 border border-gray-200 rounded transition-colors"
                                  >
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                  </button>

                                  <button 
                                    onClick={() => handleShareEmail(item)}
                                    title="Share Summary via Email"
                                    className="p-1.5 text-gray-500 bg-white hover:bg-gray-100 hover:text-blue-600 border border-gray-200 rounded transition-colors"
                                  >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
              
              {displayList.length > 0 && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 text-center uppercase font-medium tracking-wide">
                      {searchTerm ? `Showing matching results` : 'Showing last 10 records'}
                  </div>
              )}
          </div>
      </div>
    );
}

export default PetroleumDashboard;