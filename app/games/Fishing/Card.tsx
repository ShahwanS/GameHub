import React from "react";
import { rankDisplay } from "~/utils/cardUtils";

interface CardProps {
  rank: "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "T";
  suit: "S" | "H" | "D" | "C";
  faceUp?: boolean;
  style?: React.CSSProperties;
  className?: string;
  compact?: boolean; 
}

const suitSymbols = {
  S: { symbol: "♠", color: "#374151" },
  H: { symbol: "♥", color: "#dc2626" },
  D: { symbol: "♦", color: "#dc2626" },
  C: { symbol: "♣", color: "#374151" }
};

export default function Card({ rank, suit, faceUp = true, style = {}, className = "", compact = false }: CardProps) {
  const displayRank = rankDisplay[rank] || rank;
  const suitData = suitSymbols[suit];

  if (compact) {
    return (
      <span
        className={"inline-flex items-center justify-center rounded-md border font-bold select-none " + className}
        style={{
          width: 28,
          height: 28,
          fontSize: 15,
          background: "#fff",
          border: `1.5px solid #e2e8f0`,
          color: suitData.color,
          boxShadow: "0 1.5px 4px #0001",
          fontFamily: "'JetBrains Mono', 'Fira Mono', 'Menlo', 'monospace', 'system-ui', sans-serif",
          ...style
        }}
      >
        <span style={{ fontWeight: 700, marginRight: 2 }}>{displayRank}</span>
        <span style={{ color: suitData.color, fontSize: 15 }}>{suitData.symbol}</span>
      </span>
    );
  }

  return (
    <div
      className={"fancy-card " + className}
      style={{
        width: "clamp(60px, 8vw, 80px)",
        height: "clamp(90px, 12vw, 120px)",
        borderRadius: 16,
        background: "linear-gradient(135deg, #fff 60%, #f8fafc 100%)",
        boxShadow: "0 4px 24px #0003, 0 1.5px 4px #0002",
        border: "1.5px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "'JetBrains Mono', 'Fira Mono', 'Menlo', 'monospace', 'system-ui', sans-serif",
        fontWeight: 700,
        fontSize: "clamp(16px, 2.5vw, 24px)",
        color: suitData.color,
        padding: "clamp(6px, 1vw, 10px)",
        position: "relative",
        transition: "box-shadow 0.2s, transform 0.2s",
        ...style
      }}
    >
      {faceUp ? (
        <>
          <div style={{
            alignSelf: "flex-start",
            fontSize: "clamp(14px, 2vw, 22px)",
            color: suitData.color,
            textShadow: "0 1px 2px #fff8"
          }}>{displayRank}</div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ 
              fontSize: "clamp(20px, 3vw, 32px)", 
              color: suitData.color,
              fontWeight: "bold"
            }}>
              {suitData.symbol}
            </span>
          </div>
          <div style={{
            alignSelf: "flex-end",
            fontSize: "clamp(14px, 2vw, 22px)",
            color: suitData.color,
            transform: "rotate(180deg)",
            textShadow: "0 1px 2px #fff8"
          }}>{displayRank}</div>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: 16,
            pointerEvents: "none",
            boxShadow: "0 0 0 2px #fff8 inset, 0 0 0 8px #0001 inset"
          }} />
        </>
      ) : (
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: 16,
          background: "repeating-linear-gradient(135deg, #6366f1 0 10px, #818cf8 10px 20px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <span style={{ color: "#fff", fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 900, letterSpacing: 2 }}>★</span>
        </div>
      )}
    </div>
  );
}
