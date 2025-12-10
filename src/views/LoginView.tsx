





import React, { useState } from 'react';
import { User, SystemSettings } from '../types';
import { BACKEND_SCRIPT_TEMPLATE } from '../constants';

interface LoginViewProps {
  onLogin: (user: User) => void;
  appScriptUrl: string;
  setAppScriptUrl: (url: string) => void;
  settings: SystemSettings;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, appScriptUrl, setAppScriptUrl, settings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfig, setShowConfig] = useState(!appScriptUrl); // Only show if URL is missing
  const [showScriptModal, setShowScriptModal] = useState(false);
  
  // Registration State
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');

  const [isCopying, setIsCopying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appScriptUrl) {
      setError("System Database URL is missing. Please configure it.");
      setShowConfig(true);
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const payload = isRegistering 
        ? { action: 'register_user', username, password, name: fullName, position: position, role: 'Admin' }
        : { action: 'login', username, password };

      const response = await fetch(appScriptUrl, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();

      if (result.status === 'success') {
          if (isRegistering) {
              setError("Admin account created successfully! Please log in.");
              setIsRegistering(false);
              setFullName('');
              setPosition('');
              setPassword('');
          } else {
              const rawUser = result.user;
              const rawRole = rawUser.role ? String(rawUser.role).trim().toLowerCase() : '';
              
              // Robust Role Normalization
              let safeRole: User['role'] = 'Inspector'; // Default
              
              if (rawRole === 'admin') safeRole = 'Admin';
              else if (rawRole === 'operations') safeRole = 'Operations';
              else if (rawRole === 'maintenance') safeRole = 'Maintenance';
              else if (rawRole === 'other') safeRole = 'Other';
              else safeRole = 'Inspector';
                  
              const normalizedUser: User = {
                  ...rawUser,
                  role: safeRole,
                  position: rawUser.position || ''
              };

              onLogin(normalizedUser);
          }
      } else if (result.code === 'NO_USERS') {
          setError("Welcome! No users found in database. Please create the first Admin account.");
          setIsRegistering(true);
      } else {
          setError(result.message || "Authentication failed.");
      }

    } catch (err) {
      console.error("Login Error", err);
      setError("Connection failed. Please check your internet or the Script URL.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyScript = () => {
      navigator.clipboard.writeText(BACKEND_SCRIPT_TEMPLATE);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
       <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10">
          {/* Header */}
          <div className="bg-slate-50 p-8 border-b border-gray-100 flex flex-col items-center">
             <div 
                className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center mb-4 overflow-hidden p-2 cursor-pointer active:scale-95 transition-transform"
                onDoubleClick={() => setShowConfig(!showConfig)} // Secret gesture to toggle config
                title="Double click to configure system"
             >
                {settings.companyLogo ? (
                    <img src={settings.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                )}
             </div>
             <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center">
                 {settings.companyName || 'SafetyCheck Pro'}
             </h1>
             <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">
                 Inspector Portal
             </p>
          </div>

          {/* Form */}
          <div className="p-8 flex-1">
              <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                      <div className={`p-3 border text-xs font-semibold rounded-lg flex items-start gap-2 ${error.includes("Welcome") || error.includes("success") ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {error}
                      </div>
                  )}

                  {isRegistering && (
                      <>
                        <div className="space-y-1 animate-fadeIn">
                            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                            <input 
                                type="text" 
                                required 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder="e.g. John Doe"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1 animate-fadeIn">
                            <label className="text-xs font-bold text-gray-500 uppercase">Position / Job Title</label>
                            <input 
                                type="text" 
                                required 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder="e.g. Senior Inspector"
                                value={position}
                                onChange={e => setPosition(e.target.value)}
                            />
                        </div>
                      </>
                  )}

                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
                      <input 
                          type="text" 
                          required 
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          placeholder="Enter username"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                      />
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                      <input 
                          type="password" 
                          required 
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                      />
                  </div>

                  <button 
                      type="submit" 
                      disabled={isLoading}
                      className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all
                          ${isLoading ? 'bg-slate-400 cursor-wait' : isRegistering ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}
                      `}
                  >
                      {isLoading ? 'Processing...' : isRegistering ? 'Create Admin Account' : 'Sign In'}
                  </button>
              </form>

               {/* Back to Login link if registering */}
               {isRegistering && (
                  <div className="mt-4 text-center">
                       <button 
                        type="button" 
                        onClick={() => setIsRegistering(false)}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                          Cancel Registration
                      </button>
                  </div>
               )}

              {/* Bottom Footer Area - HIDDEN IF URL EXISTS */}
              {!appScriptUrl && (
                  <div className="mt-8 pt-4 border-t border-gray-50 flex justify-center">
                      <button 
                        type="button" 
                        onClick={() => setShowConfig(!showConfig)}
                        className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-gray-600 font-medium transition-colors"
                      >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          System Configuration
                      </button>
                  </div>
              )}

              {/* Configuration Panel (Hidden by default) */}
              {showConfig && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-fadeIn">
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Database URL</label>
                      <input 
                          type="text" 
                          value={appScriptUrl} 
                          onChange={e => setAppScriptUrl(e.target.value)}
                          placeholder="https://script.google.com/..."
                          className="w-full p-2 bg-white border border-gray-300 rounded text-xs font-mono text-gray-600 break-all focus:ring-1 focus:ring-blue-500 outline-none mb-3"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowScriptModal(true)}
                        className="w-full py-2 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                      >
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                         Get Backend Script Code
                      </button>
                  </div>
              )}
          </div>
       </div>

       {/* SCRIPT MODAL */}
       {showScriptModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                        Update Backend System
                    </h3>
                    <button onClick={() => setShowScriptModal(false)} className="text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                    <div className="mb-4 text-sm text-gray-600 space-y-2">
                        <p>To enable Login and User Management, you must update your Google Apps Script.</p>
                        <ol className="list-decimal pl-5 space-y-1 font-medium text-gray-800">
                            <li>Copy the code below.</li>
                            <li>Open your Google Spreadsheet &gt; Extensions &gt; Apps Script.</li>
                            <li>Replace all existing code with this new code.</li>
                            <li>Click <strong>Deploy &gt; New Deployment</strong>.</li>
                            <li>Select type <strong>Web App</strong>.</li>
                            <li>Set "Execute as" to <strong>Me</strong>.</li>
                            <li>Set "Who has access" to <strong>Anyone</strong>.</li>
                            <li>Copy the <strong>New Web App URL</strong> and paste it into the "System Configuration" box on the login screen.</li>
                        </ol>
                    </div>

                    <div className="relative">
                        <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-[10px] font-mono h-64 overflow-auto border border-slate-700">
                            {BACKEND_SCRIPT_TEMPLATE}
                        </pre>
                        <button 
                            onClick={copyScript}
                            className="absolute top-2 right-2 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded border border-white/20 backdrop-blur-sm transition-colors"
                        >
                            {isCopying ? 'Copied!' : 'Copy Code'}
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-gray-100 border-t border-gray-200 text-right">
                    <button 
                        onClick={() => setShowScriptModal(false)}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                    >
                        Done
                    </button>
                </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default LoginView;