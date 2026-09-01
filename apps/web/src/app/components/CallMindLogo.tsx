import React from "react";

interface CallMindLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function CallMindLogo({ size = 36, showText = true, className = "" }: CallMindLogoProps) {
  return (
    <div className={`callmind-logo-wrapper ${className}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        className="callmind-logo-mark"
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(13, 148, 136, 0.3)",
        }}
      >
        <svg
          width={size * 0.56}
          height={size * 0.56}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Speech bubble outline with integrated 'C' shape */}
          <path
            d="M12 2C6.48 2 2 5.58 2 10c0 2.24 1.12 4.26 2.94 5.7L4 20l4.5-2.12C9.6 18.28 10.78 18.5 12 18.5c5.52 0 10-3.58 10-8S17.52 2 12 2z"
            fill="rgba(255,255,255,0.2)"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Waveform / signal lines inside the bubble */}
          <line x1="8" y1="8" x2="8" y2="12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="11" y1="6.5" x2="11" y2="13.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="14" y1="7.5" x2="14" y2="12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="17" y1="9" x2="17" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      {showText && (
        <span
          style={{
            fontWeight: 700,
            fontSize: size * 0.47,
            letterSpacing: "-0.4px",
            color: "var(--ink-primary, #111827)",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          CallMind
        </span>
      )}
    </div>
  );
}
