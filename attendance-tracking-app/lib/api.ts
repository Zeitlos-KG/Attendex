// Normalize API URL: strip trailing slash, ensure it ends with /api
function buildApiUrl(raw: string): string {
  const trimmed = raw.replace(/\/+$/, '') // remove trailing slashes
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}
const API_URL = buildApiUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

export interface DashboardStats {
  total_subjects: number;
  total_classes: number;
  attended_classes: number;
  overall_percentage: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface TimetableEntry {
  id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  type: 'Class' | 'Tutorial' | 'Lab';
}

export interface AttendanceRecord {
  id: number;
  timetable_id: number;
  date: string;
  status: 'Present' | 'Absent';
  marked_at: string;
}

import { createClient } from './supabase/client'

// Helper to get auth headers with Supabase token
async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  return headers
}

// API Functions
export const api = {
  // Dashboard
  getDashboard: async (subgroup?: string): Promise<DashboardStats> => {
    const url = subgroup
      ? `${API_URL}/dashboard?subgroup=${encodeURIComponent(subgroup)}`
      : `${API_URL}/dashboard`;
    const res = await fetch(url, { headers: await getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
  },

  // Subjects
  getSubjects: async (subgroup?: string): Promise<Subject[]> => {
    const url = subgroup
      ? `${API_URL}/subjects?subgroup=${encodeURIComponent(subgroup)}`
      : `${API_URL}/subjects`;
    const res = await fetch(url, { headers: await getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch subjects');
    return res.json();
  },

  createSubject: async (name: string, code: string): Promise<Subject> => {
    const res = await fetch(`${API_URL}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code }),
    });
    if (!res.ok) throw new Error('Failed to create subject');
    return res.json();
  },

  // Timetable
  getTimetable: async (subgroup?: string): Promise<TimetableEntry[]> => {
    const url = subgroup
      ? `${API_URL}/timetable?subgroup=${encodeURIComponent(subgroup)}`
      : `${API_URL}/timetable`;
    const res = await fetch(url, { headers: await getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch timetable');
    return res.json();
  },

  createTimetableEntry: async (entry: {
    subject_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    type: string;
  }): Promise<TimetableEntry> => {
    const res = await fetch(`${API_URL}/timetable`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Failed to create timetable entry');
    return res.json();
  },

  // Attendance
  markAttendance: async (
    timetable_id: number,
    date: string,
    status: 'Present' | 'Absent'
  ): Promise<AttendanceRecord> => {
    const headers = await getAuthHeaders() // Add auth token
    const res = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ timetable_id, date, status }),
    });
    if (!res.ok) throw new Error('Failed to mark attendance');
    return res.json();
  },

  getAttendanceHistory: async (): Promise<AttendanceRecord[]> => {
    const res = await fetch(`${API_URL}/attendance/history`, {
      headers: await getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch attendance history');
    return res.json();
  },

  getSubjectAttendance: async (subjectId: number) => {
    const res = await fetch(`${API_URL}/attendance/subject/${subjectId}`, {
      headers: await getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch subject attendance');
    return res.json();
  },

  deleteAttendance: async (timetable_id: number, date: string): Promise<void> => {
    const headers = await getAuthHeaders() // Add auth token
    const res = await fetch(`${API_URL}/attendance/delete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ timetable_id, date }),
    });
    if (!res.ok) throw new Error('Failed to delete attendance');
  },

  // Analytics — single batch call replacing N+1 subject requests
  getAnalytics: async (subgroup: string): Promise<{
    subjects: Array<{
      id: number;
      name: string;
      code: string;
      total_weight: number;
      attended_weight: number;
      percentage: number;
    }>;
    attendance_history: Array<{ date: string; status: string }>;
  }> => {
    const url = `${API_URL}/analytics?subgroup=${encodeURIComponent(subgroup)}`;
    const res = await fetch(url, { headers: await getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },
};
