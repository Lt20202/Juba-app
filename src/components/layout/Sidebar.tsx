

import React from 'react';
import { SystemSettings, User } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: string;
  onSelectModule: (m: string) => void;
  settings: SystemSettings;
  user?: User; 
  onLogout?: () => void;
  onEditProfile?: () => void; 
  onLockedItemClick?: (featureName: string) => void; // Added prop for locked items
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeModule, onSelectModule, settings, user, onLogout, onEditProfile, onLockedItemClick }) => {
    
    // Check if user is admin (Case Insensitive)
    const isAdmin = user?.role && (user.role.toLowerCase() === 'admin');

    const NavItem = ({ id, label, icon, subLabel, isLocked = false }: { id: string, label: string, icon: React.ReactNode, subLabel?: string, isLocked?: boolean }) => {
        const isActive = activeModule === id;
        return (
            <button
                onClick={() => { 
                    if (isLocked && onLockedItemClick) {
                        onLockedItemClick(label);
                        onClose();
                    } else {
                        onSelectModule(id); 
                        onClose(); 
                    }
                }}
                className={`w-full group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden
                    ${isActive 
                        ? 'bg-gradient-to-r from-blue-600/90 to-blue-800/90 text-white shadow-lg shadow-blue-900/40 ring-1 ring-white/10' 
                        : isLocked 
                            ? 'hover:bg-amber-900/20 text-slate-500 cursor-not-allowed opacity-80' 
                            : 'hover:bg-white/5 text-slate-400 hover:text-white'
                    }
                `}
            >
                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_2px_rgba(34,211,238,0.5)]"></div>
                )}
                
                <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 text-cyan-300' : isLocked ? 'text-amber-500/70' : 'group-hover:scale-110'}`}>
                    {icon}
                </span>
                
                <div className="flex flex-col items-start relative z-10 text-left flex-1 min-w-0">
                    <div className="flex items-center justify-between w-full">
                        <span className={`text-sm font-bold tracking-wide truncate ${isActive ? 'text-white' : isLocked ? 'text-slate-500' : 'text-slate-300 group-hover:text-white'}`}>
                            {label}
                        </span>
                        {isLocked && (
                            <svg className="w-3.5 h-3.5 text-amber-500/80 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        )}
                    </div>
                    {subLabel && (
                        <span className={`text-[10px] ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                            {subLabel}
                        </span>
                    )}
                </div>
            </button>
        );
    };

    return (
        <>
            {/* Mobile Backdrop - Closes sidebar when clicking outside */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={onClose}
                ></div>
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-white transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 border-r border-slate-800/50 flex flex-col shadow-2xl`}>
                 {/* Header with System Settings */}
                 <div className="p-6 border-b border-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-900 shadow-lg shrink-0 overflow-hidden">
                                    {settings.companyLogo ? (
                                        <img src={settings.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-base font-black tracking-tight text-white leading-tight truncate">
                                        {settings.companyName || 'SafetyPro'}
                                    </h1>
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest truncate block">
                                        System Active
                                    </span>
                                </div>
                            </div>
                            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                </div>
                
                {/* Navigation */}
                <div className="px-4 py-4 flex-1 overflow-y-auto scrollbar-hide space-y-6">
                     <div>
                         <div className="space-y-1 mb-6">
                            <NavItem 
                                id="overview" 
                                label="Dashboard" 
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>} 
                             />
                         </div>

                         <div className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-6 h-[1px] bg-slate-700"></span> 
                            Inspections
                         </div>
                         <div className="space-y-1">
                             <NavItem 
                                id="general" 
                                label="General Inspection" 
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 012-2v0a2 2 0 012 2m9 0a2 2 0 012-2v0a2 2 0 012 2"></path></svg>} 
                             />
                             <NavItem 
                                id="petroleum" 
                                label="Petroleum Check #1" 
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>} 
                             />
                             <NavItem 
                                id="petroleum_v2" 
                                label="Petroleum Check #2" 
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>} 
                             />
                             <NavItem 
                                id="acid" 
                                label="Acid Tanker" 
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>} 
                             />
                         </div>
                     </div>

                     {/* OPERATIONS SUITE (LOCKED) */}
                     <div>
                         <div className="px-4 text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-6 h-[1px] bg-amber-900/50"></span> 
                            Operations Suite
                            <span className="bg-amber-500 text-[#0f172a] text-[8px] px-1 rounded font-bold">PRO</span>
                         </div>
                         <div className="space-y-1">
                             <NavItem 
                                id="journey_plan" 
                                label="Journey Management Plan" 
                                isLocked={true}
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>} 
                             />
                             <NavItem 
                                id="driver_trip" 
                                label="Driver Trip Report Card" 
                                isLocked={true}
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>} 
                             />
                             <NavItem 
                                id="fuel_control" 
                                label="Fuel Control Form" 
                                isLocked={true}
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>} 
                             />
                             <NavItem 
                                id="gate_pass" 
                                label="Advanced Gate Pass" 
                                isLocked={true}
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>} 
                             />
                         </div>
                     </div>

                     {isAdmin && (
                        <div>
                            <div className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-6 h-[1px] bg-slate-700"></span> 
                                Admin
                            </div>
                            <div className="space-y-1">
                                <NavItem 
                                    id="settings" 
                                    label="System Settings" 
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} 
                                />
                                <NavItem 
                                    id="users" 
                                    label="User Management" 
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>} 
                                />
                            </div>
                        </div>
                     )}
                </div>

                {/* Footer Actions: Profile & Logout */}
                <div className="p-4 mt-auto border-t border-slate-800/50 bg-[#0f172a]">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        
                        {/* User Info (Display Only) */}
                        <div className="flex-1 flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shrink-0 border-2 border-slate-800">
                                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'OP'}
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">
                                    {user?.name || 'User'}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                    {user?.role || 'User'}
                                </div>
                            </div>
                        </div>

                        {/* Actions Control Panel */}
                        <div className="flex items-center border-l border-slate-700/50 pl-2 ml-1 space-x-1">
                             {/* Settings Button (Replaces Text Link) */}
                            <button
                                onClick={onEditProfile}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                                title="Account Settings"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={onLogout}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all"
                                title="Sign Out"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H5a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
