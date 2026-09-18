import { useState } from "react";

export function App() {
  const [page, setPage] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("page");
      if (p === "qude") return "qude";
      if (window.location.pathname === "/qude") return "qude";
    }
    return "aktau";
  });

  const isAktau = page === "aktau";
  const src = isAktau ? "/aktau.html" : "/qude.html";

  const togglePage = (target) => {
    setPage(target);
    const url = new URL(window.location);
    if (target === "qude") {
      url.searchParams.set("page", "qude");
    } else {
      url.searchParams.delete("page");
    }
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <iframe
        className="qude-preview"
        src={src}
        title={isAktau ? "КП — Брендинг и упаковка (Актау)" : "Qude — agence audio créative"}
        allow="microphone"
        style={{ width: "100%", height: "100%", border: 0 }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          zIndex: 99999,
          display: "flex",
          gap: "6px",
          background: "rgba(20, 18, 18, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "999px",
          padding: "4px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}
      >
        <button
          onClick={() => togglePage("aktau")}
          style={{
            background: isAktau ? "#FD4B32" : "transparent",
            color: isAktau ? "#fff" : "#aaa",
            border: 0,
            borderRadius: "999px",
            padding: "8px 14px",
            fontSize: "11px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          КП Актау (Готовая еда)
        </button>
        <button
          onClick={() => togglePage("qude")}
          style={{
            background: !isAktau ? "#fff" : "transparent",
            color: !isAktau ? "#000" : "#aaa",
            border: 0,
            borderRadius: "999px",
            padding: "8px 14px",
            fontSize: "11px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Оригинал (Qude)
        </button>
      </div>
    </div>
  );
}
