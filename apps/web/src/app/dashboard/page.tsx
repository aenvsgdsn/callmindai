"use client";

import { useState } from "react";
import {
  Search, Bell, LayoutDashboard, Users, MessageCircle, Brain,
  Calendar, BarChart, Settings, ArrowUpRight, ArrowDownRight,
  ChevronRight, PanelLeftClose, PanelLeftOpen,
  Phone, Mail, MapPin, Clock, CheckCircle, XCircle, AlertTriangle,
  Star, Filter, Plus, Download, RefreshCw, Eye, Edit3, Trash2,
  ThumbsUp, ThumbsDown, Play, Pause, ChevronLeft, ChevronDown,
  User, Lock, Globe, Bell as BellIcon, Zap, Shield, CreditCard,
  TrendingUp, TrendingDown, Activity, Target, Award, Send,
  Building2, DollarSign, Home, PhoneCall, MessageSquare, 
  Bookmark, MoreHorizontal, Check, X
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════ */

/* ─── Leads ─── */
const allLeads = [
  { id: "1",  name: "Sarah Mitchell",    email: "sarah.m@luxerealty.com",    phone: "+1 (555) 204-1822", status: "qualified",      intent: 87, source: "Website",    avatarColor: "v", date: "Aug 22", location: "Beverly Hills, CA",  budget: "$1.2M–$1.8M",   interest: "3-bed luxury condo",    lastAction: "AI called – property match sent",      assignedTo: "Alex Johnson" },
  { id: "2",  name: "James Rodriguez",   email: "j.rodriguez@primeprop.co",  phone: "+1 (555) 310-9047", status: "engaging",       intent: 72, source: "CSV Import", avatarColor: "b", date: "Aug 21", location: "Malibu, CA",          budget: "$900K–$1.4M",   interest: "Beachfront property",   lastAction: "Follow-up email scheduled",            assignedTo: "Maria Lee"   },
  { id: "3",  name: "Emily Watson",      email: "e.watson@homeview.io",      phone: "+1 (555) 818-3391", status: "new",            intent: 45, source: "Referral",   avatarColor: "g", date: "Aug 21", location: "Pasadena, CA",        budget: "$600K–$900K",   interest: "Family home with yard", lastAction: "Intro message delivered",              assignedTo: "Unassigned"  },
  { id: "4",  name: "Marcus Chen",       email: "m.chen@eastgatere.com",     phone: "+1 (555) 626-5512", status: "reviewing",      intent: 63, source: "Website",    avatarColor: "a", date: "Aug 20", location: "Arcadia, CA",         budget: "$750K–$1.1M",   interest: "Investment property",   lastAction: "Strategy awaiting approval",           assignedTo: "Alex Johnson" },
  { id: "5",  name: "Olivia Taylor",     email: "o.taylor@greenfield.co",    phone: "+1 (555) 323-7714", status: "human-required", intent: 31, source: "Cold Call",  avatarColor: "r", date: "Aug 19", location: "Culver City, CA",     budget: "$450K–$700K",   interest: "Starter home",          lastAction: "Flagged for human follow-up",          assignedTo: "Maria Lee"   },
  { id: "6",  name: "Daniel Kim",        email: "d.kim@westview.io",         phone: "+1 (555) 213-0092", status: "qualified",      intent: 91, source: "Website",    avatarColor: "v", date: "Aug 19", location: "Santa Monica, CA",    budget: "$2.0M–$3.5M",   interest: "Penthouse or luxury villa", lastAction: "Appointment booked for Aug 28",     assignedTo: "Alex Johnson" },
  { id: "7",  name: "Priya Sharma",      email: "p.sharma@horizonhomes.co",  phone: "+1 (555) 408-1176", status: "engaging",       intent: 68, source: "Referral",   avatarColor: "g", date: "Aug 18", location: "Burbank, CA",         budget: "$550K–$800K",   interest: "2-bed with good schools", lastAction: "Property list sent via email",        assignedTo: "Maria Lee"   },
  { id: "8",  name: "Robert Nguyen",     email: "r.nguyen@capitalre.com",    phone: "+1 (555) 949-2230", status: "new",            intent: 38, source: "CSV Import", avatarColor: "b", date: "Aug 17", location: "Irvine, CA",          budget: "$700K–$1.0M",   interest: "New construction condo", lastAction: "Welcome message sent",               assignedTo: "Unassigned"  },
  { id: "9",  name: "Sofia Patel",       email: "s.patel@skylinere.com",     phone: "+1 (555) 702-8841", status: "converted",      intent: 96, source: "Website",    avatarColor: "a", date: "Aug 16", location: "Glendale, CA",        budget: "$850K–$1.2M",   interest: "Move-in ready family home", lastAction: "Contract signed – deal closed",     assignedTo: "Alex Johnson" },
  { id: "10", name: "Chris Wallace",     email: "c.wallace@premierprops.co", phone: "+1 (555) 510-3345", status: "human-required", intent: 22, source: "Cold Call",  avatarColor: "r", date: "Aug 15", location: "Oakland, CA",         budget: "$400K–$600K",   interest: "Affordable starter home", lastAction: "Needs manual outreach",              assignedTo: "Unassigned"  },
];

/* ─── Conversations ─── */
const conversations = [
  {
    id: "c1", leadName: "Sarah Mitchell", leadAvatar: "v", channel: "SMS",
    status: "active", lastMsg: "That sounds perfect! When can we schedule a viewing?",
    time: "2 min ago", msgs: 14, sentiment: "positive", aiHandled: true,
    messages: [
      { from: "ai",   text: "Hi Sarah! I'm CallMind, your AI property advisor. I noticed you enquired about luxury condos in Beverly Hills. Can you tell me more about your ideal property?" },
      { from: "lead", text: "Yes! I'm looking for a 3-bedroom with ocean views, ideally under $1.5M." },
      { from: "ai",   text: "Great! I've found 4 properties matching your criteria. They range from $1.1M–$1.45M. Shall I send you the full details?" },
      { from: "lead", text: "Absolutely, please send them over." },
      { from: "ai",   text: "Sent! I've emailed you a curated list with photos and virtual tours. Which property caught your eye most?" },
      { from: "lead", text: "The one on Wilshire looks stunning. Do you have more details?" },
      { from: "ai",   text: "Of course! 421 Wilshire Blvd #18 is a 3-bed/2-bath, 1,850sqft unit with panoramic ocean views. It was listed 3 days ago and has already had 6 showings." },
      { from: "lead", text: "That sounds perfect! When can we schedule a viewing?" },
    ],
  },
  {
    id: "c2", leadName: "James Rodriguez", leadAvatar: "b", channel: "Email",
    status: "waiting", lastMsg: "I'll need to discuss with my partner first.",
    time: "1 hr ago", msgs: 9, sentiment: "neutral", aiHandled: true,
    messages: [
      { from: "ai",   text: "Hi James! Following up on your interest in beachfront properties in Malibu. We have 3 new listings you may love." },
      { from: "lead", text: "Sounds interesting. What's the price range?" },
      { from: "ai",   text: "They range from $1.1M–$1.35M. All have private beach access and were updated within the last 2 years." },
      { from: "lead", text: "I'll need to discuss with my partner first." },
    ],
  },
  {
    id: "c3", leadName: "Daniel Kim", leadAvatar: "v", channel: "Voice",
    status: "completed", lastMsg: "Perfect, I'll see you on the 28th at 2 PM.",
    time: "3 hrs ago", msgs: 21, sentiment: "positive", aiHandled: false,
    messages: [
      { from: "ai",   text: "Hi Daniel! I'm reaching out about luxury properties in Santa Monica. Your search criteria indicate you're looking for something truly special." },
      { from: "lead", text: "Yes, I want a penthouse or something very exclusive. Budget isn't really a concern." },
      { from: "ai",   text: "Wonderful! I have two exceptional properties — one is a 4,200sqft penthouse with private rooftop terrace, and another is a 5-bed oceanfront villa." },
      { from: "lead", text: "The penthouse sounds incredible. Can we do a viewing?" },
      { from: "ai",   text: "Absolutely! Alex Johnson, our senior agent, will personally show you the property. Does August 28th at 2 PM work for you?" },
      { from: "lead", text: "Perfect, I'll see you on the 28th at 2 PM." },
    ],
  },
  {
    id: "c4", leadName: "Olivia Taylor", leadAvatar: "r", channel: "SMS",
    status: "human-required", lastMsg: "I'm not sure this AI thing is right for me...",
    time: "5 hrs ago", msgs: 5, sentiment: "negative", aiHandled: true,
    messages: [
      { from: "ai",   text: "Hi Olivia! I'm reaching out about starter homes in Culver City." },
      { from: "lead", text: "How did you get my number?" },
      { from: "ai",   text: "You filled out a form on our website last week. I'm here to help you find your perfect home!" },
      { from: "lead", text: "I'm not sure this AI thing is right for me..." },
    ],
  },
  {
    id: "c5", leadName: "Priya Sharma", leadAvatar: "g", channel: "Email",
    status: "active", lastMsg: "Yes, the Burbank property near Jefferson Elementary looks ideal.",
    time: "30 min ago", msgs: 11, sentiment: "positive", aiHandled: true,
    messages: [
      { from: "ai",   text: "Hi Priya! You mentioned school districts are important. I've shortlisted 3 properties near top-rated elementary schools in Burbank." },
      { from: "lead", text: "That's exactly what I need! Can you share the details?" },
      { from: "ai",   text: "Of course! I've sent the full details to your email. The Jefferson School district properties are particularly strong." },
      { from: "lead", text: "Yes, the Burbank property near Jefferson Elementary looks ideal." },
    ],
  },
];

/* ─── Strategies ─── */
const strategies = [
  {
    id: "s1", leadName: "Emily Watson", leadAvatar: "g", status: "pending",
    createdAt: "Aug 21, 9:14 AM", intent: 45,
    summary: "Emily is a first-time buyer looking for a family home with a backyard in Pasadena. Budget is moderate. Recommend a nurturing approach focused on education and trust-building before hard property recommendations.",
    steps: [
      { step: 1, action: "Send welcome email with Pasadena neighbourhood guide", channel: "Email", timing: "Immediately" },
      { step: 2, action: "Follow-up SMS asking about school district preferences", channel: "SMS",   timing: "Day 2" },
      { step: 3, action: "Share 3 curated listings under $850K with virtual tours",  channel: "Email", timing: "Day 3" },
      { step: 4, action: "Invite to weekend open house event",                        channel: "SMS",   timing: "Day 5" },
    ],
    riskFlags: ["First-time buyer — needs extra guidance", "Budget may limit Beverly Hills area"],
    confidence: 78,
  },
  {
    id: "s2", leadName: "Marcus Chen", leadAvatar: "a", status: "pending",
    createdAt: "Aug 20, 3:42 PM", intent: 63,
    summary: "Marcus is an experienced investor looking for rental income properties in the $750K–$1.1M range. Arcadia market is competitive. Strategy should focus on ROI, cap rates, and long-term appreciation data.",
    steps: [
      { step: 1, action: "Send investment property analysis report for Arcadia",    channel: "Email", timing: "Immediately" },
      { step: 2, action: "Call to discuss cap rate expectations and ROI targets",   channel: "Voice", timing: "Day 1" },
      { step: 3, action: "Present 2 off-market investment opportunities",           channel: "Email", timing: "Day 3" },
      { step: 4, action: "Schedule property walkthrough with investment specialist",channel: "Calendar", timing: "Day 5" },
    ],
    riskFlags: ["High negotiation risk — price sensitive", "Competing with 2 other agencies"],
    confidence: 84,
  },
  {
    id: "s3", leadName: "Robert Nguyen", leadAvatar: "b", status: "approved",
    createdAt: "Aug 17, 11:05 AM", intent: 38,
    summary: "Robert is interested in new construction condos in Irvine. Early stage buyer — needs education about the new construction process, timelines, and financing options before moving to property recommendations.",
    steps: [
      { step: 1, action: "Send new construction buyer's guide",                     channel: "Email", timing: "Immediately" },
      { step: 2, action: "Schedule 15-min intro call to understand timeline",       channel: "Voice", timing: "Day 2" },
      { step: 3, action: "Share upcoming Irvine development project brochures",     channel: "Email", timing: "Day 4" },
      { step: 4, action: "Connect with preferred lender for pre-approval guidance", channel: "Email", timing: "Day 6" },
    ],
    riskFlags: ["Low urgency — may take 6–12 months to buy"],
    confidence: 61,
  },
  {
    id: "s4", leadName: "Chris Wallace", leadAvatar: "r", status: "rejected",
    createdAt: "Aug 15, 8:30 AM", intent: 22,
    summary: "Chris was reached via cold call. Low engagement score. Strategy was to send affordable listings in Oakland but lead showed minimal interest. Recommend human agent follow-up instead.",
    steps: [
      { step: 1, action: "Send affordable listings under $550K", channel: "SMS",   timing: "Immediately" },
      { step: 2, action: "Follow-up call after 48 hours",        channel: "Voice", timing: "Day 2" },
    ],
    riskFlags: ["Very low intent score", "Cold contact — no prior relationship", "May not be decision-ready"],
    confidence: 35,
  },
];

/* ─── Appointments ─── */
const appointments = [
  { id: "a1", leadName: "Daniel Kim",    leadAvatar: "v", date: "Aug 28, 2026", time: "2:00 PM", duration: "60 min", type: "Property Viewing",  property: "421 Ocean Ave Penthouse, Santa Monica", agent: "Alex Johnson",   status: "confirmed",  notes: "Client is VIP — bring premium brochure. Interested in rooftop access." },
  { id: "a2", leadName: "Sarah Mitchell",leadAvatar: "v", date: "Aug 29, 2026", time: "10:30 AM",duration: "45 min", type: "Property Viewing",  property: "421 Wilshire Blvd #18, Beverly Hills",  agent: "Alex Johnson",   status: "confirmed",  notes: "Prefers morning appointments. Has 2 kids so family-friendly features matter." },
  { id: "a3", leadName: "Sofia Patel",   leadAvatar: "a", date: "Aug 26, 2026", time: "3:00 PM", duration: "30 min", type: "Contract Signing", property: "88 Maple Drive, Glendale",              agent: "Alex Johnson",   status: "completed",  notes: "Contract signed. Commission: $21,250." },
  { id: "a4", leadName: "James Rodriguez",leadAvatar:"b", date: "Sep 02, 2026", time: "11:00 AM",duration: "60 min", type: "Property Viewing",  property: "Zuma Beach Estates, Malibu",            agent: "Maria Lee",      status: "pending",    notes: "Partner Maya will also attend. Bring beach access documentation." },
  { id: "a5", leadName: "Priya Sharma",  leadAvatar: "g", date: "Sep 03, 2026", time: "9:00 AM", duration: "45 min", type: "Consultation",     property: "Office — 1800 Century Park E.",         agent: "Maria Lee",      status: "confirmed",  notes: "First meeting. Focus on school district options and financing." },
  { id: "a6", leadName: "Marcus Chen",   leadAvatar: "a", date: "Sep 05, 2026", time: "1:00 PM", duration: "60 min", type: "Investment Review",property: "3 Investment Properties, Arcadia",       agent: "Alex Johnson",   status: "pending",    notes: "Prepare ROI analysis and rental income projections." },
  { id: "a7", leadName: "Emily Watson",  leadAvatar: "g", date: "Sep 08, 2026", time: "11:30 AM",duration: "45 min", type: "Open House",       property: "TBD — Pasadena Weekend Open House",     agent: "Maria Lee",      status: "invited",    notes: "Group open house event. 8 families expected." },
];

/* ─── Analytics Data ─── */
const weeklyData = [
  { label: "Mon", conversations: 65, qualified: 42, booked: 12 },
  { label: "Tue", conversations: 78, qualified: 55, booked: 18 },
  { label: "Wed", conversations: 52, qualified: 38, booked:  9 },
  { label: "Thu", conversations: 90, qualified: 68, booked: 22 },
  { label: "Fri", conversations: 84, qualified: 72, booked: 20 },
  { label: "Sat", conversations: 45, qualified: 30, booked:  7 },
  { label: "Sun", conversations: 38, qualified: 22, booked:  5 },
];

const monthlyTrend = [
  { label: "Mar", revenue: 84,  leads: 210 },
  { label: "Apr", revenue: 97,  leads: 248 },
  { label: "May", revenue: 112, leads: 290 },
  { label: "Jun", revenue: 89,  leads: 225 },
  { label: "Jul", revenue: 134, leads: 318 },
  { label: "Aug", revenue: 158, leads: 374 },
];

const funnelData = [
  { label: "New Leads",  value: 374, color: "#8B5CF6", pct: 100 },
  { label: "Engaging",   value: 281, color: "#0EA5E9", pct: 75  },
  { label: "Qualified",  value: 186, color: "#10B981", pct: 50  },
  { label: "Booked",     value: 89,  color: "#F59E0B", pct: 24  },
  { label: "Converted",  value: 52,  color: "#7C3AED", pct: 14  },
];

const channelData = [
  { label: "Website",    value: 142, pct: 38, color: "#7c3aed" },
  { label: "Referral",   value:  94, pct: 25, color: "#0ea5e9" },
  { label: "CSV Import", value:  82, pct: 22, color: "#10b981" },
  { label: "Cold Call",  value:  56, pct: 15, color: "#f59e0b" },
];

const topAgents = [
  { name: "Alex Johnson", deals: 14, revenue: "$284K", conv: "68%", avatar: "AJ", color: "v" },
  { name: "Maria Lee",    deals:  9, revenue: "$162K", conv: "54%", avatar: "ML", color: "b" },
  { name: "Sam Park",     deals:  6, revenue: "$98K",  conv: "47%", avatar: "SP", color: "g" },
];

/* ═══════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════ */
function Sidebar({
  activePage, setActivePage, collapsed, setCollapsed,
}: {
  activePage: string;
  setActivePage: (p: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const mainNav = [
    { id: "dashboard",     icon: <LayoutDashboard size={18} />, label: "Dashboard"     },
    { id: "leads",         icon: <Users           size={18} />, label: "Leads"         },
    { id: "conversations", icon: <MessageCircle   size={18} />, label: "Conversations" },
    { id: "strategies",    icon: <Brain           size={18} />, label: "Strategies"    },
  ];
  const secondaryNav = [
    { id: "appointments", icon: <Calendar size={18} />, label: "Appointments" },
    { id: "analytics",    icon: <BarChart  size={18} />, label: "Analytics"    },
    { id: "settings",     icon: <Settings  size={18} />, label: "Settings"     },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">C</div>
            <span className="sidebar-logo-text">CallMind</span>
          </div>
        )}
        {collapsed && <div className="sidebar-logo-icon" style={{ margin: "0 auto" }}>C</div>}
        <button className="sidebar-toggle-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-label">Main</div>}
        {mainNav.map((item) => (
          <div key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""} ${collapsed ? "nav-item-icon-only" : ""}`} onClick={() => setActivePage(item.id)} title={collapsed ? item.label : undefined}>
            <span className="nav-item-icon">{item.icon}</span>
            {!collapsed && item.label}
          </div>
        ))}

        {!collapsed && <div className="nav-section-label">Manage</div>}
        {collapsed && <div style={{ height: 16 }} />}
        {secondaryNav.map((item) => (
          <div key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""} ${collapsed ? "nav-item-icon-only" : ""}`} onClick={() => setActivePage(item.id)} title={collapsed ? item.label : undefined}>
            <span className="nav-item-icon">{item.icon}</span>
            {!collapsed && item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className={`sidebar-user ${collapsed ? "sidebar-user-collapsed" : ""}`}>
          <div className="sidebar-user-avatar">AJ</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Alex Johnson</div>
              <div className="sidebar-user-role">Agency Admin</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════
   TOPBAR
═══════════════════════════════════════════════════════ */
const pageMeta: Record<string, { title: string; subtitle: string; cta?: string }> = {
  dashboard:     { title: "Dashboard",     subtitle: "Welcome back — here's what's happening today.",        cta: "+ New Lead"        },
  leads:         { title: "Leads",         subtitle: "Manage and track all your real estate leads.",         cta: "+ Add Lead"        },
  conversations: { title: "Conversations", subtitle: "AI-managed outreach threads across all channels.",     cta: "+ New Conversation" },
  strategies:    { title: "Strategies",    subtitle: "AI-generated engagement plans awaiting your review.",  cta: "+ New Strategy"    },
  appointments:  { title: "Appointments",  subtitle: "Scheduled viewings, consultations, and signings.",     cta: "+ Book Appointment" },
  analytics:     { title: "Analytics",     subtitle: "Performance insights and conversion metrics.",          cta: "↓ Export Report"   },
  settings:      { title: "Settings",      subtitle: "Configure your agency, integrations, and preferences." },
};

function TopBar({ activePage }: { activePage: string }) {
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
        {meta.cta && <button className="btn-primary">{meta.cta}</button>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD HOME
═══════════════════════════════════════════════════════ */
function StatCards() {
  const stats = [
    { icon: <Users         size={22} />, iconClass: "violet", value: "1,284", label: "Total Leads",           trend: "+12.5%", trendDir: "up"   },
    { icon: <MessageCircle size={22} />, iconClass: "blue",   value: "847",   label: "Active Conversations",  trend: "+8.2%",  trendDir: "up"   },
    { icon: <Brain         size={22} />, iconClass: "green",  value: "342",   label: "Qualified This Month",  trend: "+23.1%", trendDir: "up"   },
    { icon: <Calendar      size={22} />, iconClass: "amber",  value: "67",    label: "Appointments Booked",   trend: "-3.4%",  trendDir: "down" },
  ];
  return (
    <div className="stats-grid">
      {stats.map((s, i) => (
        <div key={i} className="glass-card interactive stat-card">
          <div className="stat-card-header">
            <div className={`stat-card-icon ${s.iconClass}`}>{s.icon}</div>
            <span className={`stat-card-trend ${s.trendDir}`}>
              {s.trendDir === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {s.trend}
            </span>
          </div>
          <div className="stat-card-value">{s.value}</div>
          <div className="stat-card-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function BarChartCard() {
  const maxVal = Math.max(...weeklyData.map((d) => d.conversations));
  return (
    <div className="glass-card" style={{ animation: "fadeInUp 500ms ease-out 200ms both" }}>
      <div className="card-header">
        <div>
          <div className="card-title">Lead Engagement</div>
          <div className="card-subtitle">Weekly conversations vs qualifications</div>
        </div>
        <div className="card-actions">
          <button className="filter-chip active">Week</button>
          <button className="filter-chip">Month</button>
        </div>
      </div>
      <div className="chart-container">
        {weeklyData.map((d, i) => (
          <div className="chart-bar-group" key={i}>
            <div className="chart-bar primary" style={{ height: `${(d.conversations / maxVal) * 100}%` }} title={`Conv: ${d.conversations}`} />
            <div className="chart-bar secondary" style={{ height: `${(d.qualified / maxVal) * 100}%` }} title={`Qual: ${d.qualified}`} />
            <span className="chart-bar-label">{d.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: 16, justifyContent: "center" }}>
        {[["Conversations", "#7c3aed"], ["Qualified", "#0ea5e9"]].map(([label, color]) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-secondary)" }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function FunnelChartCard() {
  return (
    <div className="glass-card" style={{ animation: "fadeInUp 500ms ease-out 300ms both" }}>
      <div className="card-header">
        <div>
          <div className="card-title">Conversion Funnel</div>
          <div className="card-subtitle">Lead lifecycle progression</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {funnelData.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "var(--ink-secondary)", width: 80, textAlign: "right", fontWeight: 500 }}>{item.label}</span>
            <div style={{ flex: 1, height: 32, background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ width: `${item.pct}%`, height: "100%", background: `linear-gradient(90deg, ${item.color}CC, ${item.color}88)`, borderRadius: 8, display: "flex", alignItems: "center", paddingLeft: 12, transition: "width 800ms cubic-bezier(0.4,0,0.2,1)" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentLeadsTable() {
  const getLabel = (s: string) => s === "human-required" ? "Review" : s.charAt(0).toUpperCase() + s.slice(1);
  const getIntentClass = (v: number) => v >= 70 ? "high" : v >= 40 ? "medium" : "low";
  return (
    <div className="glass-card" style={{ animation: "fadeInUp 500ms ease-out 400ms both" }}>
      <div className="card-header">
        <div>
          <div className="card-title">Recent Leads</div>
          <div className="card-subtitle">Latest leads across all sources</div>
        </div>
        <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          View All <ChevronRight size={14} />
        </button>
      </div>
      {/* Scrollable on mobile */}
      <div className="table-scroll-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lead</th><th>Status</th><th>Intent Score</th><th>Source</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {allLeads.slice(0, 5).map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div className="lead-info">
                    <div className={`lead-avatar ${lead.avatarColor}`}>{lead.name.split(" ").map((n) => n[0]).join("")}</div>
                    <div>
                      <div className="lead-name">{lead.name}</div>
                      <div className="lead-email">{lead.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${lead.status}`}>
                    <span className="status-dot" />
                    {getLabel(lead.status)}
                  </span>
                </td>
                <td>
                  <div className="intent-score">
                    <div className="intent-bar-bg">
                      <div className={`intent-bar-fill ${getIntentClass(lead.intent)}`} style={{ width: `${lead.intent}%` }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)" }}>{lead.intent}%</span>
                  </div>
                </td>
                <td style={{ fontSize: 13, color: "var(--ink-secondary)" }}>{lead.source}</td>
                <td style={{ fontSize: 13, color: "var(--ink-secondary)" }}>{lead.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DashboardHome() {
  return (
    <>
      <StatCards />
      <div className="content-grid">
        <BarChartCard />
        <FunnelChartCard />
      </div>
      <RecentLeadsTable />
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   LEADS PAGE
═══════════════════════════════════════════════════════ */
function LeadsPage() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const statuses = ["all", "new", "engaging", "qualified", "reviewing", "human-required", "converted"];
  const filtered = filter === "all" ? allLeads : allLeads.filter((l) => l.status === filter);
  const selectedLead = allLeads.find((l) => l.id === selected);

  const getLabel = (s: string) => s === "human-required" ? "Review" : s.charAt(0).toUpperCase() + s.slice(1);
  const getIntentClass = (v: number) => v >= 70 ? "high" : v >= 40 ? "medium" : "low";

  return (
    <div className="leads-layout" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* Left: table */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Filter chips */}
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <div className="filter-chips-row" style={{ display: "flex", gap: 8, flexWrap: "nowrap", alignItems: "center" }}>
            <Filter size={15} color="var(--ink-tertiary)" />
            {statuses.map((s) => (
              <button key={s} className={`filter-chip ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
                {s === "all" ? "All Leads" : getLabel(s)}
                <span style={{ marginLeft: 6, opacity: 0.7, fontSize: 11 }}>
                  {s === "all" ? allLeads.length : allLeads.filter((l) => l.status === s).length}
                </span>
              </button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 13, gap: 6 }}>
                <Download size={14} /> Export
              </button>
              <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 13, gap: 6 }}>
                <RefreshCw size={14} /> Sync
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-scroll-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ padding: "14px 20px" }}>Lead</th>
                <th>Status</th>
                <th>Intent</th>
                <th>Source</th>
                <th>Location</th>
                <th>Assigned To</th>
                <th>Date</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  style={{ cursor: "pointer", background: selected === lead.id ? "rgba(124,58,237,0.04)" : undefined }}
                  onClick={() => setSelected(selected === lead.id ? null : lead.id)}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <div className="lead-info">
                      <div className={`lead-avatar ${lead.avatarColor}`}>{lead.name.split(" ").map((n) => n[0]).join("")}</div>
                      <div>
                        <div className="lead-name">{lead.name}</div>
                        <div className="lead-email">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${lead.status}`}>
                      <span className="status-dot" />
                      {getLabel(lead.status)}
                    </span>
                  </td>
                  <td>
                    <div className="intent-score">
                      <div className="intent-bar-bg">
                        <div className={`intent-bar-fill ${getIntentClass(lead.intent)}`} style={{ width: `${lead.intent}%` }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)", width: 30 }}>{lead.intent}%</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: "var(--ink-secondary)" }}>{lead.source}</td>
                  <td style={{ fontSize: 13, color: "var(--ink-secondary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{lead.location}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 12, background: lead.assignedTo === "Unassigned" ? "rgba(156,163,175,0.1)" : "rgba(124,58,237,0.08)", color: lead.assignedTo === "Unassigned" ? "var(--ink-tertiary)" : "#7c3aed", fontWeight: 600 }}>
                      {lead.assignedTo}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: "var(--ink-secondary)" }}>{lead.date}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                      <button className="icon-btn" style={{ width: 30, height: 30 }} title="View" onClick={(e) => { e.stopPropagation(); setSelected(lead.id); }}>
                        <Eye size={13} />
                      </button>
                      <button className="icon-btn" style={{ width: 30, height: 30 }} title="Edit">
                        <Edit3 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {selectedLead && (
        <>
        <div className="mobile-backdrop" onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 399, display: "none" }} />
        <div className="lead-detail-panel glass-card" style={{ width: 320, flexShrink: 0, animation: "fadeInUp 300ms ease-out both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div className="card-title">Lead Detail</div>
            <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setSelected(null)}><X size={14} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20, gap: 8 }}>
            <div className={`lead-avatar ${selectedLead.avatarColor}`} style={{ width: 56, height: 56, fontSize: 18 }}>
              {selectedLead.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, textAlign: "center" }}>{selectedLead.name}</div>
            <span className={`status-badge ${selectedLead.status}`}>
              <span className="status-dot" />
              {selectedLead.status === "human-required" ? "Review" : selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
            </span>
          </div>

          {[
            { icon: <Mail size={13} />,      label: selectedLead.email       },
            { icon: <Phone size={13} />,     label: selectedLead.phone       },
            { icon: <MapPin size={13} />,    label: selectedLead.location    },
            { icon: <DollarSign size={13} />,label: selectedLead.budget      },
            { icon: <Home size={13} />,      label: selectedLead.interest    },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--glass-border)", fontSize: 13, color: "var(--ink-secondary)" }}>
              <span style={{ color: "#7c3aed" }}>{row.icon}</span> {row.label}
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-tertiary)", marginBottom: 8 }}>Intent Score</div>
            <div className="intent-score">
              <div className="intent-bar-bg" style={{ flex: 1 }}>
                <div className={`intent-bar-fill ${getIntentClass(selectedLead.intent)}`} style={{ width: `${selectedLead.intent}%` }} />
              </div>
              <strong style={{ fontSize: 14 }}>{selectedLead.intent}%</strong>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: 12, background: "rgba(124,58,237,0.04)", borderRadius: 10, fontSize: 12, color: "var(--ink-secondary)" }}>
            <div style={{ fontWeight: 700, marginBottom: 4, color: "var(--ink-primary)", fontSize: 12 }}>Last Activity</div>
            {selectedLead.lastAction}
          </div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              <MessageCircle size={14} /> Start Conversation
            </button>
            <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
              <Calendar size={14} /> Book Appointment
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

function ConversationsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  // On desktop always show conversations[0]; on mobile only when chat is open
  const activeConv = selected
    ? conversations.find((c) => c.id === selected)
    : mobileChatOpen ? undefined : undefined;

  const channelIcon = (ch: string) => {
    if (ch === "SMS")   return <MessageSquare size={12} />;
    if (ch === "Voice") return <PhoneCall size={12} />;
    return <Mail size={12} />;
  };

  const sentimentColor = (s: string) => s === "positive" ? "#10b981" : s === "negative" ? "#ef4444" : "#f59e0b";

  const handleSelectConv = (id: string) => {
    setSelected(id);
    setMobileChatOpen(true);
  };

  return (
    <div className="conv-layout" style={{ display: "flex", gap: 0, height: "calc(100vh - 200px)", minHeight: 500, borderRadius: 24, overflow: "hidden", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}>
      {/* List panel — hidden on mobile when chat is open (class-based, CSS handles visibility) */}
      <div
        className={`conv-list-panel${mobileChatOpen ? " conv-list-hidden" : ""}`}
        style={{
          width: 300, flexShrink: 0, borderRight: "1px solid var(--glass-border)",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--glass-border)" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>All Threads</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["All", "Active", "Waiting", "Completed"].map((f) => (
              <button key={f} className="filter-chip" style={{ fontSize: 11, padding: "3px 10px" }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => handleSelectConv(c.id)}
              style={{
                padding: "14px 16px", cursor: "pointer", transition: "background 150ms",
                background: selected === c.id ? "rgba(124,58,237,0.06)" : "transparent",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
                borderLeft: selected === c.id ? "3px solid #7c3aed" : "3px solid transparent",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className={`lead-avatar ${c.leadAvatar}`} style={{ width: 30, height: 30, fontSize: 11 }}>
                    {c.leadName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.leadName}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ink-tertiary)" }}>
                      {channelIcon(c.channel)} {c.channel}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 10, color: "var(--ink-tertiary)" }}>{c.time}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--ink-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginLeft: 38 }}>
                {c.lastMsg}
              </p>
              <div style={{ display: "flex", gap: 6, marginLeft: 38, marginTop: 6 }}>
                <span className={`status-badge ${c.status}`} style={{ fontSize: 10, padding: "2px 8px" }}>
                  <span className="status-dot" />
                  {c.status === "human-required" ? "Action Needed" : c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: `${sentimentColor(c.sentiment)}18`, color: sentimentColor(c.sentiment), fontWeight: 600 }}>
                  {c.sentiment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat panel — only shown on mobile when mobileChatOpen, always on desktop */}
      <div
        className={`conv-chat-panel${!mobileChatOpen ? " conv-chat-hidden" : ""}`}
        style={{
          flex: 1, flexDirection: "column", minWidth: 0,
        }}
      >
        {(selected && conversations.find((c) => c.id === selected)) ? (() => { const activeConv = conversations.find((c) => c.id === selected)!; return (
          <>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              {/* Back button — CSS shows it only on mobile */}
              <button
                onClick={() => { setMobileChatOpen(false); setSelected(null); }}
                className="mobile-back-btn"
                style={{ alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontWeight: 700, fontSize: 14, padding: 0, flexShrink: 0 }}
              >
                <ChevronLeft size={18} /> Back
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className={`lead-avatar ${activeConv.leadAvatar}`} style={{ width: 36, height: 36, fontSize: 13 }}>
                  {activeConv.leadName.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{activeConv.leadName}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-secondary)", display: "flex", gap: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>{channelIcon(activeConv.channel)} {activeConv.channel}</span>
                    <span>· {activeConv.msgs} messages</span>
                    <span>· {activeConv.aiHandled ? "🤖 AI handled" : "👤 Human agent"}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 12, gap: 5 }}>
                  <User size={13} /> Take Over
                </button>
                <button className="btn-primary" style={{ padding: "6px 14px", fontSize: 12, gap: 5 }}>
                  <Calendar size={13} /> Book Appt
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {activeConv.messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", flexDirection: msg.from === "ai" ? "row" : "row-reverse", gap: 10, alignItems: "flex-end" }}>
                  {msg.from === "ai" && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #9333ea)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Brain size={13} color="#fff" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: "68%", padding: "10px 14px", borderRadius: msg.from === "ai" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                    background: msg.from === "ai" ? "rgba(124,58,237,0.07)" : "linear-gradient(135deg, #7c3aed, #9333ea)",
                    color: msg.from === "ai" ? "var(--ink-primary)" : "#fff",
                    fontSize: 13, lineHeight: 1.5,
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--glass-border)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ flex: 1, background: "rgba(0,0,0,0.03)", border: "1px solid var(--glass-border)", borderRadius: 12, padding: "10px 16px", fontSize: 13, color: "var(--ink-tertiary)" }}>
                  Type a message or let AI continue…
                </div>
                <button className="btn-primary" style={{ padding: "10px 16px" }}><Send size={15} /></button>
              </div>
            </div>
          </>
        ); })() : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--ink-tertiary)", gap: 12, padding: 32 }}>
            <MessageCircle size={36} style={{ opacity: 0.2 }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Select a conversation</span>
            <span style={{ fontSize: 12, textAlign: "center", lineHeight: 1.5 }}>Choose a thread from the list to view the full conversation</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STRATEGIES PAGE
═══════════════════════════════════════════════════════ */
function StrategiesPage() {
  const [expandedId, setExpandedId] = useState<string | null>("s1");

  const statusMeta: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending:  { label: "Pending Review",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: <Clock      size={13} /> },
    approved: { label: "Approved",        color: "#10b981", bg: "rgba(16,185,129,0.1)",   icon: <CheckCircle size={13} /> },
    rejected: { label: "Rejected",        color: "#ef4444", bg: "rgba(239,68,68,0.1)",    icon: <XCircle    size={13} /> },
  };

  const pendingCount = strategies.filter((s) => s.status === "pending").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary bar */}
      <div className="strategies-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "Pending Approval", value: pendingCount, icon: <Clock size={20} />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
          { label: "Approved Today",   value: 1,             icon: <CheckCircle size={20} />, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
          { label: "Total Strategies", value: strategies.length, icon: <Brain size={20} />, color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
        ].map((s, i) => (
          <div key={i} className="glass-card stat-card" style={{ flexDirection: "row", alignItems: "center", gap: 16, padding: "18px 22px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "var(--ink-secondary)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategies list */}
      {strategies.map((s) => {
        const meta = statusMeta[s.status];
        const isOpen = expandedId === s.id;
        return (
          <div key={s.id} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Header row */}
            <div
              style={{ padding: "18px 24px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
              onClick={() => setExpandedId(isOpen ? null : s.id)}
            >
              <div className={`lead-avatar ${s.leadAvatar}`} style={{ width: 38, height: 38, fontSize: 13, flexShrink: 0 }}>
                {s.leadName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.leadName}</div>
                <div style={{ fontSize: 12, color: "var(--ink-secondary)" }}>Generated {s.createdAt} · Intent: {s.intent}% · Confidence: {s.confidence}%</div>
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 12, background: meta.bg, color: meta.color, fontWeight: 600, fontSize: 12 }}>
                {meta.icon} {meta.label}
              </span>
              {s.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                  <button className="btn-primary" style={{ padding: "6px 14px", fontSize: 12, gap: 5, background: "linear-gradient(135deg,#10b981,#059669)" }}>
                    <ThumbsUp size={13} /> Approve
                  </button>
                  <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 12, gap: 5, color: "#ef4444", borderColor: "rgba(239,68,68,0.25)" }}>
                    <ThumbsDown size={13} /> Reject
                  </button>
                </div>
              )}
              {isOpen ? <ChevronDown size={18} color="var(--ink-tertiary)" /> : <ChevronRight size={18} color="var(--ink-tertiary)" />}
            </div>

            {/* Expanded body */}
            {isOpen && (
              <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--glass-border)" }}>
                <p style={{ fontSize: 14, color: "var(--ink-secondary)", lineHeight: 1.6, margin: "16px 0" }}>{s.summary}</p>

                {/* Steps */}
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Engagement Steps</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {s.steps.map((step) => (
                    <div key={step.step} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 14px", background: "rgba(0,0,0,0.02)", borderRadius: 10 }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #9333ea)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{step.step}</div>
                      <div style={{ flex: 1, fontSize: 13 }}>{step.action}</div>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: "rgba(14,165,233,0.1)", color: "#0ea5e9", fontWeight: 600 }}>{step.channel}</span>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: "rgba(0,0,0,0.04)", color: "var(--ink-secondary)", fontWeight: 600 }}>{step.timing}</span>
                    </div>
                  ))}
                </div>

                {/* Risk flags */}
                {s.riskFlags.length > 0 && (
                  <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(245,158,11,0.06)", borderRadius: 10, border: "1px solid rgba(245,158,11,0.18)" }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#f59e0b", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <AlertTriangle size={13} /> Risk Flags
                    </div>
                    {s.riskFlags.map((flag, i) => (
                      <div key={i} style={{ fontSize: 12, color: "var(--ink-secondary)", marginBottom: 4 }}>· {flag}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   APPOINTMENTS PAGE
═══════════════════════════════════════════════════════ */
function AppointmentsPage() {
  const [view, setView] = useState<"list" | "calendar">("list");

  const statusMeta: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    confirmed:  { label: "Confirmed",  color: "#10b981", bg: "rgba(16,185,129,0.1)",  icon: <CheckCircle size={12} /> },
    pending:    { label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: <Clock      size={12} /> },
    completed:  { label: "Completed",  color: "#0ea5e9", bg: "rgba(14,165,233,0.1)",  icon: <Star       size={12} /> },
    invited:    { label: "Invited",    color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  icon: <Send       size={12} /> },
    cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",   icon: <XCircle    size={12} /> },
  };

  const typeIcon = (t: string) => {
    if (t === "Contract Signing") return <Edit3 size={14} color="#10b981" />;
    if (t === "Consultation")    return <MessageCircle size={14} color="#0ea5e9" />;
    if (t === "Investment Review")return <BarChart size={14} color="#f59e0b" />;
    if (t === "Open House")      return <Building2 size={14} color="#8b5cf6" />;
    return <Home size={14} color="#7c3aed" />;
  };

  const stats = [
    { label: "This Week",   value: 4, icon: <Calendar size={18} />,    color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
    { label: "Confirmed",   value: 3, icon: <CheckCircle size={18} />, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Pending",     value: 2, icon: <Clock size={18} />,       color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Completed",   value: 1, icon: <Star size={18} />,        color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats */}
      <div className="appt-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {stats.map((s, i) => (
          <div key={i} className="glass-card stat-card" style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: "16px 20px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--ink-secondary)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="glass-card" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`filter-chip ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>List View</button>
            <button className={`filter-chip ${view === "calendar" ? "active" : ""}`} onClick={() => setView("calendar")}>Calendar View</button>
          </div>
          <button className="btn-primary" style={{ padding: "6px 16px", fontSize: 13 }}>
            <Plus size={14} /> New Appointment
          </button>
        </div>
      </div>

      {/* Calendar-style grid (simplified visual) */}
      {view === "calendar" && (
        <div className="glass-card">
          <div className="card-title" style={{ marginBottom: 16 }}>August – September 2026</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, textAlign: "center" }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-tertiary)", padding: "8px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 3; // Aug starts on Saturday
              const num = day + 1;
              const hasAppt = [28, 29, 26, 33, 34, 36, 39].includes(i);
              return (
                <div key={i} style={{
                  padding: "10px 4px", borderRadius: 10, fontSize: 13, fontWeight: num > 0 && num <= 31 ? 500 : 400,
                  color: num > 0 && num <= 31 ? "var(--ink-primary)" : "var(--ink-tertiary)",
                  background: hasAppt ? "rgba(124,58,237,0.08)" : "transparent",
                  border: hasAppt ? "1px solid rgba(124,58,237,0.2)" : "1px solid transparent",
                  position: "relative",
                }}>
                  {num > 0 && num <= 31 ? num : ""}
                  {hasAppt && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#7c3aed", margin: "3px auto 0" }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {appointments.map((appt) => {
          const sm = statusMeta[appt.status] ?? statusMeta.pending;
          return (
            <div key={appt.id} className="glass-card" style={{ padding: "18px 24px" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {/* Date block */}
                <div style={{ width: 56, textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", letterSpacing: "0.06em" }}>
                    {appt.date.split(",")[0].split(" ")[0]}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: "-1px" }}>
                    {appt.date.split(",")[0].split(" ")[1]}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ width: 2, alignSelf: "stretch", background: "var(--glass-border)", borderRadius: 2, flexShrink: 0 }} />

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        {typeIcon(appt.type)}
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{appt.type}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-secondary)", marginBottom: 6 }}>
                        <Clock size={12} /> {appt.time} · {appt.duration}
                      </div>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 12, background: sm.bg, color: sm.color, fontWeight: 600, fontSize: 12 }}>
                      {sm.icon} {sm.label}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 20, fontSize: 12, color: "var(--ink-secondary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div className={`lead-avatar ${appt.leadAvatar}`} style={{ width: 20, height: 20, fontSize: 9 }}>
                        {appt.leadName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      {appt.leadName}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{appt.property}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={11} />{appt.agent}</span>
                  </div>

                  {appt.notes && (
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(0,0,0,0.025)", borderRadius: 8, fontSize: 12, color: "var(--ink-secondary)" }}>
                      📝 {appt.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button className="btn-secondary" style={{ padding: "5px 12px", fontSize: 12 }}>Edit</button>
                  {appt.status !== "completed" && (
                    <button className="btn-secondary" style={{ padding: "5px 12px", fontSize: 12, color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ANALYTICS PAGE
═══════════════════════════════════════════════════════ */
function AnalyticsPage() {
  const maxWeekly = Math.max(...weeklyData.map((d) => d.conversations));
  const maxMonthly = Math.max(...monthlyTrend.map((d) => d.revenue));

  const kpis = [
    { label: "Total Revenue",     value: "$841K",  trend: "+22%",  trendDir: "up",   icon: <DollarSign size={20} />, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Leads This Month",  value: "374",    trend: "+18%",  trendDir: "up",   icon: <Users size={20} />,      color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
    { label: "Conversion Rate",   value: "13.9%",  trend: "+4.1%", trendDir: "up",   icon: <Target size={20} />,     color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
    { label: "Avg. Response Time",value: "4.2 min",trend: "-18%",  trendDir: "up",   icon: <Zap size={20} />,        color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Deals Closed",      value: "52",     trend: "+9%",   trendDir: "up",   icon: <Award size={20} />,      color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
    { label: "AI Accuracy Score", value: "94.2%",  trend: "+1.8%", trendDir: "up",   icon: <Brain size={20} />,      color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* KPI grid */}
      <div className="analytics-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {kpis.map((k, i) => (
          <div key={i} className="glass-card interactive stat-card">
            <div className="stat-card-header">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, color: k.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{k.icon}</div>
              <span className={`stat-card-trend ${k.trendDir}`}>
                {k.trendDir === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{k.trend}
              </span>
            </div>
            <div className="stat-card-value">{k.value}</div>
            <div className="stat-card-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="analytics-charts-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        {/* Weekly activity chart */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <div className="card-title">Weekly Activity</div>
              <div className="card-subtitle">Conversations · Qualified · Booked</div>
            </div>
            <div className="card-actions">
              <button className="filter-chip active">Week</button>
              <button className="filter-chip">Month</button>
            </div>
          </div>
          <div className="chart-container" style={{ height: 180 }}>
            {weeklyData.map((d, i) => (
              <div className="chart-bar-group" key={i}>
                <div className="chart-bar primary" style={{ height: `${(d.conversations / maxWeekly) * 100}%` }} title={`Conv: ${d.conversations}`} />
                <div className="chart-bar secondary" style={{ height: `${(d.qualified / maxWeekly) * 100}%` }} title={`Qual: ${d.qualified}`} />
                <div className="chart-bar" style={{ height: `${(d.booked / maxWeekly) * 100}%`, background: "linear-gradient(180deg, #10b981, rgba(16,185,129,0.25))" }} title={`Booked: ${d.booked}`} />
                <span className="chart-bar-label">{d.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
            {[["Conversations", "#7c3aed"], ["Qualified", "#0ea5e9"], ["Booked", "#10b981"]].map(([l, c]) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--ink-secondary)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />{l}
              </span>
            ))}
          </div>
        </div>

        {/* Lead sources donut-style */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <div className="card-title">Lead Sources</div>
              <div className="card-subtitle">Distribution by channel</div>
            </div>
          </div>
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

      {/* Monthly trend + funnel + top agents */}
      <div className="analytics-bottom-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        {/* Monthly revenue trend */}
        <div className="glass-card">
          <div className="card-header" style={{ marginBottom: 16 }}>
            <div>
              <div className="card-title">Revenue Trend</div>
              <div className="card-subtitle">Last 6 months ($K)</div>
            </div>
          </div>
          <div className="chart-container" style={{ height: 140 }}>
            {monthlyTrend.map((d, i) => (
              <div className="chart-bar-group" key={i}>
                <div className="chart-bar primary" style={{ height: `${(d.revenue / maxMonthly) * 100}%` }} title={`Revenue: $${d.revenue}K`} />
                <span className="chart-bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel */}
        <div className="glass-card">
          <div className="card-title" style={{ marginBottom: 16 }}>Conversion Funnel</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {funnelData.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "var(--ink-secondary)", width: 70, textAlign: "right", fontWeight: 500 }}>{item.label}</span>
                <div style={{ flex: 1, height: 26, background: "rgba(0,0,0,0.03)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${item.pct}%`, height: "100%", background: `linear-gradient(90deg, ${item.color}CC, ${item.color}66)`, borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{item.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top agents */}
        <div className="glass-card">
          <div className="card-title" style={{ marginBottom: 16 }}>Top Agents</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {topAgents.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? "#f59e0b" : "var(--glass-border)", color: i === 0 ? "#fff" : "var(--ink-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                  {i + 1}
                </div>
                <div className={`lead-avatar ${a.color}`} style={{ width: 32, height: 32, fontSize: 11 }}>{a.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-secondary)" }}>{a.deals} deals · {a.revenue}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>{a.conv}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SETTINGS PAGE
═══════════════════════════════════════════════════════ */
function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [notifEmail, setNotifEmail]       = useState(true);
  const [notifSMS, setNotifSMS]           = useState(true);
  const [notifAppt, setNotifAppt]         = useState(true);
  const [notifStrategy, setNotifStrategy] = useState(false);
  const [aiAutoApprove, setAiAutoApprove] = useState(false);
  const [aiVoice, setAiVoice]             = useState(true);
  const [aiSentiment, setAiSentiment]     = useState(true);

  const tabs = [
    { id: "profile",       label: "Profile",       icon: <User size={15} />      },
    { id: "agency",        label: "Agency",        icon: <Building2 size={15} /> },
    { id: "notifications", label: "Notifications", icon: <BellIcon size={15} />  },
    { id: "ai",            label: "AI Settings",   icon: <Brain size={15} />     },
    { id: "integrations",  label: "Integrations",  icon: <Globe size={15} />     },
    { id: "security",      label: "Security",      icon: <Shield size={15} />    },
    { id: "billing",       label: "Billing",       icon: <CreditCard size={15} />},
  ];

  type Toggle = { label: string; desc: string; val: boolean; set: (v: boolean) => void };

  const Toggle = ({ label, desc, val, set }: Toggle) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--glass-border)" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--ink-secondary)", marginTop: 2 }}>{desc}</div>
      </div>
      <div
        onClick={() => set(!val)}
        style={{
          width: 44, height: 24, borderRadius: 12, cursor: "pointer", transition: "background 200ms",
          background: val ? "#7c3aed" : "rgba(0,0,0,0.1)", position: "relative", flexShrink: 0
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 3, left: val ? 23 : 3, transition: "left 200ms ease",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
        }} />
      </div>
    </div>
  );

  return (
    <div className="settings-layout" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* Tab nav */}
      <div className="settings-tab-nav glass-card" style={{ width: 220, flexShrink: 0, padding: "8px 0" }}>
        {tabs.map((t) => (
          <div
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`nav-item ${activeTab === t.id ? "active" : ""}`}
            style={{ margin: "2px 8px", borderRadius: 10 }}
          >
            <span className="nav-item-icon">{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {activeTab === "profile" && (
          <div className="glass-card">
            <div className="card-title" style={{ marginBottom: 24 }}>Profile Settings</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
              <div className="sidebar-user-avatar" style={{ width: 64, height: 64, fontSize: 20 }}>AJ</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Alex Johnson</div>
                <div style={{ fontSize: 13, color: "var(--ink-secondary)" }}>Agency Admin · CallMind AI</div>
                <button className="btn-secondary" style={{ marginTop: 10, padding: "6px 14px", fontSize: 12 }}>Change Photo</button>
              </div>
            </div>
            {[
              { label: "Full Name",    value: "Alex Johnson",           type: "text"  },
              { label: "Email",        value: "alex@callmind.ai",       type: "email" },
              { label: "Phone",        value: "+1 (213) 555-0194",      type: "tel"   },
              { label: "Job Title",    value: "Agency Admin",           type: "text"  },
              { label: "Time Zone",    value: "America/Los_Angeles (PST)", type: "text"  },
            ].map((f) => (
              <div key={f.label} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</label>
                <input
                  type={f.type}
                  defaultValue={f.value}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--glass-border)", borderRadius: 10, fontSize: 14, background: "rgba(255,255,255,0.7)", color: "var(--ink-primary)", outline: "none", fontFamily: "var(--font-display)" }}
                />
              </div>
            ))}
            <button className="btn-primary" style={{ marginTop: 8 }}>Save Changes</button>
          </div>
        )}

        {activeTab === "agency" && (
          <div className="glass-card">
            <div className="card-title" style={{ marginBottom: 24 }}>Agency Settings</div>
            {[
              { label: "Agency Name",   value: "Premier Real Estate Group" },
              { label: "License #",     value: "DRE #02048291"             },
              { label: "Address",       value: "1800 Century Park E, Los Angeles, CA 90067" },
              { label: "Website",       value: "https://premierregroup.com" },
              { label: "MLS Region",    value: "SoCal MLS (CRMLS)"         },
            ].map((f) => (
              <div key={f.label} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</label>
                <input
                  type="text"
                  defaultValue={f.value}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--glass-border)", borderRadius: 10, fontSize: 14, background: "rgba(255,255,255,0.7)", color: "var(--ink-primary)", outline: "none", fontFamily: "var(--font-display)" }}
                />
              </div>
            ))}
            <button className="btn-primary" style={{ marginTop: 8 }}>Save Changes</button>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="glass-card">
            <div className="card-title" style={{ marginBottom: 4 }}>Notification Preferences</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Choose how and when you receive alerts</div>
            <Toggle label="Email Notifications"   desc="Receive lead updates, strategy alerts, and weekly reports via email" val={notifEmail}    set={setNotifEmail}    />
            <Toggle label="SMS Alerts"            desc="Get instant SMS alerts for high-intent leads and urgent actions"     val={notifSMS}      set={setNotifSMS}      />
            <Toggle label="Appointment Reminders" desc="24-hour and 1-hour reminders before scheduled appointments"         val={notifAppt}     set={setNotifAppt}     />
            <Toggle label="Strategy Alerts"       desc="Be notified when AI generates a new strategy for your review"       val={notifStrategy} set={setNotifStrategy} />
          </div>
        )}

        {activeTab === "ai" && (
          <div className="glass-card">
            <div className="card-title" style={{ marginBottom: 4 }}>AI Configuration</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Control how the AI operates and engages leads</div>
            <Toggle label="Auto-Approve Low-Risk Strategies" desc="Let AI auto-approve strategies with a confidence score above 85%" val={aiAutoApprove} set={setAiAutoApprove} />
            <Toggle label="AI Voice Calls"        desc="Allow AI to initiate and conduct outbound voice calls to leads"       val={aiVoice}     set={setAiVoice}     />
            <Toggle label="Sentiment Analysis"    desc="Analyse lead responses to detect frustration, excitement, or hesitation" val={aiSentiment} set={setAiSentiment} />
            <div style={{ marginTop: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>AI Tone of Voice</label>
              <div style={{ display: "flex", gap: 10 }}>
                {["Professional", "Friendly", "Concise"].map((t) => (
                  <button key={t} className={`filter-chip ${t === "Professional" ? "active" : ""}`}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Max AI Follow-ups per Lead</label>
              <input type="number" defaultValue={5} min={1} max={20} style={{ width: 80, padding: "8px 12px", border: "1px solid var(--glass-border)", borderRadius: 10, fontSize: 14, background: "rgba(255,255,255,0.7)", color: "var(--ink-primary)", outline: "none" }} />
            </div>
            <button className="btn-primary" style={{ marginTop: 20 }}>Save AI Settings</button>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="glass-card">
            <div className="card-title" style={{ marginBottom: 4 }}>Integrations</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Connect your tools and data sources</div>
            {[
              { name: "Zillow / Realtor.com",  desc: "Sync property listings automatically",     status: "connected",    icon: "🏠" },
              { name: "Twilio",               desc: "SMS and voice call infrastructure",          status: "connected",    icon: "📱" },
              { name: "Salesforce CRM",       desc: "Sync leads and deal pipeline",               status: "disconnected", icon: "☁️" },
              { name: "Google Calendar",      desc: "Auto-sync appointments",                     status: "connected",    icon: "📅" },
              { name: "Stripe",               desc: "Manage billing and subscription",            status: "connected",    icon: "💳" },
              { name: "Zapier",               desc: "Automate workflows with 5000+ apps",        status: "disconnected", icon: "⚡" },
              { name: "DocuSign",             desc: "Digital contract signing integration",       status: "disconnected", icon: "✍️" },
            ].map((int, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--glass-border)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{int.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{int.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-secondary)" }}>{int.desc}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 10, background: int.status === "connected" ? "rgba(16,185,129,0.1)" : "rgba(0,0,0,0.05)", color: int.status === "connected" ? "#10b981" : "var(--ink-tertiary)" }}>
                  {int.status === "connected" ? "✓ Connected" : "Connect"}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "security" && (
          <div className="glass-card">
            <div className="card-title" style={{ marginBottom: 4 }}>Security</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Manage your account security settings</div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Current Password</label>
              <input type="password" placeholder="••••••••••••" style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--glass-border)", borderRadius: 10, fontSize: 14, background: "rgba(255,255,255,0.7)", outline: "none", fontFamily: "var(--font-display)" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>New Password</label>
              <input type="password" placeholder="••••••••••••" style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--glass-border)", borderRadius: 10, fontSize: 14, background: "rgba(255,255,255,0.7)", outline: "none", fontFamily: "var(--font-display)" }} />
            </div>
            <button className="btn-primary">Update Password</button>
            <div style={{ marginTop: 28, padding: 20, background: "rgba(124,58,237,0.04)", borderRadius: 12, border: "1px solid rgba(124,58,237,0.12)" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Two-Factor Authentication</div>
              <div style={{ fontSize: 13, color: "var(--ink-secondary)", marginBottom: 12 }}>Add an extra layer of security with an authenticator app</div>
              <button className="btn-secondary">Enable 2FA</button>
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Active Sessions</div>
              {[
                { device: "Chrome · MacBook Pro", location: "Los Angeles, CA", active: true },
                { device: "Safari · iPhone 15",   location: "Los Angeles, CA", active: false },
              ].map((sess, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--glass-border)", fontSize: 13 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{sess.device}</div>
                    <div style={{ color: "var(--ink-secondary)", fontSize: 12 }}>{sess.location}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: sess.active ? "rgba(16,185,129,0.1)" : "rgba(0,0,0,0.05)", color: sess.active ? "#10b981" : "var(--ink-tertiary)", fontWeight: 600 }}>
                    {sess.active ? "Current" : "Revoke"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="glass-card">
              <div className="card-title" style={{ marginBottom: 16 }}>Current Plan</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(14,165,233,0.04))", borderRadius: 14, border: "1px solid rgba(124,58,237,0.15)" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>Professional</div>
                  <div style={{ fontSize: 13, color: "var(--ink-secondary)", marginTop: 4 }}>Up to 3 agents · 2,000 leads/month · All AI features</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#7c3aed" }}>$299<span style={{ fontSize: 14, fontWeight: 500 }}>/mo</span></div>
                  <div style={{ fontSize: 12, color: "var(--ink-secondary)" }}>Renews Sep 1, 2026</div>
                </div>
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                <button className="btn-primary">Upgrade to Agency</button>
                <button className="btn-secondary">View Plans</button>
              </div>
            </div>
            <div className="glass-card">
              <div className="card-title" style={{ marginBottom: 16 }}>Payment Method</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(0,0,0,0.02)", borderRadius: 10, border: "1px solid var(--glass-border)" }}>
                <div style={{ fontSize: 24 }}>💳</div>
                <div>
                  <div style={{ fontWeight: 600 }}>Visa ending in 4242</div>
                  <div style={{ fontSize: 12, color: "var(--ink-secondary)" }}>Expires 09/2028</div>
                </div>
                <button className="btn-secondary" style={{ marginLeft: "auto", padding: "5px 14px", fontSize: 12 }}>Update</button>
              </div>
            </div>
            <div className="glass-card">
              <div className="card-title" style={{ marginBottom: 16 }}>Invoice History</div>
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th><th>Invoice</th></tr>
                </thead>
                <tbody>
                  {[
                    { date: "Aug 1, 2026", desc: "Professional Plan", amount: "$299.00", status: "Paid" },
                    { date: "Jul 1, 2026", desc: "Professional Plan", amount: "$299.00", status: "Paid" },
                    { date: "Jun 1, 2026", desc: "Professional Plan", amount: "$299.00", status: "Paid" },
                  ].map((inv, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 13 }}>{inv.date}</td>
                      <td style={{ fontSize: 13 }}>{inv.desc}</td>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>{inv.amount}</td>
                      <td><span className="status-badge qualified" style={{ fontSize: 11 }}><span className="status-dot" />{inv.status}</span></td>
                      <td><button className="btn-secondary" style={{ padding: "4px 10px", fontSize: 11 }}>↓ PDF</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT PAGE
═══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed]   = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case "leads":         return <LeadsPage />;
      case "conversations": return <ConversationsPage />;
      case "strategies":    return <StrategiesPage />;
      case "appointments":  return <AppointmentsPage />;
      case "analytics":     return <AnalyticsPage />;
      case "settings":      return <SettingsPage />;
      default:              return <DashboardHome />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main className="main-content">
        <TopBar activePage={activePage} />
        {renderPage()}
      </main>
    </div>
  );
}
