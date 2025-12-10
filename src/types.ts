

export enum InspectionStatus {
  GOOD = 'Good',
  BAD = 'Bad',
  ATTENTION = 'Needs Attention',
  NIL = 'Nil'
}

export interface UserPreferences {
    emailNotifications: boolean;
    notifyGeneral: boolean;
    notifyPetroleum: boolean;
    notifyAcid: boolean;
}

export interface User {
  username: string;
  name: string;
  role: 'Admin' | 'Inspector' | 'Operations' | 'Maintenance' | 'Other';
  position?: string;
  lastLogin?: string;
  preferences?: UserPreferences;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    timestamp: string;
    read: boolean;
    module?: string; // To link to specific dashboard if needed
    recordId?: string; // To identify specific inspection
    
    // SystemNotification Sheet Specifics
    recipientId?: string;
    actionLink?: string; // e.g., "view:users", "view:settings"
    isServerEvent?: boolean; // True if it comes from SystemNotification sheet
}

export interface InspectionItemConfig {
  id: string;
  label: string;
  category: string;
}

export interface SystemSettings {
    companyName: string;
    managerEmail: string;
    companyLogo?: string; // Base64 string for the custom logo
}

export interface ValidationLists {
    trucks: string[];
    trailers: string[];
    drivers: string[];
    inspectors: string[];
    locations: string[];
    positions: string[]; // Added Positions
}

export interface InspectionData {
  // Metadata
  timestamp: string;
  
  // Text Fields
  truckNo: string;
  trailerNo: string;
  inspectedBy: string;
  driverName: string;
  location: string;
  odometer: string;
  jobCard?: string; // Optional as it might not be in General
  
  // Images (Base64 or URL)
  photoFront: string | null;
  photoLS: string | null;
  photoRS: string | null;
  photoBack: string | null;
  photoDamage: string | null;
  
  // Inspection Items (Keyed by ID, Value is Status)
  [key: string]: string | number | null | InspectionStatus | undefined; // Flexible index signature

  // Specific Checks - Updated to new list
  reflectiveWorkSuit?: InspectionStatus;
  safetyGear?: InspectionStatus; // Goggles, Boots, Gloves, Hard Hat
  dustMask?: InspectionStatus;
  roadFitness?: InspectionStatus; // Road Tax / Insurance
  windscreen?: InspectionStatus;
  headLamps?: InspectionStatus;
  indicators?: InspectionStatus;
  mirrors?: InspectionStatus;
  seatBelt?: InspectionStatus;
  fireExtinguisher?: InspectionStatus;
  warningTriangles?: InspectionStatus;
  hornIgnition?: InspectionStatus;
  trailerCondition?: InspectionStatus;
  fifthWheel?: InspectionStatus;
  landingLegs?: InspectionStatus;
  fluidLeaks?: InspectionStatus;
  reverseAlarm?: InspectionStatus; // & Lights
  tyres?: InspectionStatus;
  wheelNuts?: InspectionStatus;
  firstAid?: InspectionStatus;
  parkingLights?: InspectionStatus;
  brakes?: InspectionStatus; // & Air Pipes
  chevrons?: InspectionStatus;
  tarpaulins?: InspectionStatus; // & Ropes
  generalCondition?: InspectionStatus; // Interior/Body
  driverManual?: InspectionStatus;
  validDriverDocs?: InspectionStatus; // License, DDT, ID
  routeRisk?: InspectionStatus;
  
  // Closing
  remarks: string;
  rate: number; // 1-5
  inspectorSignature: string | null;
  driverSignature: string | null;
  
  // AI Analysis
  aiAnalysis?: string;
}

export const INITIAL_DATA: InspectionData = {
  timestamp: new Date().toISOString(),
  truckNo: '',
  trailerNo: '',
  inspectedBy: '',
  driverName: '',
  location: '',
  odometer: '',
  jobCard: '',
  photoFront: null,
  photoLS: null,
  photoRS: null,
  photoBack: null,
  photoDamage: null,
  
  // Defaulting to Good for efficiency, user can change
  reflectiveWorkSuit: InspectionStatus.GOOD,
  safetyGear: InspectionStatus.GOOD,
  dustMask: InspectionStatus.NIL,
  roadFitness: InspectionStatus.GOOD,
  windscreen: InspectionStatus.GOOD,
  headLamps: InspectionStatus.GOOD,
  indicators: InspectionStatus.GOOD,
  mirrors: InspectionStatus.GOOD,
  seatBelt: InspectionStatus.GOOD,
  fireExtinguisher: InspectionStatus.GOOD,
  warningTriangles: InspectionStatus.GOOD,
  hornIgnition: InspectionStatus.GOOD,
  trailerCondition: InspectionStatus.GOOD,
  fifthWheel: InspectionStatus.GOOD,
  landingLegs: InspectionStatus.GOOD,
  fluidLeaks: InspectionStatus.GOOD,
  reverseAlarm: InspectionStatus.GOOD,
  tyres: InspectionStatus.GOOD,
  wheelNuts: InspectionStatus.GOOD,
  firstAid: InspectionStatus.GOOD,
  parkingLights: InspectionStatus.GOOD,
  brakes: InspectionStatus.GOOD,
  chevrons: InspectionStatus.GOOD,
  tarpaulins: InspectionStatus.GOOD,
  generalCondition: InspectionStatus.GOOD,
  driverManual: InspectionStatus.GOOD,
  validDriverDocs: InspectionStatus.GOOD,
  routeRisk: InspectionStatus.GOOD,

  remarks: '',
  rate: 5,
  inspectorSignature: null,
  driverSignature: null,
  aiAnalysis: ''
};