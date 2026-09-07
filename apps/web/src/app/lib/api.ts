/**
 * CallMind AI — Central API client
 * All communication with the FastAPI backend goes through here.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = "/api/v1";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  agency_id: string;
  name: string;
  role: string;
}

export interface Lead {
  id: string;
  agency_id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  intent: string;
  status: string;
  contact_eligibility: boolean;
  consent_status: string;
  created_at: string;
  // computed/enriched on frontend
  avatarColor?: string;
  date?: string;
  // optional extra fields from seed
  location?: string;
  budget?: string;
  interest?: string;
  lastAction?: string;
  assignedTo?: string;
}

export interface Strategy {
  id: string;
  lead_id: string;
  lead_name: string;
  lead_avatar_color: string;
  objective: string;
  questions: string[];
  status: string;
  approved_by: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  lead_id: string;
  lead_name: string;
  lead_avatar: string;
  channel: string;
  status: string;
  last_msg: string;
  time: string;
  msg_count: number;
  sentiment: string;
  ai_handled: boolean;
  messages: Array<{ from: string; text: string; ts?: string }>;
}

export interface Appointment {
  id: string;
  lead_id: string;
  lead_name: string;
  lead_avatar: string;
  date: string;
  time: string;
  duration: string;
  appointment_type: string;
  property_address: string | null;
  agent: string | null;
  status: string;
  notes: string | null;
}

export interface AnalyticsSummary {
  total_leads: number;
  active_conversations: number;
  qualified_this_month: number;
  appointments_booked: number;
  trends: {
    total_leads: string;
    qualified_this_month: string;
  };
}

export interface WeeklyDataPoint {
  label: string;
  date: string;
  conversations: number;
  qualified: number;
  booked: number;
}

export interface FunnelDataPoint {
  label: string;
  value: number;
  color: string;
  pct: number;
}

export interface ChannelDataPoint {
  label: string;
  value: number;
  pct: number;
  color: string;
}

export interface CreateLeadPayload {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  intent?: string;
}

// ─── Auth helpers ──────────────────────────────────────────────────────────────

export const TOKEN_KEY = "callmind_token";
export const USER_KEY = "callmind_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(data: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify({
    id: data.user_id,
    agency_id: data.agency_id,
    name: data.name,
    role: data.role,
  }));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser(): { id: string; agency_id: string; name: string; role: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

// ─── Core fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${API_PREFIX}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearAuth();
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail?.detail || `API error ${res.status}`);
  }

  return res.json();
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}${API_PREFIX}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.detail || "Login failed");
  }
  return res.json();
}

export async function register(payload: {
  email: string;
  password: string;
  name: string;
  agency_name: string;
}): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}${API_PREFIX}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.detail || "Registration failed");
  }
  return res.json();
}

// ─── Leads API ────────────────────────────────────────────────────────────────

export const leadsApi = {
  list: (status?: string) =>
    apiFetch<Lead[]>(`/leads${status ? `?status=${status}` : ""}`),

  get: (id: string) => apiFetch<Lead>(`/leads/${id}`),

  create: (payload: CreateLeadPayload) =>
    apiFetch<Lead>("/leads", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, data: Partial<Lead>) =>
    apiFetch<Lead>(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<void>(`/leads/${id}`, { method: "DELETE" }),
};

// ─── Strategies API ───────────────────────────────────────────────────────────

export const strategiesApi = {
  list: (status?: string) =>
    apiFetch<Strategy[]>(`/strategies${status ? `?status_filter=${status}` : ""}`),

  approve: (id: string, customQuestions?: string[]) =>
    apiFetch<Strategy>(`/strategies/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ custom_questions: customQuestions }),
    }),

  reject: (id: string) =>
    apiFetch<{ status: string }>(`/strategies/${id}/reject`, { method: "POST", body: "{}" }),
};

// ─── Conversations API ────────────────────────────────────────────────────────

export const conversationsApi = {
  list: () => apiFetch<Conversation[]>("/conversations"),
  get: (id: string) => apiFetch<Conversation>(`/conversations/${id}`),
  create: (payload: { lead_id: string; channel?: string; initial_message?: string }) =>
    apiFetch<Conversation>("/conversations", { method: "POST", body: JSON.stringify(payload) }),
  sendMessage: (id: string, text: string, from: "ai" | "human" = "human") =>
    apiFetch<{ status: string; message_count: number }>(`/conversations/${id}/message`, {
      method: "POST",
      body: JSON.stringify({ from, text }),
    }),
  takeOver: (id: string) =>
    apiFetch<{ status: string; ai_handled: boolean }>(`/conversations/${id}/takeover`, {
      method: "POST",
      body: "{}",
    }),
};

// ─── Appointments API ─────────────────────────────────────────────────────────

export interface CreateAppointmentPayload {
  lead_id: string;
  date: string;
  time: string;
  duration?: string;
  appointment_type?: string;
  property_address?: string;
  agent?: string;
  notes?: string;
}

export const appointmentsApi = {
  list: () => apiFetch<Appointment[]>("/appointments"),
  create: (payload: CreateAppointmentPayload) =>
    apiFetch<Appointment>("/appointments", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, data: { status?: string; notes?: string; date?: string; time?: string }) =>
    apiFetch<Appointment>(`/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  cancel: (id: string) =>
    apiFetch<Appointment>(`/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled" }),
    }),
};


// ─── Analytics API ────────────────────────────────────────────────────────────

export const analyticsApi = {
  summary: () => apiFetch<AnalyticsSummary>("/analytics/summary"),
  weekly: () => apiFetch<WeeklyDataPoint[]>("/analytics/weekly"),
  monthly: () => apiFetch<WeeklyDataPoint[]>("/analytics/monthly"),
  funnel: () => apiFetch<FunnelDataPoint[]>("/analytics/funnel"),
  channels: () => apiFetch<ChannelDataPoint[]>("/analytics/channels"),
};

// ─── Utility ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["v", "b", "g", "a", "r"] as const;

export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getIntentScore(lead: Lead): number {
  // Map intent string to a numeric score for display
  const statusScores: Record<string, number> = {
    converted: 95,
    qualified: 82,
    engaging: 68,
    reviewing: 60,
    new: 45,
    "human-required": 25,
  };
  return statusScores[lead.status] ?? 50;
}
