"use client";

import Link from "next/link";
import {
  ArrowRight, Bot, CheckCircle2, ChevronRight,
  Menu, MessageSquare, PhoneCall, ShieldCheck, TrendingUp, X
} from "lucide-react";
import { useState, useEffect } from "react";
import CallMindLogo from "./components/CallMindLogo";

export default function MarketingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setNavHidden(true);
      } else {
        setNavHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="marketing-layout">

      {/* ── Navbar ── */}
      <nav className={`marketing-nav ${navHidden ? "nav-hidden" : ""}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <CallMindLogo size={30} showText={true} />
          </div>

          {/* Desktop links */}
          <div className="nav-links desktop-only">
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#workflow" className="nav-link">Workflow</Link>
            <Link href="#security" className="nav-link">Security</Link>
          </div>

          <div className="nav-actions desktop-only">
            <Link href="/dashboard" className="btn-secondary">Log In</Link>
            <button className="btn-primary">Get a Demo</button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn mobile-only"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mobile-menu">
            <Link href="#features" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Features</Link>
            <Link href="#workflow" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Workflow</Link>
            <Link href="#security" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Security</Link>
            <div className="mobile-nav-divider" />
            <Link href="/dashboard" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Log In</Link>
            <button className="btn-primary" style={{ marginTop: 12, justifyContent: "center" }}>Get a Demo</button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <div className="hero-wrapper">
        <div className="hero-bg" />
        <section className="hero-section">
          {/* Text content */}
          <div className="hero-content">

            <h1 className="hero-title">
              Turn property inquiries into{" "}
              <span className="text-gradient">qualified opportunities.</span>
            </h1>

            <p className="hero-subtitle">
              CallMind AI handles initial conversations, extracts property
              requirements, and qualifies leads 24/7—while you maintain complete
              human control.
            </p>

            <div className="hero-actions">
              <button className="btn-primary btn-large">
                Start Free Trial <ArrowRight size={17} />
              </button>
              <button className="btn-ghost btn-large">
                View Interactive Demo <ArrowRight size={16} />
              </button>
            </div>

            <div className="hero-stats">
              <div className="hero-stat-item">
                <span className="stat-num">3.5x</span>
                <span className="stat-label">Higher Conversion</span>
              </div>
              <div className="hero-stat-item">
                <span className="stat-num">24/7</span>
                <span className="stat-label">Lead Qualification</span>
              </div>
              <div className="hero-stat-item">
                <span className="stat-num">100%</span>
                <span className="stat-label">Human Control</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Concave scoop bottom cut ── */}
        <div className="hero-scoop">
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/*
              Concave scoop: starts at bottom-left (0,80),
              curves up to the center peak (~40px high), then back down to bottom-right.
              Filled with the page background color to "cut" into the hero.
            */}
            <path
              d="M0,80 L0,60 Q360,0 720,36 Q1080,72 1440,20 L1440,80 Z"
              fill="#f8faf9"
            />
          </svg>
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-eyebrow">Built for Real Estate Teams</span>
          <h2 className="section-title">Serious Real Estate Operations</h2>
          <p className="section-subtitle">
            Not a generic chatbot. A purpose-built intelligence layer for
            top-performing real estate teams.
          </p>
        </div>

        <div className="features-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon violet"><PhoneCall size={24} /></div>
            <h3>Intelligent Voice &amp; Chat</h3>
            <p>
              Seamlessly handle inbound inquiries through natural,
              context-aware conversations that feel indistinguishable from
              human assistants.
            </p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon blue"><TrendingUp size={24} /></div>
            <h3>Smart Qualification</h3>
            <p>
              Automatically extract property requirements, budget constraints,
              and timeline urgency to score lead intent accurately.
            </p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon green"><ShieldCheck size={24} /></div>
            <h3>Human-in-the-Loop</h3>
            <p>
              Review AI-generated qualification strategies and approve
              engagement paths before the AI ever speaks to your high-value
              clients.
            </p>
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      <section id="workflow" className="workflow-section">
        <div className="workflow-container glass-surface">
          <div className="workflow-content">
            <span className="section-eyebrow" style={{ marginBottom: 12, display: "inline-block" }}>How It Works</span>
            <h2 className="section-title" style={{ textAlign: "left" }}>
              The Conversion Engine
            </h2>
            <ul className="workflow-list">
              {[
                { n: 1, h: "Lead Captured", p: "Inquiries arrive via web, portal, or phone." },
                { n: 2, h: "AI Strategy Generation", p: "Our engine plans the perfect qualification approach." },
                { n: 3, h: "Human Approval", p: "You review and approve the strategy in one click." },
                { n: 4, h: "Automated Engagement", p: "AI conducts the conversation and books viewings." },
              ].map((s) => (
                <li key={s.n} className="workflow-item">
                  <div className="workflow-step">{s.n}</div>
                  <div>
                    <h4>{s.h}</h4>
                    <p>{s.p}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="btn-primary">
              See it in action <ChevronRight size={16} />
            </Link>
          </div>

          <div className="workflow-visual">
            <div className="funnel-visualization">
              <div className="funnel-layer l-1">Inquiries</div>
              <div className="funnel-layer l-2">Qualified</div>
              <div className="funnel-layer l-3">Engaged</div>
              <div className="funnel-layer l-4">Booked</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="marketing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <CallMindLogo size={28} showText={true} />
            <p className="footer-desc">
              The intelligence layer for modern real estate operations.
            </p>
          </div>
          <div className="footer-links">
            {[
              { h: "Product", links: ["Features", "Pricing", "Case Studies"] },
              { h: "Company", links: ["About", "Careers", "Contact"] },
              { h: "Legal",   links: ["Privacy Policy", "Terms of Service", "Data Processing"] },
            ].map((g) => (
              <div key={g.h} className="link-group">
                <h4>{g.h}</h4>
                {g.links.map((l) => <Link key={l} href="#">{l}</Link>)}
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CallMind AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
