
import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_DATA, InspectionData, InspectionStatus, InspectionItemConfig, SystemSettings, ValidationLists, User, AppNotification } from './types';
import { INSPECTION_ITEMS, INSPECTION_CATEGORIES, PETROLEUM_INSPECTION_ITEMS, PETROLEUM_CATEGORIES, ACID_INSPECTION_ITEMS, ACID_CATEGORIES, PETROLEUM_V2_ITEMS, PETROLEUM_V2_CATEGORIES } from './constants';
import CameraCapture from './components/CameraCapture';
import SignaturePad from './components/SignaturePad';
import { analyzeInspection } from './services/geminiService';

// UI Components
import Toast from './components/ui/Toast';
import StatusButton from './components/ui/StatusButton';
import Input from './components/ui/Input';
import AutocompleteInput from './components/ui/AutocompleteInput';
import Sidebar from './components/layout/Sidebar';
import ReportViewerModal from './components/ui/ReportViewerModal';
import SubmissionOverlay from './components/ui/SubmissionOverlay';
import ProfileModal from './components/ui/ProfileModal';
import NotificationCenter from './components/ui/NotificationCenter'; 
import UpgradeModal from './components/ui/UpgradeModal';

// Views
import LoginView from './views/LoginView';
import HistoryView from './views/HistoryView';
import SettingsView from './views/SettingsView';
import GeneralDashboard from './views/GeneralDashboard';
import PetroleumDashboard from './views/PetroleumDashboard';
import PetroleumV2Dashboard from './views/PetroleumV2Dashboard';
import AcidDashboard from './views/AcidDashboard';
import UserManagementView from './views/UserManagementView';
import OverviewDashboard from './views/OverviewDashboard';

// Reports
import PrintableGeneralReport from './components/reports/PrintableGeneralReport';
import PrintablePetroleumReport from './components/reports/PrintablePetroleumReport';
import PrintablePetroleumV2Report from './components/reports/PrintablePetroleumV2Report';
import PrintableAcidReport from './components/reports/PrintableAcidReport';

// ==========================================
// SYSTEM CONFIGURATION
// ==========================================
const PRE_CONFIGURED_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxoy5k_pnm_TussdnJqijOY5i3aqO4Pz9t10sAU7gH3hOEOsBLX54eE2jWJuTq8upRnGg/exec"; 

const SECTIONS = [
  { id: 'details', title: 'Details', label: 'General Info' },
  { id: 'photos', title: 'Photos', label: 'Exterior Photos' },
  { id: 'checklist_1', title: 'Checks I', label: 'Part I' },
  { id: 'checklist_2', title: 'Checks II', label: 'Part II' },
  { id: 'checklist_3', title: 'Checks III', label: 'Part III' },
  { id: 'sign', title: 'Finish', label: 'Signatures' },
  { id: 'summary', title: 'Report', label: 'Summary' }
];

const SHEET_HEADERS = [
  "id", "timestamp", "truckNo", "trailerNo", "inspectedBy", "driverName", "location", "odometer", "rate", "remarks", "aiAnalysis",
  "reflectiveWorkSuit", "safetyGear", "dustMask", "roadFitness", "validDriverDocs", "driverManual", "routeRisk",
  "windscreen", "mirrors", "chevrons", "generalCondition", "seatBelt",
  "headLamps", "indicators", "parkingLights", "reverseAlarm", "hornIgnition",
  "brakes", "tyres", "wheelNuts", "fluidLeaks", "fireExtinguisher", "warningTriangles", "firstAid",
  "trailerCondition", "fifthWheel", "landingLegs", "tarpaulins",
  "photoFront", "photoLS", "photoRS", "photoBack", "photoDamage",
  "inspectorSignature", "driverSignature"
];

const PETROLEUM_HEADERS = [
  "id", "timestamp", "truckNo", "trailerNo", "jobCard", "location", "odometer", "inspectedBy", "driverName", "rate", "remarks", "aiAnalysis",
  "petro_1", "petro_2", "petro_3", "petro_4", "petro_5", "petro_6", "petro_7", "petro_8", "petro_9", "petro_10",
  "petro_11", "petro_12", "petro_13", "petro_14", "petro_15", "petro_16", "petro_17", "petro_18", "petro_19", "petro_20",
  "petro_21", "petro_22", "petro_23", "petro_24", "petro_25", "petro_26", "petro_27", "petro_28", "petro_29", "petro_30",
  "petro_31", "petro_32", "petro_33", "petro_34", "petro_35", "petro_36", "petro_37", "petro_38", "petro_39", "petro_40",
  "petro_41", "petro_42", "petro_43", "petro_44", "petro_45", "petro_46", "petro_47", "petro_48", "petro_49", "petro_50",
  "petro_51", "petro_52", "petro_53", "petro_54",
  "photoFront", "photoLS", "photoRS", "photoBack", "photoDamage",
  "inspectorSignature", "driverSignature"
];

const PETROLEUM_V2_HEADERS = [
  "id", "timestamp", "truckNo", "trailerNo", "jobCard", "location", "odometer", "inspectedBy", "driverName", "rate", "remarks", "aiAnalysis",
  "petro2_1", "petro2_2", "petro2_3", "petro2_4", "petro2_5", "petro2_6", "petro2_7", "petro2_8", "petro2_9", "petro2_10",
  "petro2_11", "petro2_12", "petro2_13", "petro2_14", "petro2_15", "petro2_16", "petro2_17", "petro2_18", "petro2_19", "petro2_20",
  "petro2_21", "petro2_22", "petro2_23", "petro2_24", "petro2_25", "petro2_26", "petro2_27", "petro2_28", "petro2_29", "petro2_30",
  "petro2_31", "petro2_32", "petro2_33", "petro2_34", "petro2_35", "petro2_36", "petro2_37", "petro2_38", "petro2_39", "petro2_40",
  "petro2_41", "petro2_42", "petro2_43", "petro2_44", "petro2_45", "petro2_46", "petro2_47", "petro2_48", "petro2_49", "petro2_50",
  "petro2_51", "petro2_52", "petro2_53",
  "photoFront", "photoLS", "photoRS", "photoBack", "photoDamage",
  "inspectorSignature", "driverSignature"
];

const ACID_HEADERS = [
  "id", "timestamp", "truckNo", "trailerNo", "jobCard", "location", "odometer", "inspectedBy", "driverName", "rate", "remarks", "aiAnalysis",
  "acid_1", "acid_2", "acid_3", "acid_4", "acid_5", "acid_6", "acid_7", "acid_8", "acid_9", "acid_10",
  "acid_11", "acid_12", "acid_13", "acid_14", "acid_15", "acid_16", "acid_17", "acid_18", "acid_19", "acid_20",
  "acid_21", "acid_22", "acid_23", "acid_25", "acid_26", "acid_27", "acid_28", "acid_29", "acid_30",
  "acid_31", "acid_32", "acid_33", "acid_34",
  "photoFront", "photoLS", "photoRS", "photoBack", "photoDamage",
  "inspectorSignature", "driverSignature"
];

const App = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<InspectionData & any>(INITIAL_DATA); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Validation Lists
  const [validationLists, setValidationLists] = useState<ValidationLists>({
      trucks: [],
      trailers: [],
      drivers: [],
      inspectors: [],
      locations: [],
      positions: []
  });
  
  // Intelligent Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);
  const [globalAcknowledgedIds, setGlobalAcknowledgedIds] = useState<string[]>([]);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportData, setSelectedReportData] = useState<InspectionData | null>(null);
  
  // Navigation State
  const [activeModule, setActiveModule] = useState('overview'); 
  const [generalViewMode, setGeneralViewMode] = useState<'dashboard' | 'form'>('dashboard');
  const [petroleumViewMode, setPetroleumViewMode] = useState<'dashboard' | 'form'>('dashboard');
  const [petroleumV2ViewMode, setPetroleumV2ViewMode] = useState<'dashboard' | 'form'>('dashboard');
  const [acidViewMode, setAcidViewMode] = useState<'dashboard' | 'form'>('dashboard');

  // Upgrade Modal State
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);

  // Submission & Offline State
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'offline_saved'>('idle');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // History State
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Settings State
  const [appScriptUrl, setAppScriptUrl] = useState<string>(() => {
    if (PRE_CONFIGURED_SCRIPT_URL && PRE_CONFIGURED_SCRIPT_URL.length > 0) return PRE_CONFIGURED_SCRIPT_URL;
    if (typeof window !== 'undefined') return localStorage.getItem('safetyCheck_scriptUrl') || '';
    return '';
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('safetyCheck_settings');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { console.error("Failed to parse local settings", e); }
        }
    }
    return { companyName: 'My Transport Co.', managerEmail: '' };
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Initialize
  useEffect(() => {
    if (appScriptUrl) {
        fetchSystemSettings(appScriptUrl);
    }
    const savedUser = localStorage.getItem('safetyCheck_user');
    if (savedUser) {
        try { 
            const u = JSON.parse(savedUser);
            // Robust normalization on load
            const rawRole = u.role ? String(u.role).trim().toLowerCase() : '';
            if (rawRole === 'admin') u.role = 'Admin';
            else if (rawRole === 'operations') u.role = 'Operations';
            else if (rawRole === 'maintenance') u.role = 'Maintenance';
            else if (rawRole === 'other') u.role = 'Other';
            else u.role = 'Inspector';
            
            setCurrentUser(u); 
        } catch(e){}
    }

    // Load Notification State from Local Storage
    const savedRead = localStorage.getItem('sc_read_notifications');
    const savedDismissed = localStorage.getItem('sc_dismissed_notifications');
    if (savedRead) setReadNotificationIds(JSON.parse(savedRead));
    if (savedDismissed) setDismissedNotificationIds(JSON.parse(savedDismissed));

    // Load Offline Queue
    const savedQueue = localStorage.getItem('safetycheck_offline_queue');
    if (savedQueue) {
        try { setOfflineQueue(JSON.parse(savedQueue)); } catch(e) {}
    }

    // Network Listeners
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleOnline = () => {
      showToast("Back Online! Attempting to sync...", 'info');
      syncOfflineQueue();
  };

  const syncOfflineQueue = async () => {
      // Prevent double sync
      if (isSyncing) return;
      
      const queue = JSON.parse(localStorage.getItem('safetycheck_offline_queue') || '[]');
      if (queue.length === 0) return;

      setIsSyncing(true);
      
      let successCount = 0;
      let currentQueue = [...queue];

      try {
          // Process queue item by item. 
          // We use a while loop to ensure we always take the head, process it, remove it, and save.
          // This prevents data loss if the browser is closed mid-sync.
          while (currentQueue.length > 0) {
              const item = currentQueue[0];
              try {
                  await fetch(appScriptUrl, {
                      method: 'POST',
                      body: JSON.stringify(item),
                      mode: 'no-cors',
                      headers: { 'Content-Type': 'text/plain' }
                  });
                  
                  // If fetch doesn't throw, we assume success (or opaque success)
                  currentQueue.shift(); // Remove the processed item
                  successCount++;
                  
                  // Update storage immediately after each success
                  setOfflineQueue([...currentQueue]);
                  localStorage.setItem('safetycheck_offline_queue', JSON.stringify(currentQueue));
                  
                  // Small delay to be gentle on the endpoint
                  await new Promise(r => setTimeout(r, 500));

              } catch (error) {
                  console.error("Sync failed for item", error);
                  // Network error: Stop syncing, keep remaining items in queue
                  break; 
              }
          }
      } finally {
          setIsSyncing(false);
          if (successCount > 0) {
              showToast(`Synced ${successCount} offline records successfully!`, 'success');
              // Refresh data to show the newly synced items
              fetchHistory();
          }
      }
  };

  // ROUTE PROTECTION
  useEffect(() => {
      if (currentUser) {
          const isAdmin = currentUser.role && currentUser.role.toLowerCase() === 'admin';
          if (!isAdmin && (activeModule === 'settings' || activeModule === 'users')) {
              showToast("Access Restricted to Admins.", 'error');
              setActiveModule('overview');
          }
      }
  }, [activeModule, currentUser]);

  // Fetch Logic
  useEffect(() => {
    if (!currentUser || !appScriptUrl) return;

    if (navigator.onLine) {
        fetchNotifications();
        // Try sync on module load if pending items exist
        if (offlineQueue.length > 0) syncOfflineQueue();
    }

    if ((activeModule === 'general' && generalViewMode === 'dashboard') || 
        (activeModule === 'petroleum' && petroleumViewMode === 'dashboard') ||
        (activeModule === 'petroleum_v2' && petroleumV2ViewMode === 'dashboard') ||
        (activeModule === 'acid' && acidViewMode === 'dashboard')) {
       if (navigator.onLine) fetchHistory();
    }
  }, [activeModule, generalViewMode, petroleumViewMode, petroleumV2ViewMode, acidViewMode, currentUser]);


  // --- INTELLIGENT NOTIFICATION SYSTEM ---
  const fetchNotifications = async () => {
      if (!appScriptUrl || !navigator.onLine) return;
      try {
          const response = await fetch(`${appScriptUrl}?t=${new Date().getTime()}`);
          const json = await response.json();
          
          // 1. Fetch Global Acknowledgements List (Sever side dismissed)
          const serverAcknowledgements = json['Acknowledgements'] || [];
          setGlobalAcknowledgedIds(serverAcknowledgements);

          // 2. Parse Dynamic Inspection Alerts
          const processForAlerts = (rows: any[], type: string): AppNotification[] => {
              if (!Array.isArray(rows) || rows.length <= 1) return [];
              
              const rateIndex = type === 'General' ? 8 : 9;
              const truckIndex = 2;
              
              const alerts: AppNotification[] = [];
              // Iterate through rows (skipping header)
              rows.slice(1).forEach((row: any[], i) => {
                  const rate = Number(row[rateIndex]);
                  const truck = row[truckIndex] || 'Unknown Truck';
                  const timestamp = row[1]; 
                  
                  // Generate a deterministic ID based on content to track read status
                  // ID Format: Type_Timestamp_Truck
                  const alertId = `${type}_${new Date(timestamp).getTime()}_${truck.replace(/\s/g, '')}`;

                  // INTELLIGENT FILTERING
                  // 1. Skip if dismissed locally
                  if (dismissedNotificationIds.includes(alertId)) return;
                  
                  // 2. Skip if Acknowledged Globally by Admin/Inspector (Server Check)
                  if (serverAcknowledgements.includes(alertId)) return;

                  const isRead = readNotificationIds.includes(alertId);

                  if (rate <= 2) {
                      alerts.push({
                          id: alertId,
                          title: `Critical: ${truck}`,
                          message: `${type} Check rated ${rate}/5. Urgent attention needed.`,
                          type: 'critical',
                          timestamp: timestamp,
                          read: isRead,
                          module: type
                      });
                  } else if (rate === 3) {
                       alerts.push({
                          id: alertId,
                          title: `Warning: ${truck}`,
                          message: `${type} Check rated ${rate}/5. Maintenance review required.`,
                          type: 'warning',
                          timestamp: timestamp,
                          read: isRead,
                          module: type
                      });
                  }
              });
              return alerts;
          };

          // 3. Parse System Notifications from Sheet (NEW)
          const systemRows = json['SystemNotification'] || [];
          const systemAlerts: AppNotification[] = [];
          if (Array.isArray(systemRows) && systemRows.length > 1) {
              systemRows.slice(1).forEach((row: any[]) => {
                  // Columns: ID(0), RecipientID(1), Type(2), Message(3), Date(4), IsRead(5), ActionLink(6)
                  const recipientId = String(row[1]).trim().toLowerCase();
                  const isReadOnServer = String(row[5]).toUpperCase() === 'TRUE';
                  
                  // Targeted Filtering Logic
                  const isForUser = recipientId === currentUser?.username.toLowerCase();
                  const isForRole = recipientId === currentUser?.role.toLowerCase();
                  const isForAll = recipientId === 'all';
                  
                  if (!isReadOnServer && (isForUser || isForRole || isForAll)) {
                      const typeRaw = String(row[2]).toLowerCase();
                      let notifType: 'info' | 'critical' | 'warning' | 'success' = 'info';
                      if (typeRaw === 'critical') notifType = 'critical';
                      else if (typeRaw === 'warning') notifType = 'warning';
                      else if (typeRaw === 'success') notifType = 'success';

                      systemAlerts.push({
                          id: String(row[0]),
                          title: 'System Notification',
                          message: String(row[3]),
                          type: notifType,
                          timestamp: row[4],
                          read: false, // Server controls read state for these, but we show as unread if fetched
                          actionLink: row[6],
                          isServerEvent: true
                      });
                  }
              });
          }

          let allAlerts: AppNotification[] = [];
          
          // Add default system online message
          const sysId = 'sys_online_v1';
          if (!dismissedNotificationIds.includes(sysId)) {
             allAlerts.push({
                  id: sysId,
                  title: 'System Online',
                  message: 'Connected to SafetyCheck Database securely.',
                  type: 'success',
                  timestamp: new Date().toISOString(),
                  read: readNotificationIds.includes(sysId),
                  module: 'System'
              });
          }
          
          // Combine all sources
          if (json['General']) allAlerts = [...allAlerts, ...processForAlerts(json['General'], 'General')];
          if (json['Petroleum']) allAlerts = [...allAlerts, ...processForAlerts(json['Petroleum'], 'Petroleum')];
          if (json['Petroleum_V2']) allAlerts = [...allAlerts, ...processForAlerts(json['Petroleum_V2'], 'Petroleum_V2')];
          if (json['Acid']) allAlerts = [...allAlerts, ...processForAlerts(json['Acid'], 'Acid')];
          
          // Add System Notifications (Server Side)
          allAlerts = [...systemAlerts, ...allAlerts];

          allAlerts.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setNotifications(allAlerts);

      } catch (e) {
          console.error("Failed to fetch notifications", e);
      }
  };

  const handleMarkNotificationRead = async (id: string) => {
      const target = notifications.find(n => n.id === id);
      
      // Update UI Optimistically
      setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
      
      // If it is a Server Event, notify backend
      if (target?.isServerEvent && appScriptUrl && navigator.onLine) {
           try {
              await fetch(appScriptUrl, {
                  method: 'POST',
                  body: JSON.stringify({ action: 'mark_notification_read', id: id }),
                  mode: 'no-cors'
              });
           } catch(e) { console.error("Failed to mark read on server", e); }
      } else {
           // Local Logic
           const newReadIds = [...readNotificationIds, id];
           setReadNotificationIds(newReadIds);
           localStorage.setItem('sc_read_notifications', JSON.stringify(newReadIds));
      }
      
      // Handle Action Link Navigation
      if (target?.actionLink) {
          const action = target.actionLink.toLowerCase();
          if (action.includes('view:petroleum')) setActiveModule('petroleum');
          else if (action.includes('view:general')) setActiveModule('general');
          else if (action.includes('view:acid')) setActiveModule('acid');
          else if (action.includes('view:settings') && currentUser?.role === 'Admin') setActiveModule('settings');
          else if (action.includes('view:users') && currentUser?.role === 'Admin') setActiveModule('users');
      }
  };

  const handleDismissNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      const newDismissedIds = [...dismissedNotificationIds, id];
      setDismissedNotificationIds(newDismissedIds);
      localStorage.setItem('sc_dismissed_notifications', JSON.stringify(newDismissedIds));
  };

  const handleGlobalAcknowledge = async (id: string) => {
      if (!appScriptUrl || !navigator.onLine) return;
      
      // Optimistic update: Remove from UI immediately
      setNotifications(prev => prev.filter(n => n.id !== id));
      setGlobalAcknowledgedIds(prev => [...prev, id]);

      try {
          const payload = {
              action: 'acknowledge_issue',
              issueId: id,
              user: currentUser?.name || 'Unknown',
              role: currentUser?.role || 'Unknown'
          };

          await fetch(appScriptUrl, {
              method: 'POST',
              body: JSON.stringify(payload),
              mode: 'no-cors'
          });
          
          showToast("Issue Resolved & Acknowledged Globally.", 'success');
      } catch (e) {
          console.error("Failed to acknowledge issue", e);
          // If fail, it might reappear on refresh, but that's acceptable fallback
      }
  };

  const handleClearAllNotifications = () => {
      const allIds = notifications.map(n => n.id);
      setNotifications(prev => prev.map(n => ({...n, read: true})));
      const newReadIds = [...new Set([...readNotificationIds, ...allIds])];
      setReadNotificationIds(newReadIds);
      localStorage.setItem('sc_read_notifications', JSON.stringify(newReadIds));
  };

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      localStorage.setItem('safetyCheck_user', JSON.stringify(user));
      localStorage.setItem('safetyCheck_scriptUrl', appScriptUrl);
  };

  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('safetyCheck_user');
      setActiveModule('overview');
      setGeneralViewMode('dashboard');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
  };

  const fetchSystemSettings = async (url: string) => {
      if (!navigator.onLine) return;
      try {
          const response = await fetch(`${url}?t=${new Date().getTime()}`);
          const json = await response.json();
          const settingsRows = json['System_Settings'];
          
          if (settingsRows && Array.isArray(settingsRows) && settingsRows.length > 1) {
              const latestConfig = settingsRows[settingsRows.length - 1];
              if (latestConfig && latestConfig.length >= 2) {
                  const remoteSettings: SystemSettings = {
                      companyName: latestConfig[0] || 'My Transport Co.',
                      managerEmail: latestConfig[1] || '',
                      companyLogo: (latestConfig[4] && String(latestConfig[4]).length > 100) ? latestConfig[4] : undefined 
                  };
                  setSettings(prev => ({ ...prev, ...remoteSettings }));
                  try {
                    localStorage.setItem('safetyCheck_settings', JSON.stringify(remoteSettings));
                  } catch (e) {
                      console.warn("Storage quota exceeded", e);
                  }
              }
          }
      } catch (error) {
          console.error("Background Settings Sync Failed:", error);
      }
  };

  const resetForm = () => {
      setFormData({ 
          ...INITIAL_DATA, 
          timestamp: new Date().toISOString(),
          inspectedBy: currentUser?.name || '' // Preserve logged in user
      });
      setCurrentSection(0);
      if (activeModule === 'general') setGeneralViewMode('dashboard');
      if (activeModule === 'petroleum') setPetroleumViewMode('dashboard');
      if (activeModule === 'petroleum_v2') setPetroleumV2ViewMode('dashboard');
      if (activeModule === 'acid') setAcidViewMode('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startInspectionCommon = (modeSetter: (m: 'form') => void) => {
      setFormData({ 
          ...INITIAL_DATA, 
          timestamp: new Date().toISOString(),
          inspectedBy: currentUser?.name || '' 
      });
      setCurrentSection(0);
      modeSetter('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startNewInspection = () => startInspectionCommon(setGeneralViewMode);
  const startNewPetroleumInspection = () => startInspectionCommon(setPetroleumViewMode);
  const startNewPetroleumV2Inspection = () => startInspectionCommon(setPetroleumV2ViewMode);
  const startNewAcidInspection = () => startInspectionCommon(setAcidViewMode);

  const fetchHistory = async () => {
    if (!appScriptUrl || !navigator.onLine) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`${appScriptUrl}?t=${new Date().getTime()}`);
      const json = await response.json();

      // PARSE VALIDATION LISTS
      const validationData = json['Validation_Data'];
      if (validationData) {
          setValidationLists({
              trucks: validationData['Truck_Reg_No'] || [],
              trailers: validationData['Trailer_Reg_No'] || [],
              drivers: validationData['Driver_Name'] || [],
              inspectors: validationData['Inspector_Name'] || [],
              locations: validationData['Location'] || [],
              positions: validationData['Position'] || []
          });
      }
      
      let targetSheet = 'General';
      let targetHeaders = SHEET_HEADERS;

      if (activeModule === 'petroleum') {
          targetSheet = 'Petroleum';
          targetHeaders = PETROLEUM_HEADERS;
      } else if (activeModule === 'petroleum_v2') {
          targetSheet = 'Petroleum_V2';
          targetHeaders = PETROLEUM_V2_HEADERS;
      } else if (activeModule === 'acid') {
          targetSheet = 'Acid';
          targetHeaders = ACID_HEADERS;
      }
      
      const rawRows = json[targetSheet];

      if (rawRows === undefined) {
         setHistoryList([]);
      } else if (Array.isArray(rawRows) && rawRows.length > 1) {
         const historyData = rawRows.slice(1).map((row: any[]) => {
            const item: any = {};
            targetHeaders.forEach((header, index) => {
               item[header] = row[index] !== undefined ? row[index] : null;
            });
            return item as InspectionData;
         }).reverse();
         setHistoryList(historyData);
      } else {
         setHistoryList([]);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const stats = useMemo(() => {
    if (!historyList.length) return { total: 0, avgRate: 0, passRate: 0 };
    const total = historyList.length;
    const goodInspections = historyList.filter(i => Number(i.rate) >= 4).length;
    const passRate = ((goodInspections / total) * 100).toFixed(0);
    return { total, avgRate: 0, passRate };
  }, [historyList]);

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentSection(prev => Math.min(prev + 1, SECTIONS.length - 1));
  };

  const handleBack = () => {
    if (currentSection === 0) {
        if (activeModule === 'general') setGeneralViewMode('dashboard');
        if (activeModule === 'petroleum') setPetroleumViewMode('dashboard');
        if (activeModule === 'petroleum_v2') setPetroleumV2ViewMode('dashboard');
        if (activeModule === 'acid') setAcidViewMode('dashboard');
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentSection(prev => Math.max(prev - 1, 0));
    }
  };

  const handleViewReport = (item: InspectionData | null) => {
      setSelectedReportData(item);
      setIsReportModalOpen(true);
  };

  // Standard Print Handler (System Dialog)
  const handlePrint = () => {
      window.print();
  };

  // Quick Print from Dashboard
  const handleQuickPrint = (item: InspectionData) => {
      setSelectedReportData(item);
      // Small delay to ensure state updates and DOM renders the hidden print view
      setTimeout(() => {
          window.print();
      }, 500);
  };

  const handleGoogleSheetSubmit = async () => {
    if (currentUser?.role && !['Admin', 'Inspector'].includes(currentUser.role)) {
        showToast("Access Denied: View Only Account.", 'error');
        return;
    }

    if (!formData.inspectorSignature) {
        showToast("Please sign the inspection before submitting.", 'error');
        return;
    }
    
    if (!appScriptUrl) {
        showToast("System Not Connected. Please configure Settings.", 'error');
        setActiveModule('settings');
        return;
    }

    setSubmissionStatus('submitting');
    
    // Prepare Data
    const recordId = crypto.randomUUID();
    let targetSheet = "General";
    let targetHeaders = SHEET_HEADERS;
    
    if (activeModule === 'petroleum') {
        targetSheet = "Petroleum";
        targetHeaders = PETROLEUM_HEADERS;
    } else if (activeModule === 'petroleum_v2') {
        targetSheet = "Petroleum_V2";
        targetHeaders = PETROLEUM_V2_HEADERS;
    } else if (activeModule === 'acid') {
        targetSheet = "Acid";
        targetHeaders = ACID_HEADERS;
    }

    const rowData = targetHeaders.map(header => {
        if (header === 'id') return recordId;
        const val = formData[header];
        return (val === null || val === undefined) ? "" : val;
    });

    const payload = {
        sheet: targetSheet,
        action: "create",
        row: rowData,
        headers: targetHeaders,
        id: recordId
    };

    // CHECK CONNECTIVITY
    if (!navigator.onLine) {
        // SAVE OFFLINE
        const newQueue = [...offlineQueue, payload];
        setOfflineQueue(newQueue);
        localStorage.setItem('safetycheck_offline_queue', JSON.stringify(newQueue));
        
        setSubmissionStatus('offline_saved');
        setTimeout(() => {
             resetForm();
             setSubmissionStatus('idle');
             showToast("Offline Mode: Report Saved. Will sync when online.", 'info');
        }, 2000);
        return;
    }

    // TRY ONLINE SUBMISSION
    try {
        await fetch(appScriptUrl, {
            method: 'POST',
            body: JSON.stringify(payload),
            mode: 'no-cors', 
            headers: { 'Content-Type': 'text/plain' }
        });

        setSubmissionStatus('success');
        
        setTimeout(() => {
             resetForm();
             setSubmissionStatus('idle');
             fetchHistory(); 
             fetchNotifications();
        }, 2500);

    } catch (error) {
        console.error("Submission Error", error);
        // Fallback to offline save on network failure
        const newQueue = [...offlineQueue, payload];
        setOfflineQueue(newQueue);
        localStorage.setItem('safetycheck_offline_queue', JSON.stringify(newQueue));

        setSubmissionStatus('offline_saved');
        setTimeout(() => {
             resetForm();
             setSubmissionStatus('idle');
             showToast("Network Error: Report queued for sync.", 'info');
        }, 2500);
    }
  };

  const handleSaveSettings = async () => {
      if (!appScriptUrl.includes("script.google.com")) {
          showToast("Invalid URL. Must be a Google Apps Script Web App URL.", 'error');
          return;
      }

      setIsSavingSettings(true);
      try {
        localStorage.setItem('safetyCheck_scriptUrl', appScriptUrl);
        localStorage.setItem('safetyCheck_settings', JSON.stringify(settings));

        const timestamp = new Date().toISOString();
        const settingsHeaders = ["Company_Name", "Manager_Email", "Active_Script_URL", "Last_Updated", "Company_Logo"];
        const settingsRow = [settings.companyName, settings.managerEmail, appScriptUrl, timestamp, settings.companyLogo || ""];

        const payload = {
            sheet: "System_Settings",
            action: "create",
            headers: settingsHeaders,
            row: settingsRow,
            id: `CFG_${new Date().getTime()}`
        };

        if (navigator.onLine) {
            await fetch(appScriptUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' }
            });
            showToast("System Configured & Synced. Logo Saved.", 'success');
        } else {
            showToast("Settings saved locally. Connect to internet to sync.", 'info');
        }
      } catch (error) {
          console.error("Settings Save Error", error);
          if (error instanceof Error && error.name === 'QuotaExceededError') {
              showToast("Storage full! Try a smaller logo image.", 'error');
          } else {
              showToast("Saved locally, but failed to sync with Sheet.", 'info');
          }
      } finally {
          setIsSavingSettings(false);
      }
  };

  // --- RENDER HELPERS ---
  const renderDetailsSection = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 p-2 rounded-lg">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .667.333 1 1 1v1m2-2c-.667 0-1 .333-1 1v1"></path></svg>
          </span>
          Vehicle & Driver Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AutocompleteInput 
            label="Truck/Vehicle Reg No." 
            value={formData.truckNo} 
            onChange={v => updateField('truckNo', v)} 
            options={validationLists.trucks}
            placeholder="e.g. AHB 1502 ZM"
            isRegNo={true}
          />
          <AutocompleteInput 
            label="Trailer/Unit Reg No." 
            value={formData.trailerNo} 
            onChange={v => updateField('trailerNo', v)} 
            options={validationLists.trailers}
            placeholder="e.g. AHB 1502 ZM"
            isRegNo={true}
          />
          
          <Input label="Job Card #" value={formData.jobCard || ''} onChange={v => updateField('jobCard', v)} />
          
          <AutocompleteInput 
            label="Inspected By (Name)" 
            value={formData.inspectedBy} 
            onChange={v => updateField('inspectedBy', v)} 
            options={validationLists.inspectors}
            placeholder="Auto-filled"
            isTitleCase={true}
            readOnly={true}
          />

          <AutocompleteInput 
            label="Driver Name" 
            value={formData.driverName} 
            onChange={v => updateField('driverName', v)} 
            options={validationLists.drivers}
            placeholder="e.g. John Doe"
            isTitleCase={true}
          />
          <AutocompleteInput 
            label="Current Location" 
            value={formData.location} 
            onChange={v => updateField('location', v)} 
            options={validationLists.locations}
            placeholder="e.g. Lusaka, Zambia"
            isTitleCase={true}
          />
          
          <Input label="Odometer Reading (km)" type="number" value={formData.odometer} onChange={v => updateField('odometer', v)} />
        </div>
      </div>
    </div>
  );

  const renderPhotosSection = () => (
    <div className="space-y-6 animate-fadeIn">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 p-2 rounded-lg">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </span>
          Vehicle Photos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <CameraCapture label="Front View" existingImage={formData.photoFront} onCapture={img => updateField('photoFront', img)} />
          <CameraCapture label="Left Side (LS)" existingImage={formData.photoLS} onCapture={img => updateField('photoLS', img)} />
          <CameraCapture label="Right Side (RS)" existingImage={formData.photoRS} onCapture={img => updateField('photoRS', img)} />
          <CameraCapture label="Back View" existingImage={formData.photoBack} onCapture={img => updateField('photoBack', img)} />
        </div>
      </div>
    </div>
  );

  const renderInspectionSection = (categoriesToShow: string[]) => {
      let itemsToRender: InspectionItemConfig[] = [];
      if (activeModule === 'petroleum') {
          itemsToRender = PETROLEUM_INSPECTION_ITEMS.filter(item => categoriesToShow.includes(item.category));
      } else if (activeModule === 'petroleum_v2') {
          itemsToRender = PETROLEUM_V2_ITEMS.filter(item => categoriesToShow.includes(item.category));
      } else if (activeModule === 'acid') {
          itemsToRender = ACID_INSPECTION_ITEMS.filter(item => categoriesToShow.includes(item.category));
      } else {
          itemsToRender = INSPECTION_ITEMS.filter(item => categoriesToShow.includes(item.category));
      }

      const grouping: Record<string, InspectionItemConfig[]> = {};
      categoriesToShow.forEach(cat => {
          grouping[cat] = itemsToRender.filter(i => i.category === cat);
      });

      return (
        <div className="space-y-8 animate-fadeIn">
          {categoriesToShow.map(cat => (
            <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-blue-900">{cat}</h3>
              </div>
              <div className="p-4 md:p-6 space-y-6">
                {grouping[cat].map(item => (
                  <div key={item.id} className="flex flex-col gap-3 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                    <span className="font-semibold text-gray-800 text-base">{item.label}</span>
                    <div className="grid grid-cols-4 gap-2">
                       <StatusButton label="Good" status={InspectionStatus.GOOD} current={formData[item.id]} onClick={() => updateField(item.id, InspectionStatus.GOOD)} colorClass="green" />
                       <StatusButton label="Bad" status={InspectionStatus.BAD} current={formData[item.id]} onClick={() => updateField(item.id, InspectionStatus.BAD)} colorClass="red" />
                       <StatusButton label="Attn" status={InspectionStatus.ATTENTION} current={formData[item.id]} onClick={() => updateField(item.id, InspectionStatus.ATTENTION)} colorClass="yellow" />
                       <StatusButton label="Nil" status={InspectionStatus.NIL} current={formData[item.id]} onClick={() => updateField(item.id, InspectionStatus.NIL)} colorClass="gray" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
  };

  const renderSignaturesSection = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
           Finalize Inspection
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Remarks / Observations</label>
          <textarea 
            className="w-full p-4 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Enter any additional notes..."
            value={formData.remarks}
            onChange={(e) => updateField('remarks', e.target.value)}
          />
        </div>

        <div className="mb-8">
            <CameraCapture label="Picture of Damage / Defects (Optional)" existingImage={formData.photoDamage} onCapture={img => updateField('photoDamage', img)} />
        </div>

        <div className="mb-8">
           <label className="block text-sm font-bold text-gray-700 mb-3">Overall Vehicle Rating</label>
           <div className="flex gap-2 sm:gap-4 justify-between sm:justify-start">
             {[1, 2, 3, 4, 5].map(num => (
               <button
                key={num}
                type="button"
                onClick={() => updateField('rate', num)}
                className={`flex-1 sm:flex-none w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                  formData.rate === num ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'
                }`}
               >
                 {num}
               </button>
             ))}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
           <SignaturePad label="Inspector Signature" existingSignature={formData.inspectorSignature} onSave={sig => updateField('inspectorSignature', sig)} />
           <SignaturePad label="Driver Signature" existingSignature={formData.driverSignature} onSave={sig => updateField('driverSignature', sig)} />
        </div>
      </div>
    </div>
  );

  const renderSummarySection = () => (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Inspection Ready</h2>
        <p className="text-gray-500">Please review the report below.</p>
        <button 
            onClick={() => handleViewReport(formData)}
            className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors"
        >
            View Full Screen Preview
        </button>
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Document Preview</h3>
        </div>
        <div className="p-4 overflow-x-auto bg-gray-100 flex justify-center">
             <div className="bg-white shadow-xl transform scale-75 md:scale-100 transition-transform origin-top">
                 {activeModule === 'petroleum' ? (
                     <PrintablePetroleumReport data={formData} settings={settings} />
                 ) : activeModule === 'petroleum_v2' ? (
                     <PrintablePetroleumV2Report data={formData} settings={settings} />
                 ) : activeModule === 'acid' ? (
                     <PrintableAcidReport data={formData} settings={settings} />
                 ) : (
                     <PrintableGeneralReport data={formData} settings={settings} />
                 )}
             </div>
        </div>
      </div>

      <div className="mt-8 bg-slate-900 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Final Submission</h3>
                  <p className="text-slate-400 text-sm max-w-md">Submit to database ({activeModule === 'petroleum' ? 'Petroleum' : activeModule === 'petroleum_v2' ? 'Petroleum_V2' : activeModule === 'acid' ? 'Acid' : 'General'} Sheet).</p>
                  
                  {/* Offline Warning */}
                  {!navigator.onLine && (
                       <div className="mt-2 inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"></path></svg>
                           Offline Mode: Will save to device
                       </div>
                  )}
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                 <button 
                  onClick={handleGoogleSheetSubmit}
                  disabled={submissionStatus !== 'idle'}
                  className={`w-full md:w-auto px-8 py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3
                     ${submissionStatus !== 'idle' ? 'bg-gray-600 cursor-wait' : 'bg-green-500 hover:bg-green-600'}
                  `}
                 >
                   {submissionStatus === 'submitting' ? 'Processing...' : submissionStatus === 'offline_saved' ? 'Saved Offline' : 'Submit Inspection'}
                </button>
              </div>
          </div>
      </div>
    </div>
  );

  if (!currentUser) {
      return (
          <LoginView 
            onLogin={handleLogin} 
            appScriptUrl={appScriptUrl}
            setAppScriptUrl={setAppScriptUrl}
            settings={settings}
          />
      );
  }

  const canAcknowledge = currentUser.role === 'Admin' || currentUser.role === 'Maintenance' || currentUser.role === 'Inspector';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SubmissionOverlay status={submissionStatus} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Upgrade Modal */}
      {upgradeFeature && (
        <UpgradeModal 
            featureName={upgradeFeature} 
            onClose={() => setUpgradeFeature(null)} 
        />
      )}

      {isProfileModalOpen && currentUser && (
          <ProfileModal 
              user={currentUser}
              appScriptUrl={appScriptUrl}
              onClose={() => setIsProfileModalOpen(false)}
              showToast={showToast}
              onUpdateSuccess={(updatedUser) => {
                   setCurrentUser(updatedUser);
                   localStorage.setItem('safetyCheck_user', JSON.stringify(updatedUser));
              }}
          />
      )}

      {isReportModalOpen && (
          <ReportViewerModal 
            onClose={() => setIsReportModalOpen(false)} 
            onPrint={handlePrint}
            title={`${activeModule === 'petroleum' ? 'Petroleum #1' : activeModule === 'petroleum_v2' ? 'Petroleum #2' : activeModule === 'acid' ? 'Acid Tanker' : 'General'} Inspection Report`}
          >
               <div className="print-only-container">
                    {activeModule === 'petroleum' ? (
                        <PrintablePetroleumReport data={selectedReportData || formData} settings={settings} />
                    ) : activeModule === 'petroleum_v2' ? (
                        <PrintablePetroleumV2Report data={selectedReportData || formData} settings={settings} />
                    ) : activeModule === 'acid' ? (
                        <PrintableAcidReport data={selectedReportData || formData} settings={settings} />
                    ) : (
                        <PrintableGeneralReport data={selectedReportData || formData} settings={settings} />
                    )}
               </div>
          </ReportViewerModal>
      )}

      <div className="print-only hidden p-0 bg-white">
         {activeModule === 'petroleum' ? (
             <PrintablePetroleumReport data={selectedReportData || formData} settings={settings} />
         ) : activeModule === 'petroleum_v2' ? (
             <PrintablePetroleumV2Report data={selectedReportData || formData} settings={settings} />
         ) : activeModule === 'acid' ? (
             <PrintableAcidReport data={selectedReportData || formData} settings={settings} />
         ) : (
             <PrintableGeneralReport data={selectedReportData || formData} settings={settings} />
         )}
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeModule={activeModule}
        onSelectModule={(m) => {
            setActiveModule(m);
            if(m === 'general') setGeneralViewMode('dashboard');
            if(m === 'petroleum') setPetroleumViewMode('dashboard'); 
            if(m === 'petroleum_v2') setPetroleumV2ViewMode('dashboard');
            if(m === 'acid') setAcidViewMode('dashboard');
        }}
        onLockedItemClick={(feature) => setUpgradeFeature(feature)}
        settings={settings}
        user={currentUser}
        onLogout={handleLogout}
        onEditProfile={() => setIsProfileModalOpen(true)}
      />

      <div className="lg:pl-64 min-h-screen flex flex-col transition-all duration-300">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="px-4 py-3 flex justify-between items-center bg-blue-900 text-white">
            <div className="flex items-center gap-3">
                 <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1 hover:bg-blue-800 rounded">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                 </button>
                 <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
                    {activeModule === 'overview' ? 'Executive Dashboard' : 
                     activeModule === 'petroleum' ? 'Petroleum Check #1' : 
                     activeModule === 'petroleum_v2' ? 'Petroleum Check #2' : 
                     activeModule === 'acid' ? 'Acid Tanker Check' : 
                     activeModule === 'settings' ? 'System Settings' :
                     activeModule === 'users' ? 'User Management' :
                     'SafetyCheck'}
                  </h1>
            </div>
            
            <div className="flex items-center gap-3">
                 {/* OFFLINE SYNC INDICATOR */}
                 {offlineQueue.length > 0 && (
                     <button
                         onClick={syncOfflineQueue}
                         disabled={isSyncing} 
                         className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all
                            ${isSyncing ? 'bg-green-500 text-white cursor-wait' : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 active:scale-95'}
                         `}
                         title={`${offlineQueue.length} records pending upload. Click to Sync Now.`}
                     >
                         {isSyncing ? (
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                         )}
                         <span>{isSyncing ? 'Syncing...' : `Pending Sync (${offlineQueue.length})`}</span>
                     </button>
                 )}
                 {offlineQueue.length > 0 && (
                     <button onClick={syncOfflineQueue} disabled={isSyncing} className="md:hidden w-3 h-3 rounded-full bg-orange-500 border-2 border-white animate-pulse"></button>
                 )}

                 <NotificationCenter 
                    notifications={notifications}
                    onMarkAsRead={handleMarkNotificationRead}
                    onDismiss={handleDismissNotification}
                    onClearAll={handleClearAllNotifications}
                    onAcknowledge={handleGlobalAcknowledge}
                    canAcknowledge={canAcknowledge}
                 />

                {((activeModule === 'general' && generalViewMode === 'form') || (activeModule === 'petroleum' && petroleumViewMode === 'form') || (activeModule === 'petroleum_v2' && petroleumV2ViewMode === 'form') || (activeModule === 'acid' && acidViewMode === 'form')) && (
                    <div className="hidden md:flex text-xs font-medium bg-blue-800 px-3 py-1 rounded-full items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                       {SECTIONS[currentSection].label}
                    </div>
                )}
            </div>
          </div>
          
          {((activeModule === 'general' && generalViewMode === 'form') || (activeModule === 'petroleum' && petroleumViewMode === 'form') || (activeModule === 'petroleum_v2' && petroleumV2ViewMode === 'form') || (activeModule === 'acid' && acidViewMode === 'form')) && (
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex px-4 py-3 min-w-max">
                  {SECTIONS.map((section, idx) => {
                    const isActive = idx === currentSection;
                    const isCompleted = idx < currentSection;
                    return (
                      <div key={section.id} className="flex items-center">
                        <div 
                          className={`flex flex-col items-center gap-1 cursor-pointer group`} 
                          onClick={() => { window.scrollTo(0, 0); setCurrentSection(idx); }}
                        >
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                            ${isActive ? 'bg-blue-600 text-white shadow-md' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                          `}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[10px] uppercase font-bold tracking-wide ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                            {section.title}
                          </span>
                        </div>
                        {idx < SECTIONS.length - 1 && (
                          <div className={`h-0.5 w-8 md:w-16 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          
          {activeModule === 'overview' && (
              <OverviewDashboard 
                  appScriptUrl={appScriptUrl}
                  onNavigate={(module) => {
                      setActiveModule(module);
                      if(module === 'general') setGeneralViewMode('dashboard');
                      if(module === 'petroleum') setPetroleumViewMode('dashboard');
                      if(module === 'petroleum_v2') setPetroleumV2ViewMode('dashboard');
                      if(module === 'acid') setAcidViewMode('dashboard');
                  }}
                  userRole={currentUser?.role}
              />
          )}

          {activeModule === 'settings' && (
              <SettingsView 
                  settings={settings}
                  setSettings={setSettings}
                  appScriptUrl={appScriptUrl}
                  setAppScriptUrl={setAppScriptUrl}
                  handleSaveSettings={handleSaveSettings}
                  isSavingSettings={isSavingSettings}
                  showToast={showToast}
              />
          )}

          {activeModule === 'users' && (
              <UserManagementView 
                  currentUser={currentUser}
                  appScriptUrl={appScriptUrl}
                  showToast={showToast}
                  validationLists={validationLists}
              />
          )}
          
          {activeModule === 'general' && generalViewMode === 'dashboard' && (
              <GeneralDashboard 
                  stats={stats}
                  startNewInspection={startNewInspection}
                  fetchHistory={fetchHistory}
                  isLoadingHistory={isLoadingHistory}
                  historyList={historyList}
                  onViewReport={handleViewReport}
                  onPrint={handleQuickPrint}
                  userRole={currentUser?.role}
              />
          )}
          
          {activeModule === 'petroleum' && petroleumViewMode === 'dashboard' && (
               <PetroleumDashboard 
                  stats={stats}
                  startNewInspection={startNewPetroleumInspection}
                  fetchHistory={fetchHistory}
                  isLoadingHistory={isLoadingHistory}
                  historyList={historyList}
                  onViewReport={handleViewReport}
                  onPrint={handleQuickPrint}
                  userRole={currentUser?.role}
              />
          )}

          {activeModule === 'petroleum_v2' && petroleumV2ViewMode === 'dashboard' && (
               <PetroleumV2Dashboard 
                  stats={stats}
                  startNewInspection={startNewPetroleumV2Inspection}
                  fetchHistory={fetchHistory}
                  isLoadingHistory={isLoadingHistory}
                  historyList={historyList}
                  onViewReport={handleViewReport}
                  onPrint={handleQuickPrint}
                  userRole={currentUser?.role}
              />
          )}

          {activeModule === 'acid' && acidViewMode === 'dashboard' && (
               <AcidDashboard 
                  stats={stats}
                  startNewInspection={startNewAcidInspection}
                  fetchHistory={fetchHistory}
                  isLoadingHistory={isLoadingHistory}
                  historyList={historyList}
                  onViewReport={handleViewReport}
                  onPrint={handleQuickPrint}
                  userRole={currentUser?.role}
              />
          )}
          
          {((activeModule === 'general' && generalViewMode === 'form') || 
            (activeModule === 'petroleum' && petroleumViewMode === 'form') ||
            (activeModule === 'petroleum_v2' && petroleumV2ViewMode === 'form') ||
            (activeModule === 'acid' && acidViewMode === 'form')) && (
              <>
                  {currentSection === 0 && renderDetailsSection()}
                  {currentSection === 1 && renderPhotosSection()}
                  
                  {activeModule === 'general' && currentSection === 2 && renderInspectionSection([INSPECTION_CATEGORIES.PPE, INSPECTION_CATEGORIES.DOCUMENTATION])}
                  {activeModule === 'general' && currentSection === 3 && renderInspectionSection([INSPECTION_CATEGORIES.VEHICLE_EXTERIOR, INSPECTION_CATEGORIES.LIGHTS_ELECTRICAL])}
                  {activeModule === 'general' && currentSection === 4 && renderInspectionSection([INSPECTION_CATEGORIES.MECHANICAL, INSPECTION_CATEGORIES.TRAILER])}
                  
                  {activeModule === 'petroleum' && currentSection === 2 && renderInspectionSection([PETROLEUM_CATEGORIES.TRUCK_EQUIPMENT])}
                  {activeModule === 'petroleum' && currentSection === 3 && renderInspectionSection([PETROLEUM_CATEGORIES.TYRES, PETROLEUM_CATEGORIES.PPE_ID])}
                  {activeModule === 'petroleum' && currentSection === 4 && renderInspectionSection([PETROLEUM_CATEGORIES.DOCUMENTS, PETROLEUM_CATEGORIES.ONBOARD])}

                  {activeModule === 'petroleum_v2' && currentSection === 2 && renderInspectionSection([PETROLEUM_V2_CATEGORIES.PRIME_MOVER])}
                  {activeModule === 'petroleum_v2' && currentSection === 3 && renderInspectionSection([PETROLEUM_V2_CATEGORIES.TRAILER_TANKS])}
                  {activeModule === 'petroleum_v2' && currentSection === 4 && renderInspectionSection([PETROLEUM_V2_CATEGORIES.DRIVER, PETROLEUM_V2_CATEGORIES.SAFETY_SIGNS, PETROLEUM_V2_CATEGORIES.DOCUMENTS])}

                  {activeModule === 'acid' && currentSection === 2 && renderInspectionSection([ACID_CATEGORIES.PPE])}
                  {activeModule === 'acid' && currentSection === 3 && renderInspectionSection([ACID_CATEGORIES.VEHICLE])}
                  {activeModule === 'acid' && currentSection === 4 && renderInspectionSection([ACID_CATEGORIES.SPILL_KIT, ACID_CATEGORIES.DOCUMENTATION])}
                  
                  {currentSection === 5 && renderSignaturesSection()}
                  {currentSection === 6 && renderSummarySection()}
              </>
          )}
        </main>

        {((activeModule === 'general' && generalViewMode === 'form') || 
          (activeModule === 'petroleum' && petroleumViewMode === 'form') ||
          (activeModule === 'petroleum_v2' && petroleumV2ViewMode === 'form') ||
          (activeModule === 'acid' && acidViewMode === 'form')) && (
            <footer className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="max-w-5xl mx-auto flex justify-between gap-4">
                <button 
                  onClick={handleBack} 
                  className="px-6 py-3 rounded-xl border border-gray-300 font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  {currentSection === 0 ? 'Back to Dashboard' : 'Back'}
                </button>
                
                {currentSection < SECTIONS.length - 1 ? (
                   <button 
                    onClick={handleNext} 
                    className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2"
                  >
                    Next Section
                  </button>
                ) : (
                   <div className="flex-1 flex items-center justify-end text-sm font-medium text-gray-500">
                      Review & Submit above
                   </div>
                )}
              </div>
            </footer>
        )}
      </div>
    </div>
  );
};

export default App;
