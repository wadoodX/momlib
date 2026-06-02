import { ImageResponse } from "next/og";

export const alt = "Nibras — The digital library for Islamic studies";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded parchment share-card (no external assets needed).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          backgroundColor: "#f0ebde",
          backgroundImage:
            "radial-gradient(60% 80% at 80% 20%, rgba(207,176,105,0.35), transparent 70%), radial-gradient(50% 60% at 10% 90%, rgba(124,148,104,0.25), transparent 70%)",
          color: "#28332b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 600, color: "#5b645a" }}>
          Nibras
          <span style={{ color: "#7a5f22" }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: 940,
          }}
        >
          The digital library for Islamic studies.
        </div>
        <div style={{ display: "flex", marginTop: 30, fontSize: 34, color: "#5b645a", maxWidth: 880 }}>
          Teachers publish. Students learn. Every course, chapter, and resource in one searchable place.
        </div>
      </div>
    ),
    { ...size },
  );
}
