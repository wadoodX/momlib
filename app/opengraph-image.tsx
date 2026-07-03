import { ImageResponse } from "next/og";

export const alt = "Nibras — The digital library for Islamic studies";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded share-card in the cool-green "elevation" palette (no external assets needed).
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
          backgroundColor: "#edf3ee",
          backgroundImage:
            "radial-gradient(60% 80% at 80% 20%, rgba(199,163,79,0.30), transparent 70%), radial-gradient(50% 60% at 10% 90%, rgba(31,92,77,0.22), transparent 70%)",
          color: "#16342e",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 600, color: "#4e6a61" }}>
          Nibras
          <span style={{ color: "#a8842e" }}>.</span>
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
        <div style={{ display: "flex", marginTop: 30, fontSize: 34, color: "#4e6a61", maxWidth: 880 }}>
          Teachers publish. Students learn. Every course, chapter, and resource in one searchable place.
        </div>
      </div>
    ),
    { ...size },
  );
}
