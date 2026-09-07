"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Bell, LayoutDashboard, Users, MessageCircle, Brain,
  Calendar, BarChart, Settings, ArrowUpRight, ArrowDownRight,
  ChevronRight, PanelLeftClose, PanelLeftOpen,
  Phone, Mail, MapPin, Clock, CheckCircle, XCircle, AlertTriangle,
  Star, Filter, Plus, Download, RefreshCw, Eye, Edit3,
  ThumbsUp, ThumbsDown, ChevronDown,
  User, Globe, Bell as BellIcon, Shield,
  Target, Award, Send,
  Building2, DollarSign, Home, PhoneCall, MessageSquare,
  X, LogOut, Loader2, Activity, CheckCircle2,
  TrendingUp
} from "lucide-react";
import CallMindLogo from "../components/CallMindLogo";
import {
  leadsApi, strategiesApi, conversationsApi, appointmentsApi, analyticsApi,
  login, setAuth, clearAuth, getToken, getUser,
  Lead, Strategy, Conversation, Appointment,
  AnalyticsSummary, WeeklyDataPoint, FunnelDataPoint, ChannelDataPoint,
  CreateAppointmentPayload,
  getAvatarColor, formatDate, getIntentScore,
} from "../lib/api";
import { createClient } from "../../utils/supabase/client";

// Email validation helper
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Toast System ─────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";
interface Toast { id: number; message: string; type: ToastType }

let toastIdCounter = 0;
let _addToast: ((msg: string, type?: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = "success") {
  _addToast?.(message, type);
}

function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    _addToast = (message, type = "success") => {
      const id = ++toastIdCounter;
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };
    return () => { _addToast = null; };
  }, []);

  if (!toasts.length) return null;

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 18px", borderRadius: 14, fontSize: 14, fontWeight: 500,
          boxShadow: "0 4px 24px rgba(0,0,0,0.14)",
          animation: "fadeInUp 250ms ease-out both",
          background: t.type === "success" ? "linear-gradient(135deg,#0d9488,#059669)"
            : t.type === "error" ? "linear-gradient(135deg,#ef4444,#dc2626)"
            : "linear-gradient(135deg,#3b82f6,#2563eb)",
          color: "#fff",
          maxWidth: 340,
        }}>
          {t.type === "success" ? <CheckCircle2 size={16} /> : t.type === "error" ? <XCircle size={16} /> : <Bell size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

const getLabel = (s: string) =>
  s === "human-required" ? "Review" : s.charAt(0).toUpperCase() + s.slice(1);
const getIntentClass = (v: number) => v >= 70 ? "high" : v >= 40 ? "medium" : "low";

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: "#0d9488" }} />
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, gap: 12, color: "var(--ink-tertiary)" }}>
      <div style={{ opacity: 0.25 }}>{icon}</div>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{text}</span>
    </div>
  );
}

// ─── Login Modal ───────────────────────────────────────────────────────────────

function LoginModal({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("admin@callmind.ai");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(email, password);
      toast("Welcome to CallMind AI!");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestLogin() {
    setLoading(true);
    setAuth({
      access_token: "GUEST_TOKEN",
      token_type: "bearer",
      user_id: "guest",
      agency_id: "default_agency",
      name: "Guest User",
      role: "agent"
    });
    onSuccess();
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="glass-card" style={{ width: 420, maxWidth: "90vw", padding: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <CallMindLogo size={32} showText={true} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Sign in to Dashboard</h2>
        <p style={{ fontSize: 13, color: "var(--ink-secondary)", marginBottom: 20 }}>
          Sign in with your CallMind account or as guest
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button 
            onClick={() => {
              setEmail("admin@callmind.ai");
              setPassword("admin123");
              handlePasswordLogin(new Event('submit') as any);
            }} 
            className="btn-primary" 
            style={{ width: "100%", justifyContent: "center", padding: "12px" }} 
            disabled={loading}
          >
            {loading && email === "admin@callmind.ai" ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : "Login as Admin (Alex Johnson)"}
          </button>
          
          <button 
            onClick={() => {
              setEmail("maria@callmind.ai");
              setPassword("admin123");
              handlePasswordLogin(new Event('submit') as any);
            }} 
            className="btn-primary" 
            style={{ width: "100%", justifyContent: "center", padding: "12px", background: "var(--ink-primary)", color: "#fff" }} 
            disabled={loading}
          >
            {loading && email === "maria@callmind.ai" ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : "Login as Admin (Maria Lee)"}
          </button>
          
          {error && <div style={{ color: "#ef4444", fontSize: 13, padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>{error}</div>}
          
          <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--glass-border)" }} />
            <span style={{ padding: "0 10px", fontSize: 12, color: "var(--ink-tertiary)", fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--glass-border)" }} />
          </div>

          <button 
            onClick={handleGuestLogin} 
            className="btn-secondary" 
            style={{ width: "100%", justifyContent: "center", background: "rgba(0,0,0,0.03)", padding: "12px" }} 
            disabled={loading}
          >
            <User size={16} style={{ marginRight: 8, color: "var(--ink-secondary)" }} />
            Continue as Guest User
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Lead Modal ────────────────────────────────────────────────────────────

function AddLeadModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("manual");
  const [intent, setIntent] = useState("buy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Email validation
    if (email && !isValidEmail(email)) {
      setError("Please enter a valid email address (e.g. name@example.com)");
      return;
    }
    setLoading(true); setError("");
    try {
      await leadsApi.create({ name, phone, email: email || undefined, source, intent });
      toast("Lead added successfully!");
      onAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="card-title" style={{ marginBottom: 20 }}>Add New Lead</div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { label: "Full Name *", val: name, set: setName, type: "text", req: true },
          { label: "Phone *", val: phone, set: setPhone, type: "tel", req: true },
          { label: "Email", val: email, set: setEmail, type: "email", req: false },
        ].map(f => (
          <div key={f.label}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "var(--ink-secondary)", display: "block", marginBottom: 6 }}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} required={f.req}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--glass-border)", borderRadius: 10, fontSize: 14, background: "rgba(255,255,255,0.7)", outline: "none" }} />
          </div>
        ))}
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { label: "Source", val: source, set: setSource, opts: ["manual", "website", "referral", "cold_call"] },
            { label: "Intent", val: intent, set: setIntent, opts: ["buy", "rent", "invest", "sell"] },
          ].map(f => (
            <div key={f.label} style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "var(--ink-secondary)", display: "block", marginBottom: 6 }}>{f.label}</label>
              <select value={f.val} onChange={e => f.set(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--glass-border)", borderRadius: 10, fontSize: 13, background: "rgba(255,255,255,0.7)", outline: "none" }}>
                {f.opts.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            </div>
          ))}
        </div>
        {error && <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>}
        <ModalButtons onClose={onClose} loading={loading} confirmLabel="Add Lead" />
      </form>
    </ModalOverlay>
  );
}

// ─── Edit Lead Modal ───────────────────────────────────────────────────────────

function EditLeadModal({ lead, onClose, onSaved }: { lead: Lead; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(lead.name);
  const [phone, setPhone] = useState(lead.phone);
  const [email, setEmail] = useState(lead.email || "");
  const [intent, setIntent] = useState(lead.intent);
  const [status, setStatus] = useState(lead.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await leadsApi.update(lead.id, { name, phone, email: email || undefined, intent, status } as any);
      toast("Lead updated successfully!");
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update lead");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="card-title" style={{ marginBottom: 20 }}>Edit Lead</div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { label: "Full Name *", val: name, set: setName, type: "text", req: true },
          { label: "Phone *", val: phone, set: setPhone, type: "tel", req: true },
          { label: "Email", val: email, set: setEmail, type: "email", req: false },
        ].map(f => (
          <div key={f.label}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "var(--ink-secondary)", display: "block", marginBottom: 6 }}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} required={f.req}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--glass-border)", borderRadius: 10, fontSize: 14, background: "rgba(255,255,255,0.7)", outline: "none" }} />
          </div>
        ))}
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { label: "Intent", val: intent, set: setIntent, opts: ["buy", "rent", "invest", "sell"] },
            { label: "Status", val: status, set: setStatus, opts: ["new", "engaging", "qualified", "reviewing", "human-required", "converted"] },
          ].map(f => (
            <div key={f.label} style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "var(--ink-secondary)", display: "block", marginBottom: 6 }}>{f.label}</label>
              <select value={f.val} onChange={e => f.set(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--glass-border)", borderRadius: 10, fontSize: 13, background: "rgba(255,255,255,0.7)", outline: "none" }}>
                {f.opts.map(o => <option key={o} value={o}>{getLabel(o)}</option>)}
              </select>
            </div>
          ))}
        </div>
        {error && <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>}
        <ModalButtons onClose={onClose} loading={loading} confirmLabel="Save Changes" />
      </form>
    </ModalOverlay>
  );
}

// ─── Book Appointment Modal ────────────────────────────────────────────────────

function BookAppointmentModal({ leads, prefillLeadId, onClose, onBooked }: {
  leads: Lead[]; prefillLeadId?: string; onClose: () => void; onBooked: () => void;
}) {
  const [leadId, setLeadId] = useState(prefillLeadId || (leads[0]?.id ?? ""));
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 AM");
  const [type, setType] = useState("Property Viewing");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) { setError("Please select a date"); return; }
    setLoading(true); setError("");
    try {
      await appointmentsApi.create({ lead_id: leadId, date, time, appointment_type: type, property_address: address || undefined, notes: notes || undefined });
      toast("Appointment booked!");
      onBooked();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid var(--glass-border)", borderRadius: 10, fontSize: 14, background: "rgba(255,255,255,0.7)", outline: "none", fontFamily: "var(--font-display)" };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-secondary)", display: "block", marginBottom: 6 };

  return (
    <ModalOverlay onClose={onClose} wide>
      <div className="card-title" style={{ marginBottom: 20 }}>Book Appointment</div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>Lead *</label>
          <select value={leadId} onChange={e => setLeadId(e.target.value)} style={{ ...inputStyle, fontSize: 13 }}>
            {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Date *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Time</label>
            <input type="text" value={time} onChange={e => setTime(e.target.value)} placeholder="e.g. 2:00 PM" style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Type</label>
          <select value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle, fontSize: 13 }}>
            {["Property Viewing", "Consultation", "Contract Signing", "Investment Review", "Open House"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Property Address</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 123 Main St, Los Angeles" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            style={{ ...inputStyle, resize: "none" as const }} placeholder="Any special notes for this appointment..." />
        </div>
        {error && <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>}
        <ModalButtons onClose={onClose} loading={loading} confirmLabel="Book Appointment" />
      </form>
    </ModalOverlay>
  );
}

// ─── Shared Modal Primitives ───────────────────────────────────────────────────

function ModalOverlay({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-card" style={{ width: wide ? 480 : 420, maxWidth: "90vw", padding: 32, animation: "fadeInUp 200ms ease-out both", position: "relative" }}>
        <button className="icon-btn" style={{ position: "absolute", top: 20, right: 20, width: 28, height: 28 }} onClick={onClose}><X size={14} /></button>
        {children}
      </div>
    </div>
  );
}

function ModalButtons({ onClose, loading, confirmLabel }: { onClose: () => void; loading: boolean; confirmLabel: string }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
      <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
      <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={loading}>
        {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : confirmLabel}
      </button>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ activePage, setActivePage, collapsed, setCollapsed }: {
  activePage: string; setActivePage: (p: string) => void; collapsed: boolean; setCollapsed: (v: boolean) => void;
}) {
  const user = getUser();
  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "??";

  const mainNav = [
    { id: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { id: "leads", icon: <Users size={18} />, label: "Leads" },
    { id: "conversations", icon: <MessageCircle size={18} />, label: "Conversations" },
    { id: "strategies", icon: <Brain size={18} />, label: "Strategies" },
  ];
  const secondaryNav = [
    { id: "appointments", icon: <Calendar size={18} />, label: "Appointments" },
    { id: "analytics", icon: <BarChart size={18} />, label: "Analytics" },
    { id: "settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && <div className="sidebar-logo"><CallMindLogo size={34} showText={true} /></div>}
        {collapsed && <CallMindLogo size={32} showText={false} className="sidebar-logo-collapsed" />}
        <button className="sidebar-toggle-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-label">Main</div>}
        {mainNav.map(item => (
          <div key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""} ${collapsed ? "nav-item-icon-only" : ""}`}
            onClick={() => setActivePage(item.id)} title={collapsed ? item.label : undefined}>
            <span className="nav-item-icon">{item.icon}</span>
            {!collapsed && item.label}
          </div>
        ))}
        {!collapsed && <div className="nav-section-label">Manage</div>}
        {collapsed && <div style={{ height: 16 }} />}
        {secondaryNav.map(item => (
          <div key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""} ${collapsed ? "nav-item-icon-only" : ""}`}
            onClick={() => setActivePage(item.id)} title={collapsed ? item.label : undefined}>
            <span className="nav-item-icon">{item.icon}</span>
            {!collapsed && item.label}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className={`sidebar-user ${collapsed ? "sidebar-user-collapsed" : ""}`}>
          <div className="sidebar-user-avatar">{initials}</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || "User"}</div>
              <div className="sidebar-user-role">{user?.role === "agency_admin" ? "Agency Admin" : user?.role || "Agent"}</div>
            </div>
          )}
        </div>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div className={`nav-item ${collapsed ? "nav-item-icon-only" : ""}`}
            style={{ marginTop: "12px", color: "var(--ink-secondary)" }} title={collapsed ? "Exit" : undefined}>
            <span className="nav-item-icon"><LogOut size={18} /></span>
            {!collapsed && "Exit"}
          </div>
        </Link>
      </div>
    </aside>
  );
}

// ─── TopBar ────────────────────────────────────────────────────────────────────

const pageMeta: Record<string, { title: string; subtitle: string; cta?: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Welcome back — here's what's happening today.", cta: "+ New Lead" },
  leads: { title: "Leads", subtitle: "Manage and track all your real estate leads.", cta: "+ Add Lead" },
  conversations: { title: "Conversations", subtitle: "AI-managed outreach threads across all channels." },
  strategies: { title: "Strategies", subtitle: "AI-generated engagement plans awaiting your review." },
  appointments: { title: "Appointments", subtitle: "Scheduled viewings, consultations, and signings.", cta: "+ Book Appointment" },
  analytics: { title: "Analytics", subtitle: "Performance insights and conversion metrics." },
  settings: { title: "Settings", subtitle: "Configure your agency, integrations, and preferences." },
};

function TopBar({ activePage, onCta }: { activePage: string; onCta?: () => void }) {
  const meta = pageMeta[activePage] ?? pageMeta.dashboard;
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <h1>{meta.title}</h1>
        <p>{meta.subtitle}</p>
      </div>
      <div className="top-bar-right">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search leads, strategies…" />
        </div>
        <button className="icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="badge">3</span>
        </button>
        {meta.cta && <button className="btn-primary" onClick={onCta}>{meta.cta}</button>}
      </div>
    </div>
  );
}

// ─── Dashboard Home ────────────────────────────────────────────────────────────

function StatCards({ summary }: { summary: AnalyticsSummary | null }) {
  const stats = summary ? [
    { icon: <Users size={22} />, iconClass: "violet", value: summary.total_leads.toLocaleString(), label: "Total Leads", trend: summary.trends.total_leads, trendDir: "up" },
    { icon: <MessageCircle size={22} />, iconClass: "blue", value: summary.active_conversations.toLocaleString(), label: "Active Conversations", trend: "+—", trendDir: "up" },
    { icon: <Brain size={22} />, iconClass: "green", value: summary.qualified_this_month.toLocaleString(), label: "Qualified This Month", trend: summary.trends.qualified_this_month, trendDir: "up" },
    { icon: <Calendar size={22} />, iconClass: "amber", value: summary.appointments_booked.toLocaleString(), label: "Appointments Booked", trend: "+—", trendDir: "up" },
  ] : [
    { icon: <Users size={22} />, iconClass: "violet", value: "—", label: "Total Leads", trend: "…", trendDir: "up" },
    { icon: <MessageCircle size={22} />, iconClass: "blue", value: "—", label: "Active Conversations", trend: "…", trendDir: "up" },
    { icon: <Brain size={22} />, iconClass: "green", value: "—", label: "Qualified This Month", trend: "…", trendDir: "up" },
    { icon: <Calendar size={22} />, iconClass: "amber", value: "—", label: "Appointments Booked", trend: "…", trendDir: "up" },
  ];
  return (
    <div className="stats-grid">
      {stats.map((s, i) => (
        <div key={i} className="glass-card interactive stat-card">
          <div className="stat-card-header">
            <div className={`stat-card-icon ${s.iconClass}`}>{s.icon}</div>
            <span className="stat-card-trend up"><ArrowUpRight size={14} />{s.trend}</span>
          </div>
          <div className="stat-card-value">{s.value}</div>
          <div className="stat-card-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function DashboardHome({ summary, weeklyData, monthlyData, funnelData, leads, onLeadClick }: {
  summary: AnalyticsSummary | null;
  weeklyData: WeeklyDataPoint[];
  monthlyData: WeeklyDataPoint[];
  funnelData: FunnelDataPoint[];
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}) {
  const [chartRange, setChartRange] = useState<"week" | "month">("week");
  const chartData = chartRange === "week" ? weeklyData : monthlyData;
  const maxVal = Math.max(...chartData.map(d => d.conversations), 1);

  const mockRecommendations = [
    { title: "Follow up with Hot Leads", desc: "3 leads have high intent scores but haven't been contacted in 48 hours.", action: "View Leads", icon: <AlertTriangle size={18} />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { title: "Google Ads Optimization", desc: "Conversion rate dropped by 1.2% this week. Consider reviewing the new campaign.", action: "Review Campaign", icon: <TrendingUp size={18} />, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    { title: "New AI Strategies Available", desc: "5 new engagement strategies are awaiting your approval.", action: "Review Strategies", icon: <Brain size={18} />, color: "#0d9488", bg: "rgba(13,148,136,0.1)" }
  ];

  return (
    <>
      <StatCards summary={summary} />
      
      {/* ── Strategic Recommendations ── */}
      <div className="glass-card" style={{ animation: "fadeInUp 500ms ease-out 250ms both", marginBottom: 24 }}>
        <div className="card-header">
          <div><div className="card-title">Strategic Recommendations</div><div className="card-subtitle">AI-driven actionable insights for your agency</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {mockRecommendations.map((rec, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px", borderRadius: 16, background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: rec.bg, color: rec.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {rec.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{rec.title}</div>
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-secondary)", lineHeight: 1.5, flex: 1 }}>{rec.desc}</p>
              <button className="btn-secondary" style={{ alignSelf: "flex-start", padding: "6px 14px", fontSize: 12 }}>{rec.action} <ChevronRight size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="content-grid" style={{ marginBottom: 24 }}>
        <div className="glass-card" style={{ animation: "fadeInUp 500ms ease-out 300ms both" }}>
          <div className="card-header">
            <div><div className="card-title">Lead Engagement</div><div className="card-subtitle">{chartRange === "week" ? "Daily conversations this week" : "Weekly conversations this month"}</div></div>
            <div className="card-actions">
              <button className={`filter-chip ${chartRange === "week" ? "active" : ""}`} onClick={() => setChartRange("week")}>Week</button>
              <button className={`filter-chip ${chartRange === "month" ? "active" : ""}`} onClick={() => setChartRange("month")}>Month</button>
            </div>
          </div>
          <div className="chart-container">
            {chartData.map((d, i) => (
              <div className="chart-bar-group" key={i}>
                <div className="chart-bar primary" style={{ height: `${(d.conversations / maxVal) * 100}%` }} title={`Conv: ${d.conversations}`} />
                <div className="chart-bar secondary" style={{ height: `${(d.qualified / maxVal) * 100}%` }} title={`Qual: ${d.qualified}`} />
                <span className="chart-bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card" style={{ animation: "fadeInUp 500ms ease-out 350ms both" }}>
          <div className="card-header"><div><div className="card-title">Conversion Funnel</div><div className="card-subtitle">Lead lifecycle</div></div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {funnelData.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "var(--ink-secondary)", width: 80, textAlign: "right", fontWeight: 500 }}>{item.label}</span>
                <div style={{ flex: 1, height: 32, background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(item.pct, 4)}%`, height: "100%", background: `linear-gradient(90deg, ${item.color}CC, ${item.color}88)`, borderRadius: 8, display: "flex", alignItems: "center", paddingLeft: 12, transition: "width 800ms ease" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>{item.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="glass-card" style={{ animation: "fadeInUp 500ms ease-out 400ms both" }}>
        <div className="card-header">
          <div><div className="card-title">Recent Leads</div><div className="card-subtitle">Click any lead to view details</div></div>
        </div>
        <div className="table-scroll-wrapper">
          <table className="data-table">
            <thead><tr><th>Lead</th><th>Status</th><th>Intent Score</th><th>Source</th><th>Date</th></tr></thead>
            <tbody>
              {leads.slice(0, 5).map((lead, idx) => {
                const score = getIntentScore(lead);
                return (
                  <tr key={lead.id} style={{ cursor: "pointer" }} onClick={() => onLeadClick(lead)}
                    className="table-row-hover">
                    <td>
                      <div className="lead-info">
                        <div className={`lead-avatar ${getAvatarColor(idx)}`}>{lead.name.split(" ").map(n => n[0]).join("")}</div>
                        <div><div className="lead-name">{lead.name}</div><div className="lead-email">{lead.email || lead.phone}</div></div>
                      </div>
                    </td>
                    <td><span className={`status-badge ${lead.status}`}><span className="status-dot" />{getLabel(lead.status)}</span></td>
                    <td>
                      <div className="intent-score">
                        <div className="intent-bar-bg"><div className={`intent-bar-fill ${getIntentClass(score)}`} style={{ width: `${score}%` }} /></div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)" }}>{score}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--ink-secondary)" }}>{lead.source}</td>
                    <td style={{ fontSize: 13, color: "var(--ink-secondary)" }}>{formatDate(lead.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Leads Page ────────────────────────────────────────────────────────────────

function LeadsPage({ leads, loading, onRefresh }: { leads: Lead[]; loading: boolean; onRefresh: () => void }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);

  // Listen for cross-page navigation (clicking a lead from dashboard)
  useEffect(() => {
    const handler = (e: Event) => {
      const leadId = (e as CustomEvent).detail as string;
      setSelected(leadId);
      setFilter("all");
    };
    window.addEventListener("select-lead", handler);
    return () => window.removeEventListener("select-lead", handler);
  }, []);

  const statuses = ["all", "new", "engaging", "qualified", "reviewing", "human-required", "converted"];
  const filtered = filter === "all" ? leads : leads.filter(l => l.status === filter);
  const selectedLead = leads.find(l => l.id === selected);

  function exportCSV() {
    const headers = ["Name", "Phone", "Email", "Source", "Intent", "Status", "Date Added"];
    const rows = leads.map(l => [l.name, l.phone, l.email || "", l.source, l.intent, l.status, formatDate(l.created_at)]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "callmind_leads.csv"; a.click();
    URL.revokeObjectURL(url);
    toast("Leads exported as CSV!");
  }

  if (loading) return <div className="glass-card"><Spinner /></div>;

  return (
    <>
      {editLead && <EditLeadModal lead={editLead} onClose={() => setEditLead(null)} onSaved={onRefresh} />}

      <div className="leads-layout" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass-card" style={{ padding: "16px 20px" }}>
            <div className="filter-chips-row" style={{ display: "flex", gap: 8, flexWrap: "nowrap", alignItems: "center" }}>
              <Filter size={15} color="var(--ink-tertiary)" />
              {statuses.map(s => (
                <button key={s} className={`filter-chip ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
                  {s === "all" ? "All" : getLabel(s)}
                  <span style={{ marginLeft: 5, opacity: 0.7, fontSize: 11 }}>{s === "all" ? leads.length : leads.filter(l => l.status === s).length}</span>
                </button>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 13, gap: 6 }} onClick={exportCSV}>
                  <Download size={14} /> Export CSV
                </button>
                <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 13, gap: 6 }} onClick={onRefresh}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-scroll-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th style={{ padding: "14px 20px" }}>Lead</th><th>Status</th><th>Intent</th><th>Source</th><th>Phone</th><th>Date</th><th style={{ textAlign: "center" }}>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7}><EmptyState icon={<Users size={32} />} text="No leads found" /></td></tr>
                  ) : filtered.map((lead, idx) => {
                    const score = getIntentScore(lead);
                    return (
                      <tr key={lead.id} style={{ cursor: "pointer", background: selected === lead.id ? "rgba(13,148,136,0.04)" : undefined }}
                        onClick={() => setSelected(selected === lead.id ? null : lead.id)}>
                        <td style={{ padding: "14px 20px" }}>
                          <div className="lead-info">
                            <div className={`lead-avatar ${getAvatarColor(idx)}`}>{lead.name.split(" ").map(n => n[0]).join("")}</div>
                            <div><div className="lead-name">{lead.name}</div><div className="lead-email">{lead.email || "—"}</div></div>
                          </div>
                        </td>
                        <td><span className={`status-badge ${lead.status}`}><span className="status-dot" />{getLabel(lead.status)}</span></td>
                        <td>
                          <div className="intent-score">
                            <div className="intent-bar-bg"><div className={`intent-bar-fill ${getIntentClass(score)}`} style={{ width: `${score}%` }} /></div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)", width: 30 }}>{score}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: "var(--ink-secondary)" }}>{lead.source}</td>
                        <td style={{ fontSize: 13, color: "var(--ink-secondary)" }}>{lead.phone}</td>
                        <td style={{ fontSize: 13, color: "var(--ink-secondary)" }}>{formatDate(lead.created_at)}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button className="icon-btn" style={{ width: 30, height: 30 }} title="View" onClick={e => { e.stopPropagation(); setSelected(lead.id); }}><Eye size={13} /></button>
                            <button className="icon-btn" style={{ width: 30, height: 30 }} title="Edit" onClick={e => { e.stopPropagation(); setEditLead(lead); }}><Edit3 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedLead && (
          <div className="lead-detail-panel glass-card" style={{ width: 300, flexShrink: 0, animation: "fadeInUp 300ms ease-out both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div className="card-title">Lead Detail</div>
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setSelected(null)}><X size={14} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20, gap: 8 }}>
              <div className={`lead-avatar ${getAvatarColor(leads.indexOf(selectedLead))}`} style={{ width: 56, height: 56, fontSize: 18 }}>
                {selectedLead.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, textAlign: "center" }}>{selectedLead.name}</div>
              <span className={`status-badge ${selectedLead.status}`}><span className="status-dot" />{getLabel(selectedLead.status)}</span>
            </div>
            {[
              { icon: <Mail size={13} />, label: selectedLead.email || "No email" },
              { icon: <Phone size={13} />, label: selectedLead.phone },
              { icon: <Activity size={13} />, label: `Intent: ${selectedLead.intent}` },
              { icon: <MapPin size={13} />, label: `Source: ${selectedLead.source}` },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--glass-border)", fontSize: 13, color: "var(--ink-secondary)" }}>
                <span style={{ color: "#0d9488" }}>{row.icon}</span> {row.label}
              </div>
            ))}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setEditLead(selectedLead)}>
                <Edit3 size={14} /> Edit Lead
              </button>
              <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Conversations Page ────────────────────────────────────────────────────────

function ConversationsPage({ conversations, loading, onRefresh }: { conversations: Conversation[]; loading: boolean; onRefresh: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [draftMsg, setDraftMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [takingOver, setTakingOver] = useState(false);
  const [localConvs, setLocalConvs] = useState<Conversation[]>(conversations);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLocalConvs(conversations); }, [conversations]);
  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selected, localConvs]);

  const activeConv = localConvs.find(c => c.id === selected);

  const channelIcon = (ch: string) => ch === "SMS" ? <MessageSquare size={12} /> : ch === "Voice" ? <PhoneCall size={12} /> : <Mail size={12} />;
  const sentimentColor = (s: string) => s === "positive" ? "#10b981" : s === "negative" ? "#ef4444" : "#f59e0b";

  async function handleSend() {
    if (!selected || !draftMsg.trim()) return;
    setSending(true);
    try {
      await conversationsApi.sendMessage(selected, draftMsg.trim(), "human");
      setLocalConvs(prev => prev.map(c => c.id === selected
        ? { ...c, messages: [...c.messages, { from: "human", text: draftMsg.trim(), ts: new Date().toISOString() }], ai_handled: false }
        : c
      ));
      setDraftMsg("");
      toast("Message sent!");
    } catch (err: any) {
      toast(err.message || "Failed to send", "error");
    } finally {
      setSending(false);
    }
  }

  async function handleTakeOver() {
    if (!selected) return;
    setTakingOver(true);
    try {
      await conversationsApi.takeOver(selected);
      setLocalConvs(prev => prev.map(c => c.id === selected ? { ...c, status: "human-required", ai_handled: false } : c));
      toast("You've taken over this conversation.");
    } catch (err: any) {
      toast(err.message || "Failed", "error");
    } finally {
      setTakingOver(false);
    }
  }

  if (loading) return <div className="glass-card"><Spinner /></div>;

  return (
    <div className="conv-layout" style={{ display: "flex", gap: 0, height: "calc(100vh - 200px)", minHeight: 500, borderRadius: 24, overflow: "hidden", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}>
      {/* Thread list */}
      <div style={{ width: 300, flexShrink: 0, borderRight: "1px solid var(--glass-border)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--glass-border)" }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>All Threads ({localConvs.length})</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {localConvs.length === 0 ? <EmptyState icon={<MessageCircle size={28} />} text="No conversations yet" /> :
            localConvs.map(c => (
              <div key={c.id} onClick={() => setSelected(c.id)}
                style={{ padding: "14px 16px", cursor: "pointer", transition: "background 150ms",
                  background: selected === c.id ? "rgba(13,148,136,0.06)" : "transparent",
                  borderBottom: "1px solid rgba(0,0,0,0.04)", borderLeft: selected === c.id ? "3px solid #0d9488" : "3px solid transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className={`lead-avatar ${c.lead_avatar}`} style={{ width: 30, height: 30, fontSize: 11 }}>
                      {c.lead_name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.lead_name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ink-tertiary)" }}>{channelIcon(c.channel)} {c.channel}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: "var(--ink-tertiary)" }}>{c.time}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--ink-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginLeft: 38 }}>{c.last_msg || "No messages yet"}</p>
                <div style={{ display: "flex", gap: 6, marginLeft: 38, marginTop: 6 }}>
                  <span className={`status-badge ${c.status}`} style={{ fontSize: 10, padding: "2px 8px" }}>
                    <span className="status-dot" />{c.status === "human-required" ? "Action Needed" : c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: `${sentimentColor(c.sentiment)}18`, color: sentimentColor(c.sentiment), fontWeight: 600 }}>{c.sentiment}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Chat pane */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {activeConv ? (
          <>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: 12 }}>
              <div className={`lead-avatar ${activeConv.lead_avatar}`} style={{ width: 36, height: 36, fontSize: 13 }}>
                {activeConv.lead_name.split(" ").map(n => n[0]).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{activeConv.lead_name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-secondary)", display: "flex", gap: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>{channelIcon(activeConv.channel)} {activeConv.channel}</span>
                  <span>· {activeConv.messages.length} messages</span>
                  <span>· {activeConv.ai_handled ? "AI handled" : "Human agent"}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {activeConv.ai_handled && (
                  <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 12, gap: 5 }}
                    disabled={takingOver} onClick={handleTakeOver}>
                    {takingOver ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <User size={13} />}
                    Take Over
                  </button>
                )}
                <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 12, gap: 5 }} onClick={onRefresh}>
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {activeConv.messages.map((msg, i) => {
                const isAi = msg.from === "ai";
                return (
                  <div key={i} style={{ display: "flex", flexDirection: isAi ? "row" : "row-reverse", gap: 10, alignItems: "flex-end" }}>
                    {isAi && (
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#0d9488,#059669)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Brain size={13} color="#fff" />
                      </div>
                    )}
                    <div style={{
                      maxWidth: "68%", padding: "10px 14px",
                      borderRadius: isAi ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                      background: isAi ? "rgba(13,148,136,0.07)" : "linear-gradient(135deg,#0d9488,#059669)",
                      color: isAi ? "var(--ink-primary)" : "#fff",
                      fontSize: 13, lineHeight: 1.5,
                    }}>{msg.text}</div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--glass-border)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  value={draftMsg}
                  onChange={e => setDraftMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message and press Enter to send…"
                  style={{ flex: 1, background: "rgba(0,0,0,0.03)", border: "1px solid var(--glass-border)", borderRadius: 12, padding: "10px 16px", fontSize: 13, outline: "none", fontFamily: "var(--font-display)" }}
                />
                <button className="btn-primary" style={{ padding: "10px 16px" }} onClick={handleSend} disabled={sending || !draftMsg.trim()}>
                  {sending ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={15} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--ink-tertiary)", gap: 12, padding: 32 }}>
            <MessageCircle size={36} style={{ opacity: 0.2 }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Select a conversation</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Strategies Page ───────────────────────────────────────────────────────────

function StrategiesPage({ strategies, loading, onRefresh }: { strategies: Strategy[]; loading: boolean; onRefresh: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const statusMeta: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: { label: "Pending Review", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <Clock size={13} /> },
    approved: { label: "Approved", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: <CheckCircle size={13} /> },
    rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: <XCircle size={13} /> },
  };

  async function handleApprove(id: string) {
    setActing(id);
    try { await strategiesApi.approve(id); toast("Strategy approved!"); onRefresh(); }
    catch (e: any) { toast(e.message || "Failed", "error"); }
    finally { setActing(null); }
  }

  async function handleReject(id: string) {
    setActing(id);
    try { await strategiesApi.reject(id); toast("Strategy rejected.", "info"); onRefresh(); }
    catch (e: any) { toast(e.message || "Failed", "error"); }
    finally { setActing(null); }
  }

  if (loading) return <div className="glass-card"><Spinner /></div>;
  const pendingCount = strategies.filter(s => s.status === "pending").length;
  const approvedCount = strategies.filter(s => s.status === "approved").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="strategies-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "Pending Approval", value: pendingCount, icon: <Clock size={20} />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
          { label: "Approved", value: approvedCount, icon: <CheckCircle size={20} />, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
          { label: "Total Strategies", value: strategies.length, icon: <Brain size={20} />, color: "#0d9488", bg: "rgba(13,148,136,0.1)" },
        ].map((s, i) => (
          <div key={i} className="glass-card stat-card" style={{ flexDirection: "row", alignItems: "center", gap: 16, padding: "18px 22px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
            <div><div style={{ fontSize: 26, fontWeight: 800 }}>{s.value}</div><div style={{ fontSize: 13, color: "var(--ink-secondary)" }}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {strategies.length === 0 ? <div className="glass-card"><EmptyState icon={<Brain size={32} />} text="No strategies generated yet" /></div> :
        strategies.map(s => {
          const meta = statusMeta[s.status] || statusMeta.pending;
          const isOpen = expandedId === s.id;
          const isActing = acting === s.id;
          return (
            <div key={s.id} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="strategy-header-row"
                style={{ padding: "18px 24px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", flexWrap: "wrap" }}
                onClick={() => setExpandedId(isOpen ? null : s.id)}>
                <div className={`lead-avatar ${s.lead_avatar_color}`} style={{ width: 38, height: 38, fontSize: 13, flexShrink: 0 }}>
                  {s.lead_name.split(" ").map(n => n[0]).join("")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{s.lead_name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-secondary)" }}>Generated {s.created_at}</div>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 12, background: meta.bg, color: meta.color, fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
                  {meta.icon} {meta.label}
                </span>
                {s.status === "pending" && (
                  <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                    <button className="btn-primary" disabled={isActing}
                      style={{ padding: "6px 14px", fontSize: 12, gap: 5, background: "linear-gradient(135deg,#10b981,#059669)" }}
                      onClick={() => handleApprove(s.id)}>
                      {isActing ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <ThumbsUp size={13} />} Approve
                    </button>
                    <button className="btn-secondary" disabled={isActing}
                      style={{ padding: "6px 14px", fontSize: 12, gap: 5, color: "#ef4444", borderColor: "rgba(239,68,68,0.25)" }}
                      onClick={() => handleReject(s.id)}>
                      <ThumbsDown size={13} /> Reject
                    </button>
                  </div>
                )}
                {isOpen ? <ChevronDown size={18} color="var(--ink-tertiary)" /> : <ChevronRight size={18} color="var(--ink-tertiary)" />}
              </div>
              {isOpen && (
                <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--glass-border)" }}>
                  <p style={{ fontSize: 14, color: "var(--ink-secondary)", lineHeight: 1.6, margin: "16px 0" }}>{s.objective}</p>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Qualification Questions</div>
                  {(s.questions || []).map((q, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 14px", background: "rgba(0,0,0,0.02)", borderRadius: 10, marginBottom: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#0d9488,#059669)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1, fontSize: 13 }}>{q}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

// ─── Appointments Page ─────────────────────────────────────────────────────────

function AppointmentsPage({ appointments, leads, loading, onRefresh }: {
  appointments: Appointment[]; leads: Lead[]; loading: boolean; onRefresh: () => void;
}) {
  const [localAppts, setLocalAppts] = useState<Appointment[]>(appointments);
  const [showBook, setShowBook] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => { setLocalAppts(appointments); }, [appointments]);

  const statusMeta: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    confirmed: { label: "Confirmed", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: <CheckCircle size={12} /> },
    pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <Clock size={12} /> },
    completed: { label: "Completed", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: <Star size={12} /> },
    invited: { label: "Invited", color: "#0d9488", bg: "rgba(13,148,136,0.1)", icon: <Send size={12} /> },
    cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: <XCircle size={12} /> },
  };

  const typeIcon = (t: string) => {
    if (t === "Contract Signing") return <Edit3 size={14} color="#10b981" />;
    if (t === "Consultation") return <MessageCircle size={14} color="#10b981" />;
    if (t === "Investment Review") return <BarChart size={14} color="#f59e0b" />;
    if (t === "Open House") return <Building2 size={14} color="#0d9488" />;
    return <Home size={14} color="#0d9488" />;
  };

  async function handleCancel(id: string) {
    setCancelling(id);
    try {
      await appointmentsApi.cancel(id);
      setLocalAppts(prev => prev.map(a => a.id === id ? { ...a, status: "cancelled" } : a));
      toast("Appointment cancelled.", "info");
    } catch (err: any) {
      toast(err.message || "Failed to cancel", "error");
    } finally {
      setCancelling(null);
    }
  }

  if (loading) return <div className="glass-card"><Spinner /></div>;

  const confirmed = localAppts.filter(a => a.status === "confirmed").length;
  const pending = localAppts.filter(a => a.status === "pending").length;
  const completed = localAppts.filter(a => a.status === "completed").length;

  return (
    <>
      {showBook && <BookAppointmentModal leads={leads} onClose={() => setShowBook(false)} onBooked={() => { setShowBook(false); onRefresh(); }} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="appt-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Total", value: localAppts.length, icon: <Calendar size={18} />, color: "#0d9488", bg: "rgba(13,148,136,0.1)" },
            { label: "Confirmed", value: confirmed, icon: <CheckCircle size={18} />, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
            { label: "Pending", value: pending, icon: <Clock size={18} />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
            { label: "Completed", value: completed, icon: <Star size={18} />, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
          ].map((s, i) => (
            <div key={i} className="glass-card stat-card" style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: "16px 20px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
              <div><div style={{ fontSize: 24, fontWeight: 800 }}>{s.value}</div><div style={{ fontSize: 12, color: "var(--ink-secondary)" }}>{s.label}</div></div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: "14px 20px", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => setShowBook(true)}>
            <Plus size={15} /> Book Appointment
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {localAppts.length === 0 ? <div className="glass-card"><EmptyState icon={<Calendar size={32} />} text="No appointments scheduled" /></div> :
            localAppts.map(appt => {
              const sm = statusMeta[appt.status] ?? statusMeta.pending;
              const dateParts = appt.date.split(",")[0]?.split(" ") || [];
              const isCancelling = cancelling === appt.id;
              return (
                <div key={appt.id} className="glass-card" style={{ padding: "18px 24px", opacity: appt.status === "cancelled" ? 0.6 : 1, transition: "opacity 300ms" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ width: 56, textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, color: "#0d9488", letterSpacing: "0.06em" }}>{dateParts[0]}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: "-1px" }}>{dateParts[1]}</div>
                    </div>
                    <div style={{ width: 2, alignSelf: "stretch", background: "var(--glass-border)", borderRadius: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>{typeIcon(appt.appointment_type)}<span style={{ fontWeight: 700, fontSize: 15 }}>{appt.appointment_type}</span></div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-secondary)", marginBottom: 6 }}><Clock size={12} /> {appt.time} · {appt.duration}</div>
                        </div>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 12, background: sm.bg, color: sm.color, fontWeight: 600, fontSize: 12 }}>{sm.icon} {sm.label}</span>
                      </div>
                      <div style={{ display: "flex", gap: 20, fontSize: 12, color: "var(--ink-secondary)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div className={`lead-avatar ${appt.lead_avatar}`} style={{ width: 20, height: 20, fontSize: 9 }}>{appt.lead_name.split(" ").map(n => n[0]).join("")}</div>
                          {appt.lead_name}
                        </span>
                        {appt.property_address && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{appt.property_address}</span>}
                        {appt.agent && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={11} />{appt.agent}</span>}
                      </div>
                      {appt.notes && <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(0,0,0,0.025)", borderRadius: 8, fontSize: 12, color: "var(--ink-secondary)" }}>{appt.notes}</div>}
                    </div>
                    {appt.status !== "completed" && appt.status !== "cancelled" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <button className="btn-secondary" style={{ padding: "5px 12px", fontSize: 12, color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}
                          disabled={isCancelling} onClick={() => handleCancel(appt.id)}>
                          {isCancelling ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : "Cancel"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}

// ─── Analytics Page ────────────────────────────────────────────────────────────

function AnalyticsPage({ summary, weeklyData, funnelData, channelData }: {
  summary: AnalyticsSummary | null; weeklyData: WeeklyDataPoint[]; funnelData: FunnelDataPoint[]; channelData: ChannelDataPoint[];
}) {
  const maxWeekly = Math.max(...weeklyData.map(d => d.conversations), 1);
  const kpis = [
    { label: "Total Leads", value: summary?.total_leads.toLocaleString() || "—", trend: summary?.trends.total_leads || "…", icon: <Users size={20} />, color: "#0d9488", bg: "rgba(13,148,136,0.1)" },
    { label: "Qualified This Month", value: summary?.qualified_this_month.toLocaleString() || "—", trend: summary?.trends.qualified_this_month || "…", icon: <Target size={20} />, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Active Conversations", value: summary?.active_conversations.toLocaleString() || "—", trend: "+—", icon: <MessageCircle size={20} />, color: "#0d9488", bg: "rgba(13,148,136,0.1)" },
    { label: "Appointments Booked", value: summary?.appointments_booked.toLocaleString() || "—", trend: "+—", icon: <Calendar size={20} />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Deals Closed", value: funnelData.find(f => f.label === "Converted")?.value.toString() || "—", trend: "+—", icon: <Award size={20} />, color: "#0d9488", bg: "rgba(13,148,136,0.1)" },
    { label: "AI Accuracy", value: "94.2%", trend: "+1.8%", icon: <Brain size={20} />, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="analytics-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {kpis.map((k, i) => (
          <div key={i} className="glass-card interactive stat-card">
            <div className="stat-card-header">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, color: k.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{k.icon}</div>
              <span className="stat-card-trend up"><ArrowUpRight size={14} />{k.trend}</span>
            </div>
            <div className="stat-card-value">{k.value}</div>
            <div className="stat-card-label">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="analytics-charts-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        <div className="glass-card">
          <div className="card-header"><div><div className="card-title">Weekly Activity</div><div className="card-subtitle">Conversations vs Qualified vs Booked</div></div></div>
          <div className="chart-container" style={{ height: 180 }}>
            {weeklyData.map((d, i) => (
              <div className="chart-bar-group" key={i}>
                <div className="chart-bar primary" style={{ height: `${(d.conversations / maxWeekly) * 100}%` }} />
                <div className="chart-bar secondary" style={{ height: `${(d.qualified / maxWeekly) * 100}%` }} />
                <div className="chart-bar" style={{ height: `${(d.booked / maxWeekly) * 100}%`, background: "linear-gradient(180deg,#10b981,rgba(16,185,129,0.25))" }} />
                <span className="chart-bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card">
          <div className="card-header"><div><div className="card-title">Lead Sources</div><div className="card-subtitle">Distribution by channel</div></div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {channelData.map((ch, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{ch.label}</span>
                  <span style={{ color: "var(--ink-secondary)" }}>{ch.value} ({ch.pct}%)</span>
                </div>
                <div style={{ height: 8, background: "rgba(0,0,0,0.05)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${ch.pct}%`, background: ch.color, borderRadius: 4, transition: "width 600ms ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="glass-card">
          <div className="card-title" style={{ marginBottom: 16 }}>Conversion Funnel</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {funnelData.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "var(--ink-secondary)", width: 70, textAlign: "right", fontWeight: 500 }}>{item.label}</span>
                <div style={{ flex: 1, height: 26, background: "rgba(0,0,0,0.03)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(item.pct, 4)}%`, height: "100%", background: `linear-gradient(90deg,${item.color}CC,${item.color}66)`, borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{item.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card">
          <div className="card-title" style={{ marginBottom: 12 }}>Quick Stats</div>
          {[
            ["Total Leads", summary?.total_leads || 0],
            ["Qualified This Month", summary?.qualified_this_month || 0],
            ["Active Conversations", summary?.active_conversations || 0],
            ["Appointments Booked", summary?.appointments_booked || 0],
          ].map(([label, value]) => (
            <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--glass-border)", fontSize: 13 }}>
              <span style={{ color: "var(--ink-secondary)" }}>{label}</span>
              <span style={{ fontWeight: 700 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Page ─────────────────────────────────────────────────────────────

function SettingsPage() {
  const user = getUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(true);
  const [notifAppt, setNotifAppt] = useState(true);
  const [notifStrategy, setNotifStrategy] = useState(false);
  const [aiAutoApprove, setAiAutoApprove] = useState(false);
  const [aiVoice, setAiVoice] = useState(true);
  const [aiSentiment, setAiSentiment] = useState(true);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={15} /> },
    { id: "notifications", label: "Notifications", icon: <BellIcon size={15} /> },
    { id: "ai", label: "AI Settings", icon: <Brain size={15} /> },
    { id: "security", label: "Security", icon: <Shield size={15} /> },
  ];

  type ToggleProps = { label: string; desc: string; val: boolean; set: (v: boolean) => void };
  const Toggle = ({ label, desc, val, set }: ToggleProps) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--glass-border)" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--ink-secondary)", marginTop: 2 }}>{desc}</div>
      </div>
      <div onClick={() => { set(!val); toast(label + (val ? " disabled" : " enabled"), "info"); }}
        style={{ width: 44, height: 24, borderRadius: 12, cursor: "pointer", transition: "background 200ms", background: val ? "#0d9488" : "rgba(0,0,0,0.1)", position: "relative", flexShrink: 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: val ? 23 : 3, transition: "left 200ms ease", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
      </div>
    </div>
  );

  const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid var(--glass-border)", borderRadius: 10, fontSize: 14, background: "rgba(255,255,255,0.7)", color: "var(--ink-primary)", outline: "none", fontFamily: "var(--font-display)" };

  return (
    <div className="settings-layout" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <div className="settings-tab-nav glass-card" style={{ width: 220, flexShrink: 0, padding: "8px 0" }}>
        {tabs.map(t => (
          <div key={t.id} onClick={() => setActiveTab(t.id)} className={`nav-item ${activeTab === t.id ? "active" : ""}`} style={{ margin: "2px 8px", borderRadius: 10 }}>
            <span className="nav-item-icon">{t.icon}</span>{t.label}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {activeTab === "profile" && (
          <div className="glass-card">
            <div className="card-title" style={{ marginBottom: 24 }}>Profile Settings</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
              <div className="sidebar-user-avatar" style={{ width: 64, height: 64, fontSize: 20 }}>{user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "??"}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name || "User"}</div>
                <div style={{ fontSize: 13, color: "var(--ink-secondary)", marginBottom: 10 }}>{user?.role === "agency_admin" ? "Agency Admin" : user?.role}</div>
                <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 12 }}>Change Photo</button>
              </div>
            </div>
            <button className="btn-primary" onClick={() => toast("Profile saved successfully!")}>Save Changes</button>
          </div>
        )}
        {activeTab === "notifications" && (
          <div className="glass-card">
            <div className="card-title" style={{ marginBottom: 4 }}>Notification Preferences</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Choose how and when you receive alerts</div>
            <Toggle label="Email Notifications" desc="Receive lead updates, strategy alerts, and weekly reports" val={notifEmail} set={setNotifEmail} />
            <Toggle label="SMS Alerts" desc="Get instant SMS alerts for high-intent leads" val={notifSMS} set={setNotifSMS} />
            <Toggle label="Appointment Reminders" desc="24-hour and 1-hour reminders before appointments" val={notifAppt} set={setNotifAppt} />
            <Toggle label="Strategy Alerts" desc="Be notified when AI generates a new strategy" val={notifStrategy} set={setNotifStrategy} />
            <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => toast("Notification settings saved!")}>Save Preferences</button>
          </div>
        )}
        {activeTab === "ai" && (
          <div className="glass-card">
            <div className="card-title" style={{ marginBottom: 4 }}>AI Configuration</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Control how the AI operates and engages leads</div>
            <Toggle label="Auto-Approve Low-Risk Strategies" desc="Let AI auto-approve strategies with confidence above 85%" val={aiAutoApprove} set={setAiAutoApprove} />
            <Toggle label="AI Voice Calls" desc="Allow AI to initiate and conduct outbound voice calls" val={aiVoice} set={setAiVoice} />
            <Toggle label="Sentiment Analysis" desc="Analyse lead responses to detect emotion" val={aiSentiment} set={setAiSentiment} />
            <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => toast("AI settings saved!")}>Save AI Settings</button>
          </div>
        )}
        {activeTab === "security" && (
          <div className="glass-card">
            <div className="card-title" style={{ marginBottom: 4 }}>Security</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Manage your account security settings</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Current Password</label>
              <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••••••" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>New Password</label>
              <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••••••" style={inputStyle} />
            </div>
            <button className="btn-primary" onClick={() => {
              if (!currentPwd || !newPwd) { toast("Please fill in both fields", "error"); return; }
              if (newPwd.length < 6) { toast("Password must be at least 6 characters", "error"); return; }
              toast("Password updated successfully!");
              setCurrentPwd(""); setNewPwd("");
            }}>Update Password</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root Page ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showBookAppt, setShowBookAppt] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([]);
  const [monthlyData, setMonthlyData] = useState<WeeklyDataPoint[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelDataPoint[]>([]);
  const [channelData, setChannelData] = useState<ChannelDataPoint[]>([]);
  const [loading, setLoading] = useState({ leads: true, strategies: true, conversations: true, appointments: true, analytics: true });

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const fetchAll = useCallback(async () => {
    if (!authenticated) return;
    setLoading({ leads: true, strategies: true, conversations: true, appointments: true, analytics: true });
    const [l, s, c, a, sum, weekly, monthly, funnel, channels] = await Promise.allSettled([
      leadsApi.list(), strategiesApi.list(), conversationsApi.list(), appointmentsApi.list(),
      analyticsApi.summary(), analyticsApi.weekly(), analyticsApi.monthly(), analyticsApi.funnel(), analyticsApi.channels(),
    ]);
    if (l.status === "fulfilled") setLeads(l.value);
    if (s.status === "fulfilled") setStrategies(s.value);
    if (c.status === "fulfilled") setConversations(c.value);
    if (a.status === "fulfilled") setAppointments(a.value);
    if (sum.status === "fulfilled") setSummary(sum.value);
    if (weekly.status === "fulfilled") setWeeklyData(weekly.value);
    if (monthly.status === "fulfilled") setMonthlyData(monthly.value);
    if (funnel.status === "fulfilled") setFunnelData(funnel.value);
    if (channels.status === "fulfilled") setChannelData(channels.value);
    setLoading({ leads: false, strategies: false, conversations: false, appointments: false, analytics: false });
  }, [authenticated]);

  // eslint-disable-next-line
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCta = () => {
    if (activePage === "dashboard" || activePage === "leads") setShowAddLead(true);
    else if (activePage === "appointments") setShowBookAppt(true);
  };

  // When user clicks a recent lead from dashboard — navigate to leads page
  const handleLeadClick = (lead: Lead) => {
    setActivePage("leads");
    // A small delay so the leads page can mount before we try to select the lead
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("select-lead", { detail: lead.id }));
    }, 150);
  };

  const renderPage = () => {
    switch (activePage) {
      case "leads": return <LeadsPage leads={leads} loading={loading.leads} onRefresh={fetchAll} />;
      case "conversations": return <ConversationsPage conversations={conversations} loading={loading.conversations} onRefresh={fetchAll} />;
      case "strategies": return <StrategiesPage strategies={strategies} loading={loading.strategies} onRefresh={() => strategiesApi.list().then(setStrategies).catch(() => {})} />;
      case "appointments": return <AppointmentsPage appointments={appointments} leads={leads} loading={loading.appointments} onRefresh={fetchAll} />;
      case "analytics": return <AnalyticsPage summary={summary} weeklyData={weeklyData} funnelData={funnelData} channelData={channelData} />;
      case "settings": return <SettingsPage />;
      default: return <DashboardHome summary={summary} weeklyData={weeklyData} monthlyData={monthlyData} funnelData={funnelData} leads={leads} onLeadClick={handleLeadClick} />;
    }
  };

  return (
    <div className="app-layout">
      <ToastContainer />
      {!authenticated && <LoginModal onSuccess={() => setAuthenticated(true)} />}
      {showAddLead && <AddLeadModal onClose={() => setShowAddLead(false)} onAdded={fetchAll} />}
      {showBookAppt && <BookAppointmentModal leads={leads} onClose={() => setShowBookAppt(false)} onBooked={() => { setShowBookAppt(false); fetchAll(); }} />}
      <Sidebar activePage={activePage} setActivePage={setActivePage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="main-content">
        <TopBar activePage={activePage} onCta={handleCta} />
        {renderPage()}
      </main>
    </div>
  );
}
