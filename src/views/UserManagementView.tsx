




import React, { useState, useEffect } from 'react';
import { User, ValidationLists } from '../types';
import AutocompleteInput from '../components/ui/AutocompleteInput';

interface UserManagementViewProps {
    currentUser: User;
    appScriptUrl: string;
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    validationLists: ValidationLists;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUser, appScriptUrl, showToast, validationLists }) => {
    // User type extended with password for sharing logic (even though interface doesn't strictly have it, response does)
    const [users, setUsers] = useState<(User & {password?: string})[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // View State: 'list' or 'form'
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [isEditing, setIsEditing] = useState(false);
    const [originalUsername, setOriginalUsername] = useState('');
    
    // Form State
    const [formData, setFormData] = useState<{
        name: string;
        username: string;
        password: string;
        role: 'Admin' | 'Inspector' | 'Operations' | 'Maintenance' | 'Other';
        position: string;
    }>({
        name: '',
        username: '',
        password: '',
        role: 'Inspector',
        position: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        if (!appScriptUrl) return;
        setIsLoading(true);
        try {
            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'get_users' })
            });
            const result = await response.json();
            if (result.status === 'success' && Array.isArray(result.users)) {
                setUsers(result.users);
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to load users", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (username: string) => {
        if (!window.confirm(`Are you sure you want to remove user "${username}"?`)) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'delete_user', username })
            });
            const result = await response.json();
            if (result.status === 'success') {
                showToast("User removed successfully", 'success');
                fetchUsers();
            } else {
                showToast(result.message || "Failed to delete user", 'error');
            }
        } catch (e) {
            showToast("Connection failed", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setFormData({
            name: user.name,
            username: user.username,
            role: user.role,
            position: user.position || '',
            password: '' // Leave empty for edit
        });
        setOriginalUsername(user.username);
        setIsEditing(true);
        setViewMode('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.username) {
            showToast("Please fill in required fields.", 'error');
            return;
        }

        if (!isEditing && !formData.password) {
             showToast("Password is required for new users.", 'error');
             return;
        }

        setIsSubmitting(true);
        
        try {
            const payload: any = {
                action: isEditing ? 'update_user' : 'register_user',
                ...formData
            };
            
            if (isEditing) {
                payload.originalUsername = originalUsername;
            }

            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                showToast(isEditing ? "User updated successfully" : "User created successfully", 'success');
                setViewMode('list');
                setFormData({ name: '', username: '', password: '', role: 'Inspector', position: '' });
                setIsEditing(false);
                fetchUsers();
            } else {
                showToast(result.message || "Operation failed", 'error');
            }
        } catch (e) {
            showToast("Connection failed", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShareWhatsApp = (user: User & {password?: string}) => {
        const text = `*SafetyCheck Pro User Details*\n\nName: ${user.name}\nRole: ${user.role}\nPosition: ${user.position || 'N/A'}\n\n*Login Credentials*\nUsername: ${user.username}\nPassword: ${user.password || '****'}\n\nLogin at: ${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleShareEmail = (user: User & {password?: string}) => {
        const subject = `Account Details: ${user.name}`;
        const body = `Hello ${user.name},\n\nHere are your account details for SafetyCheck Pro:\n\nName: ${user.name}\nRole: ${user.role}\nPosition: ${user.position || 'N/A'}\n\nLogin Credentials:\nUsername: ${user.username}\nPassword: ${user.password || '****'}\n\nAccess the system here: ${window.location.href}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    // Case insensitive check
    const isAdmin = currentUser.role && currentUser.role.toLowerCase() === 'admin';

    if (!isAdmin) {
        return <div className="p-8 text-center text-red-600 font-bold">Access Denied. Admin Privileges Required.</div>;
    }

    // --- FORM VIEW (CREATE & EDIT) ---
    if (viewMode === 'form') {
        return (
            <div className="max-w-lg mx-auto animate-fadeIn py-4 px-2 sm:px-0">
                <button 
                    onClick={() => setViewMode('list')}
                    className="mb-4 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-xs font-bold uppercase tracking-wider"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to List
                </button>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">
                            {isEditing ? 'Edit User Details' : 'Create New User'}
                        </h2>
                        <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-blue-600 border border-gray-100">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            {/* Full Name */}
                            <div className="space-y-1">
                                <AutocompleteInput
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={v => setFormData({...formData, name: v})}
                                    options={validationLists.inspectors} 
                                    isTitleCase={true}
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            {/* Position & Role (Side-by-Side) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <AutocompleteInput
                                        label="Position"
                                        value={formData.position}
                                        onChange={v => setFormData({...formData, position: v})}
                                        options={validationLists.positions} 
                                        isTitleCase={true}
                                        placeholder="Job Title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">System Role</label>
                                    <select 
                                        className="w-full p-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-sm font-medium transition-colors text-gray-800"
                                        value={formData.role}
                                        onChange={e => setFormData({...formData, role: e.target.value as any})}
                                    >
                                        <option value="Inspector">Inspector</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Other">Other</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            {/* Username & Password (Side-by-Side) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Username</label>
                                    <input 
                                        type="text" required 
                                        className="w-full p-3.5 border rounded-lg outline-none font-medium transition-all text-sm bg-gray-50 border-gray-200 text-gray-800 focus:ring-2 focus:ring-blue-500"
                                        value={formData.username}
                                        onChange={e => setFormData({...formData, username: e.target.value})}
                                        placeholder="jdoe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">
                                        Password {isEditing && <span className="text-gray-400 font-normal normal-case">(Optional)</span>}
                                    </label>
                                    <input 
                                        type="password" 
                                        required={!isEditing}
                                        className="w-full p-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 font-medium transition-all text-sm"
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        placeholder={isEditing ? "Leave blank to keep current" : "••••"}
                                    />
                                </div>
                            </div>
                            
                            {/* Role Description - Compact */}
                            <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded border border-gray-100">
                                {formData.role === 'Admin' ? 'Admin: Full system access (Settings, Users, Deletion).' : 
                                 formData.role === 'Inspector' ? 'Inspector: Can create and submit new inspections.' : 
                                 'View Only: Can access dashboards and reports.'}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setViewMode('list')}
                                    className="flex-1 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition disabled:bg-blue-400 text-sm flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    </span>
                    User Management
                </h2>
                <div className="flex gap-3 w-full sm:w-auto">
                     <button 
                        onClick={fetchUsers} 
                        className="flex-1 sm:flex-none justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Refresh
                    </button>
                    <button 
                        onClick={() => {
                            setFormData({ name: '', username: '', password: '', role: 'Inspector', position: '' });
                            setIsEditing(false);
                            setViewMode('form');
                        }}
                        className="flex-1 sm:flex-none justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md flex items-center gap-2 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Add User
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3">Name / Position</th>
                                <th className="px-4 py-3">Username</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Last Login</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">{isLoading ? 'Loading users...' : 'No users found.'}</td></tr>
                            ) : (
                                users.map((u, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-gray-900">{u.name}</div>
                                            <div className="text-xs text-gray-500">{u.position}</div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-gray-600">{u.username}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold 
                                                ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 
                                                  u.role === 'Operations' ? 'bg-blue-100 text-blue-700' :
                                                  u.role === 'Maintenance' ? 'bg-orange-100 text-orange-700' :
                                                  'bg-green-100 text-green-700'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {u.username !== currentUser.username && (
                                                <div className="flex justify-end gap-2">
                                                    {/* WhatsApp Share */}
                                                    <button 
                                                        onClick={() => handleShareWhatsApp(u)}
                                                        title="Share details & password"
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded border border-transparent hover:border-green-200 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                                    </button>
                                                    
                                                    {/* Email Share */}
                                                    <button 
                                                        onClick={() => handleShareEmail(u)}
                                                        title="Share details & password via Email"
                                                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                    </button>

                                                    {/* Edit */}
                                                    <button 
                                                        onClick={() => handleEdit(u)}
                                                        title="Edit User"
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                    </button>

                                                    {/* Delete */}
                                                    <button 
                                                        onClick={() => handleDelete(u.username)}
                                                        title="Delete User"
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagementView;