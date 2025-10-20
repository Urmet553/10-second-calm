import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import ShareCard from "./ShareCard";

/* ========= utilid ========= */
function fmtDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/* ========= minimalistlik Buddha SVG ========= */
function BuddhaSVG({ size = 88, color = "#f5f3ff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="tsecGrad" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#4338ca" />
        </radialGradient>
      </defs>
      {/* aura */}
      <circle cx="100" cy="100" r="96" fill="url(#tsecGrad)" opacity="0.25" />
      {/* pea */}
      <circle cx="100" cy="70" r="16" fill={color} />
      {/* torso */}
      <path
        d="M70 120c0-18 13-30 30-30s30 12 30 30v8H70z"
        fill={color}
        opacity="0.95"
      />
      {/* jalad */}
      <path
        d="M55 150c10-12 30-20 45-20s35 8 45 20c2 3-1 6-5 6H60c-4 0-7-3-5-6z"
        fill={color}
        opacity="0.95"
      />
      {/* käed */}
      <path
        d="M76 132c8 6 24 6 48 0 3-1 5 3 3 6-7 10-23 16-27 16s-20-6-27-16c-2-3 0-7 3-6z"
        fill={color}
        opacity="0.9"
      />
    </svg>
  );
}

/* ========= põhikomponent ========= */
export default function TenSecondCalm() {
  // seanss
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");

  // toote-/UI olek
  const [soundOn, setSoundOn] = useState(true);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("tsec_theme") || "dark"
  );
  const [streak, setStreak] = useState(0);
  const [lastDate, setLastDate] = useState(null);

  // share
  const [shareVisible, setShareVisible] = useState(false);
  const cardRef = useRef(null);

  // pehme chime
  const chime = useMemo(() => {
    let ctx = null;
    return () => {
      if (!soundOn) return;
      try {
        // @ts-ignore
        ctx = ctx ?? new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === "suspended") ctx.resume();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(440, ctx.currentTime);
        o.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.2);
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.65);
      } catch {}
    };
  }, [soundOn]);

  // AJASTUS: 4s + 4s + 2s = 10s
  const steps = [
    { text: "Inhale…", delay: 4000 }, // 4 sekundit sisse
    { text: "Exhale…", delay: 4000 }, // 4 sekundit välja
    { text: "Well done. You are officially zen.", delay: 2000 }, // 2 sekundit lõpus
  ];

  /* streak laadimine */
  useEffect(() => {
    const s = localStorage.getItem("zen_streak");
    const d = localStorage.getItem("zen_last_date");
    setStreak(s ? parseInt(s, 10) : 0);
    setLastDate(d);
  }, []);

  /* seansi voog */
  useEffect(() => {
    if (started && step < steps.length) {
      setMessage(steps[step].text);
      chime();
      const t = setTimeout(() => setStep((v) => v + 1), steps[step].delay);
      return () => clearTimeout(t);
    } else if (started && step >= steps.length) {
      const done = setTimeout(() => {
        setStarted(false);
        setStep(0);
        setMessage("");

        // streak uuendus
        const today = fmtDate();
        if (lastDate !== today) {
          const yesterday = fmtDate(new Date(Date.now() - 86400000));
          const next = lastDate === yesterday ? streak + 1 : 1;
          setStreak(next);
          setLastDate(today);
          localStorage.setItem("zen_streak", String(next));
          localStorage.setItem("zen_last_date", today);
        }
      }, 800);
      return () => clearTimeout(done);
    }
  }, [started, step]); // eslint-disable-line

  /* teema salvestus */
  useEffect(() => {
    localStorage.setItem("tsec_theme", theme);
  }, [theme]);

  /* värvid vastavalt teemale */
  const styles =
    theme === "dark"
      ? {
          bg: "linear-gradient(135deg,#0f172a 0%,#1e293b 40%,#312e81 100%)",
          cardBg:
            "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
          text: "#e5e7eb",
          sub: "#cbd5e1",
          hint: "#94a3b8",
          primary: "#3b82f6",
          outline: "#334155",
          glow: "rgba(59,130,246,0.4)",
        }
      : {
          bg: "linear-gradient(135deg,#e6f0ff 0%,#eef2ff 40%,#ede9fe 100%)",
          cardBg:
            "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.7))",
          text: "#111827",
          sub: "#374151",
          hint: "#6b7280",
          primary: "#2563eb",
          outline: "#e5e7eb",
          glow: "rgba(37,99,235,0.35)",
        };

  /* share abilised */
  const appUrl = (() => {
    const base = window.location.origin || "https://10secondcalm.app";
    const today = fmtDate();
    return `${base}/?streak=${streak}&date=${today}`;
  })();

  const captureCard = async () => {
    const node = cardRef.current;
    if (!node) return;
    const canvas = await html2canvas(node, {
      backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
      scale: window.devicePixelRatio || 2,
    });
    const link = document.createElement("a");
    link.download = "10secondcalm.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(appUrl);
    alert("Share link copied to clipboard!");
  };

  const webShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "10 Second Calm",
          text: "I did my 10 seconds today. Join me.",
          url: appUrl,
        });
      } else {
        await copyLink();
      }
    } catch {}
  };

  const openShare = (platform) => {
    const text = encodeURIComponent("I did my 10 seconds today. Join me.");
    const url = encodeURIComponent(appUrl);
    const title = encodeURIComponent("10 Second Calm");
    let share = "";
    switch (platform) {
      case "x":
        share = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "facebook":
        share = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        share = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "reddit":
        share = `https://www.reddit.com/submit?url=${url}&title=${title}`;
        break;
      case "whatsapp":
        share = `https://api.whatsapp.com/send?text=${text}%20${url}`;
        break;
      case "telegram":
        share = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case "email":
        share = `mailto:?subject=${title}&body=${text}%20${url}`;
        break;
      default:
        share = appUrl;
    }
    window.open(share, "_blank", "noopener,noreferrer");
  };

  const start = () => {
    setStarted(true);
    setStep(0);
  };

  /* =============== UI =============== */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: styles.bg,
        color: styles.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      {/* kaart — kasutatakse ka “Share as Image” jaoks */}
      <motion.div
        ref={cardRef}
        style={{
          width: "100%",
          maxWidth: 520,
          background: styles.cardBg,
          borderRadius: 22,
          padding: 32,
          backdropFilter: "blur(14px)",
          boxShadow: "0 16px 50px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* ülemine rida: teema + heli */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
              border: `1px solid ${styles.outline}`,
              background: "transparent",
              color: styles.text,
              borderRadius: 10,
              padding: "6px 12px",
              cursor: "pointer",
            }}
            title="Toggle theme"
          >
            {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
          </button>

          <button
            onClick={() => setSoundOn((v) => !v)}
            style={{
              border: `1px solid ${styles.outline}`,
              background: "transparent",
              color: styles.text,
              borderRadius: 10,
              padding: "6px 12px",
              cursor: "pointer",
            }}
            title="Toggle sound"
          >
            {soundOn ? "🔊 Sound On" : "🔇 Sound Off"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
                10 Second Calm
              </h1>
              <p style={{ color: styles.sub, marginBottom: 20 }}>
                Breathe deeply and find calm in just 10 seconds.
              </p>

              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [1, 0.95, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  margin: "4px auto 22px",
                  background:
                    theme === "dark"
                      ? "radial-gradient(circle at 30% 30%,#60a5fa,#3b82f6 45%,#1e3a8a 90%)"
                      : "radial-gradient(circle at 30% 30%,#60a5fa,#93c5fd 50%,#2563eb 95%)",
                  boxShadow: `0 0 50px ${styles.glow}`,
                }}
              />

              <button
                onClick={start}
                style={{
                  width: "100%",
                  background: styles.primary,
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 0",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: "pointer",
                  boxShadow: `0 10px 26px ${styles.glow}`,
                }}
              >
                Start calming
              </button>

              {/* share tööriistariba */}
              <div style={{ marginTop: 14 }}>
                <button
                  onClick={() => setShareVisible(true)}
                  style={{
                    marginRight: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: `1px solid ${styles.outline}`,
                    background: "transparent",
                    color: styles.text,
                    cursor: "pointer",
                  }}
                >
                  📤 Share Card
                </button>
                <button
                  onClick={webShare}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: `1px solid ${styles.outline}`,
                    background: "transparent",
                    color: styles.text,
                    cursor: "pointer",
                  }}
                >
                  🔗 Quick Share
                </button>
              </div>

              <p style={{ color: styles.hint, fontSize: 12, marginTop: 10 }}>
                Tip: open the app every day to keep your streak alive 🌿
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="session"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* hingamise orb seansi ajal */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  margin: "0 auto 18px",
                  background:
                    theme === "dark"
                      ? "radial-gradient(circle at 30% 30%,#38bdf8,#818cf8 60%,#1e40af 95%)"
                      : "radial-gradient(circle at 30% 30%,#60a5fa,#a5b4fc 60%,#2563eb 95%)",
                  boxShadow: `0 0 60px ${styles.glow}`,
                }}
              />

              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                {message}
              </h2>

              {/* 🚨 Buddha ilmub ainult lõpusõnumi ajal */}
              {message === "Well done. You are officially zen." && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  style={{ marginTop: 6 }}
                >
                  {/* hõljuv animatsioon */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.4,
                      ease: "easeInOut",
                    }}
                  >
                    <BuddhaSVG size={88} />
                  </motion.div>
                </motion.div>
              )}

              <p style={{ color: styles.hint }}>
                ⏳ {step + 1} / {steps.length}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Share modal */}
      <AnimatePresence>
        {shareVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
            onClick={() => setShareVisible(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ShareCard
                streak={streak}
                lastDate={lastDate}
                quote={"A small pause changes a whole day."}
                theme={theme}
              />
              {/* jagamisnupud */}
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button
                  onClick={captureCard}
                  style={{
                    marginRight: 10,
                    padding: "8px 14px",
                    borderRadius: 10,
                    background: styles.primary,
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  📸 Share as Image
                </button>
                <button
                  onClick={copyLink}
                  style={{
                    marginRight: 10,
                    padding: "8px 14px",
                    borderRadius: 10,
                    background: theme === "dark" ? "#1e3a8a" : "#1d4ed8",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  📋 Copy Link
                </button>
                <button
                  onClick={webShare}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    background: "transparent",
                    border: `1px solid ${styles.outline}`,
                    color: styles.text,
                    cursor: "pointer",
                  }}
                >
                  📱 Native Share
                </button>
              </div>

              {/* platvormi kiirnupud */}
              <div style={{ textAlign: "center", marginTop: 12 }}>
                {[
                  ["x", "X/Twitter"],
                  ["facebook", "Facebook"],
                  ["linkedin", "LinkedIn"],
                  ["reddit", "Reddit"],
                  ["whatsapp", "WhatsApp"],
                  ["telegram", "Telegram"],
                  ["email", "Email"],
                ].map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => openShare(k)}
                    style={{
                      margin: 6,
                      padding: "6px 10px",
                      borderRadius: 10,
                      border: `1px solid ${styles.outline}`,
                      background: "transparent",
                      color: styles.text,
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
