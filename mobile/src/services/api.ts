import AsyncStorage from '@react-native-async-storage/async-storage';
import { toByteArray } from 'base64-js';
import {
  Activity,
  AttendanceMember,
  AlertItem,
  AppNotification,
  AuthResponse,
  CitizenComplaint,
  LetterRequest,
  LetterType,
  Unit,
} from '../types';
import {
  mockActivities,
  mockAlerts,
  mockComplaints,
  mockLetterRequests,
  mockLetterTypes,
  mockUnits,
} from './mockData';

const STORAGE_KEY_TOKEN = '@desa_pintar_jwt';
const STORAGE_KEY_BASE_URL = '@desa_pintar_base_url';

// Default to LAN IP 192.168.1.27 or fallback to localhost
export const DEFAULT_BASE_URL = 'http://192.168.1.27:8000/api';

let mockIdCounter = Date.now();
const isApiNetworkError = (error: unknown) => !(error instanceof ApiRequestError) || error.status >= 500;

export class ApiRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

class ApiService {
  private baseUrl: string = DEFAULT_BASE_URL;
  private token: string | null = null;

  async init() {
    try {
      const storedUrl = await AsyncStorage.getItem(STORAGE_KEY_BASE_URL);
      if (storedUrl) {
        if (storedUrl.includes('192.168.1.6')) {
          this.baseUrl = DEFAULT_BASE_URL;
          await AsyncStorage.setItem(STORAGE_KEY_BASE_URL, DEFAULT_BASE_URL);
        } else {
          this.baseUrl = storedUrl;
        }
      }
      const storedToken = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
      if (storedToken) {
        this.token = storedToken;
      }
    } catch {
      // fallback
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async setBaseUrl(url: string) {
    let cleanUrl = url.trim();
    if (!cleanUrl.endsWith('/api')) {
      cleanUrl = cleanUrl.replace(/\/+$/, '') + '/api';
    }
    this.baseUrl = cleanUrl;
    await AsyncStorage.setItem(STORAGE_KEY_BASE_URL, cleanUrl);
  }

  getToken(): string | null {
    return this.token;
  }

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEY_TOKEN, token);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const isMultipart = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      let json: any;
      try {
        json = await response.json();
      } catch {
        json = null;
      }
      if (!response.ok || json?.status === false) {
        const firstValidationError = json?.data && typeof json.data === 'object'
          ? Object.values(json.data).flat().find((value) => typeof value === 'string')
          : null;
        throw new ApiRequestError(
          String(firstValidationError || json?.message || `Server mengembalikan HTTP ${response.status}`),
          response.status
        );
      }
      if (!json) throw new Error('Respons server tidak dapat dibaca. Periksa log backend Laravel.');
      return json;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  // Auth
  async login(username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async me() {
    return this.request<any>('/auth/me');
  }

  async logout() {
    try {
      await this.request<any>('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    await this.setToken(null);
  }

  // Dashboard
  async getPengurusDashboard() {
    try {
      const res = await this.request<any>('/pengurus/dashboard');
      return res.data;
    } catch {
      return {
        stats: {
          units_count: mockUnits.length,
          open_alerts_count: 0,
          pending_letters: 1,
          pending_complaints: 1,
          activities_count: mockActivities.length,
        },
        recent_alerts: mockAlerts,
      };
    }
  }

  async getWargaDashboard() {
    try {
      const res = await this.request<any>('/warga/dashboard');
      return res.data;
    } catch {
      return {
        summary: {
          active_units: mockUnits.length,
          letters_count: mockLetterRequests.length,
          complaints_count: mockComplaints.length,
        },
        recent_activities: mockActivities.filter((a) => a.status === 'published'),
        my_letters: mockLetterRequests,
        my_complaints: mockComplaints,
      };
    }
  }

  // Units
  async getUnits(): Promise<Unit[]> {
    try {
      const res = await this.request<any>('/units');
      return res.data || [];
    } catch {
      return mockUnits;
    }
  }

  async getPublicUnits(): Promise<Unit[]> {
    try {
      const res = await this.request<any>('/public/units');
      return res.data || [];
    } catch {
      return mockUnits;
    }
  }

  // Alerts
  async getAlerts(status?: string): Promise<AlertItem[]> {
    try {
      const query = status ? `?status=${status}` : '';
      const res = await this.request<any>(`/alerts${query}`);
      return res.data || [];
    } catch {
      return mockAlerts;
    }
  }

  async acknowledgeAlert(id: number): Promise<boolean> {
    try {
      await this.request<any>(`/alerts/${id}/acknowledge`, { method: 'PATCH' });
      return true;
    } catch {
      return true;
    }
  }

  async resolveAlert(id: number): Promise<boolean> {
    try {
      await this.request<any>(`/alerts/${id}/resolve`, { method: 'PATCH' });
      return true;
    } catch {
      return true;
    }
  }

  // Activities
  async getActivities(): Promise<Activity[]> {
    try {
      const res = await this.request<any>('/activities');
      return res.data || [];
    } catch {
      return mockActivities;
    }
  }

  async getPublicActivities(): Promise<Activity[]> {
    try {
      const res = await this.request<any>('/public/activities');
      return res.data || [];
    } catch {
      return mockActivities.filter((a) => a.status === 'published');
    }
  }

  async createActivity(activity: Partial<Activity>): Promise<Activity> {
    try {
      const res = await this.request<any>('/activities', {
        method: 'POST',
        body: JSON.stringify(activity),
      });
      return res.data;
    } catch {
      const newAct: Activity = {
        id: mockIdCounter++,
        title: activity.title || '',
        category: activity.category || 'sosial',
        activity_date: activity.activity_date || new Date().toISOString(),
        location: activity.location || 'RW 05',
        description: activity.description || '',
        status: activity.status || 'draft',
      };
      mockActivities.unshift(newAct);
      return newAct;
    }
  }

  async publishActivity(id: number): Promise<boolean> {
    await this.request<any>(`/activities/${id}/publish`, { method: 'PATCH' });
    return true;
  }

  async getKartaMeetingAttendance(activityId: number): Promise<AttendanceMember[]> {
    const res = await this.request<any>(`/karta/meetings/${activityId}/attendance`);
    return res.data?.members || [];
  }

  async updateKartaAttendance(activityId: number, status: AttendanceMember['status']): Promise<void> {
    await this.request<any>(`/karta/meetings/${activityId}/attendance`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Letters
  async getLetterTypes(): Promise<LetterType[]> {
    try {
      const res = await this.request<any>('/letter-types');
      return res.data || [];
    } catch {
      return mockLetterTypes;
    }
  }

  async getMyLetterRequests(): Promise<LetterRequest[]> {
    try {
      const res = await this.request<any>('/letter-requests/mine');
      return res.data || [];
    } catch {
      return mockLetterRequests;
    }
  }

  async getAllLetterRequests(): Promise<LetterRequest[]> {
    try {
      const res = await this.request<any>('/letter-requests');
      return res.data || [];
    } catch {
      return mockLetterRequests;
    }
  }

  async submitLetterRequest(letter_type_id: number, notes?: string): Promise<LetterRequest> {
    try {
      const res = await this.request<any>('/letter-requests', {
        method: 'POST',
        body: JSON.stringify({ letter_type_id, notes }),
      });
      return res.data;
    } catch {
      const type = mockLetterTypes.find((t) => t.id === letter_type_id);
      const newReq: LetterRequest = {
        id: mockIdCounter++,
        user_id: 2,
        letter_type_id,
        status: 'menunggu_review',
        notes,
        created_at: new Date().toISOString(),
        letter_type: type,
      };
      mockLetterRequests.unshift(newReq);
      return newReq;
    }
  }

  async updateLetterStatus(id: number, status: string, admin_note?: string): Promise<boolean> {
    try {
      await this.request<any>(`/letter-requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, admin_note }),
      });
      return true;
    } catch {
      const found = mockLetterRequests.find((r) => r.id === id);
      if (found) {
        found.status = status as any;
        if (admin_note) found.admin_note = admin_note;
      }
      return true;
    }
  }

  // Complaints
  async getMyComplaints(): Promise<CitizenComplaint[]> {
    try {
      const res = await this.request<any>('/complaints/mine');
      return res.data || [];
    } catch {
      return mockComplaints;
    }
  }

  async getAllComplaints(): Promise<CitizenComplaint[]> {
    try {
      const res = await this.request<any>('/complaints');
      return res.data || [];
    } catch {
      return mockComplaints;
    }
  }

  async submitComplaint(complaint: {
    category: string;
    description: string;
    location: string;
    photo?: { uri: string; name: string; type: string; base64?: string | null };
  }): Promise<CitizenComplaint> {
    try {
      if (!complaint.photo) {
        const res = await this.request<any>('/complaints', {
          method: 'POST',
          body: JSON.stringify({
            category: complaint.category,
            description: complaint.description,
            location: complaint.location,
          }),
        });
        return res.data;
      }

      const body = new FormData();
      body.append('category', complaint.category);
      body.append('description', complaint.description);
      body.append('location', complaint.location);

      let bytes: Uint8Array;
      if (complaint.photo.base64) {
        bytes = toByteArray(complaint.photo.base64);
      } else {
        bytes = await this.uriToBytes(complaint.photo.uri);
      }

      // Expo SDK 57 WinterCG fetch requires an object implementing .bytes() or standard Blob
      body.append('photo', {
        name: complaint.photo.name,
        type: complaint.photo.type,
        uri: complaint.photo.uri,
        bytes: () => bytes,
      } as any);

      const res = await this.request<any>('/complaints', {
        method: 'POST',
        body,
      });
      return res.data;
    } catch (error) {
      if (complaint.photo || error instanceof ApiRequestError) throw error;
      const newC: CitizenComplaint = {
        id: mockIdCounter++,
        reporter_id: 2,
        category: complaint.category,
        description: complaint.description,
        location: complaint.location,
        status: 'baru',
        created_at: new Date().toISOString(),
      };
      mockComplaints.unshift(newC);
      return newC;
    }
  }

  private async uriToBytes(uri: string): Promise<Uint8Array> {
    try {
      const res = await fetch(uri);
      const buffer = await res.arrayBuffer();
      return new Uint8Array(buffer);
    } catch {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
              resolve(new Uint8Array(reader.result));
            } else {
              reject(new Error('Gagal membaca data file foto'));
            }
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(xhr.response);
        };
        xhr.onerror = reject;
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });
    }
  }

  async updateComplaintStatus(id: number, status: string, handler_note?: string): Promise<boolean> {
    try {
      await this.request<any>(`/complaints/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, handler_note }),
      });
      return true;
    } catch {
      const found = mockComplaints.find((c) => c.id === id);
      if (found) {
        found.status = status as any;
        if (handler_note) found.handler_note = handler_note;
      }
      return true;
    }
  }

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    const res = await this.request<any>('/notifications');
    return res.data || [];
  }

  async getUnreadCount(): Promise<number> {
    const res = await this.request<any>('/notifications/unread-count');
    return res.data?.unread_count ?? 0;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    await this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
    return true;
  }

  async markAllNotificationsRead(): Promise<boolean> {
    await this.request<any>('/notifications/read-all', { method: 'PATCH' });
    return true;
  }
}

export const api = new ApiService();
