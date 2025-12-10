
import React, { useState } from 'react';
import { SystemSettings } from '../types';
import { BACKEND_SCRIPT_TEMPLATE } from '../constants';

interface SettingsViewProps {
    settings: SystemSettings;
    setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
    appScriptUrl: string;
    setAppScriptUrl: (url: string) => void;
    handleSaveSettings: () => void;
    isSavingSettings: boolean;
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
    settings, setSettings, appScriptUrl, setAppScriptUrl, handleSaveSettings, isSavingSettings, showToast 
}) => {
    const [isCopying, setIsCopying] = useState(false);

    const compressImage = (file: File, callback: (base64: string) => void) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Professional resizing logic
                const maxWidth = 300; 
                const maxHeight = 150;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                
                // Draw white background first
                if (ctx) {
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    callback(dataUrl);
                }
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          showToast("Compressing logo...", 'info');
          compressImage(file, (base64) => {
             setSettings(s => ({ ...s, companyLogo: base64 }));
             showToast("Logo processed. Click 'Save Configuration' to persist.", 'success');
          });
        }
    };

    const copyScriptToClipboard = () => {
        navigator.clipboard.writeText(BACKEND_SCRIPT_TEMPLATE);
        setIsCopying(true);
        showToast("Code copied to clipboard!", 'success');
        setTimeout(() => setIsCopying(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn space-y-8 pb-12">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
               <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  System Settings
              </h2>
             </div>
             
             {/* Configuration Card */}
             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                       <input 
                          type="text" 
                          value={settings.companyName} 
                          onChange={(e) => setSettings(s => ({...s, companyName: e.target.value}))}
                          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          placeholder="e.g., Apex Logistics Ltd."
                       />
                    </div>
                    
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Manager Email</label>
                       <input 
                          type="email" 
                          value={settings.managerEmail} 
                          onChange={(e) => setSettings(s => ({...s, managerEmail: e.target.value}))}
                          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          placeholder="manager@company.com"
                       />
                    </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Company Logo (For Reports)</label>
                   <div className="flex items-center gap-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                       <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                           {settings.companyLogo ? (
                               <img src={settings.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                           ) : (
                               <span className="text-xs text-gray-300">No Logo</span>
                           )}
                       </div>
                       <div className="flex-1">
                           <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                           />
                           <p className="text-xs text-gray-400 mt-2">
                               Image will be automatically resized & compressed for database storage. 
                               Recommended: PNG or JPG.
                           </p>
                       </div>
                   </div>
                </div>
             </div>

             {/* Connection Card */}
             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                    Database Connection
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Google Apps Script Web App URL</label>
                        <input 
                            type="text" 
                            value={appScriptUrl} 
                            onChange={(e) => setAppScriptUrl(e.target.value)}
                            placeholder="https://script.google.com/macros/s/..."
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs text-blue-800 break-all"
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                         <button 
                            onClick={handleSaveSettings} 
                            disabled={isSavingSettings}
                            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2
                                ${isSavingSettings ? 'bg-gray-400 cursor-wait' : 'bg-green-600 hover:bg-green-700 hover:scale-105'}
                            `}
                         >
                            {isSavingSettings ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Saving...
                                </>
                            ) : (
                                'Save Configuration'
                            )}
                         </button>
                    </div>
                </div>
             </div>

             {/* BACKEND SCRIPT SECTION */}
             <div className="bg-slate-900 text-slate-300 p-8 rounded-xl shadow-lg border border-slate-800">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-white text-lg font-bold flex items-center gap-2">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                            Backend Script Code (Updated)
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Copy this code into your Google Sheet's <strong>Extensions &gt; Apps Script</strong> editor. <br/>
                            <span className="text-yellow-400">Note: This script now handles Authentication and Validation lists.</span>
                        </p>
                    </div>
                    <button 
                        onClick={copyScriptToClipboard}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all
                            ${isCopying ? 'bg-green-500 border-green-500 text-white' : 'bg-transparent border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white'}
                        `}
                    >
                        {isCopying ? 'Copied!' : 'Copy Code'}
                    </button>
                </div>
                
                <div className="relative">
                    <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-[10px] sm:text-xs font-mono text-green-400 border border-slate-800 h-64 overflow-y-auto">
                        {BACKEND_SCRIPT_TEMPLATE}
                    </pre>
                </div>
             </div>
        </div>
    );
}

export default SettingsView;
