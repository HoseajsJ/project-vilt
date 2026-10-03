export type RoleType = 'pengurus' | 'pengurus_karta' | 'pengurus_rt' | 'warga';

export interface User {
  id: number;
  name: string;
  role: RoleType;
  status?: number;
}

export interface AuthResponse {
  status_code: number;
  status: boolean;
  message: string;
  data: {
    token: string;
    role: RoleType;
    user: User;
  };
}

export interface SensorReading {
  code: string;
  name: string;
  value: number;
  unit: string;
  recorded_at: string;
}

export interface ProductionCycle {
  id: number;
  name: string;
  start_date: string;
  initial_qty?: string | number;
  status?: string;
  notes?: string;
}

export interface Unit {
  id: number;
  name: string;
  type: 'lele' | 'hidroponik' | 'maggot' | 'lingkungan' | string;
  location?: string;
  status: number;
  active_cycle?: ProductionCycle | null;
  latest_readings?: SensorReading[];
}

export interface AlertItem {
  id: number;
  unit_id: number;
  device_id?: number | null;
  kind: string;
  severity: 'warning' | 'critical' | string;
  value?: number;
  message: string;
  status: 'open' | 'acknowledged' | 'resolved';
  triggered_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  unit?: {
    id: number;
    name: string;
    type: string;
  };
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  category: 'budidaya' | 'lingkungan' | 'sosial' | 'rapat' | 'lainnya' | string;
  unit_id?: number | null;
  activity_date: string;
  location?: string;
  image_url?: string;
  status: 'draft' | 'published';
  published_at?: string;
  unit?: Unit;
}

export interface LetterType {
  id: number;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface LetterRequest {
  id: number;
  user_id: number;
  letter_type_id: number;
  status: 'menunggu_review' | 'diproses' | 'siap_diambil' | 'ditolak';
  notes?: string;
  attachment_url?: string;
  admin_note?: string;
  created_at: string;
  letter_type?: LetterType;
  user?: {
    id: number;
    name: string;
  };
}

export interface CitizenComplaint {
  id: number;
  reporter_id: number;
  category: 'keamanan' | 'lingkungan' | 'infrastruktur' | 'sosial' | 'lainnya' | string;
  description: string;
  location: string;
  photo_url?: string;
  status: 'baru' | 'diproses' | 'selesai';
  handler_note?: string;
  created_at: string;
  reporter?: {
    id: number;
    name: string;
  };
  handler?: {
    id: number;
    name: string;
  };
}

export interface AppNotification {
  id: number;
  user_id: number;
  category: 'alert' | 'activity' | 'report' | 'system';
  title: string;
  body: string;
  ref_type?: string;
  ref_id?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}
