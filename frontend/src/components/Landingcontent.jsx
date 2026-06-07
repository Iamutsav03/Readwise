import { useState, useEffect, useRef } from "react";

// ─── Fonts ──────────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');`;

// ─── Page 1: Welcome ─────────────────────────────────────────────────────────
const Page1 = ({ onNext }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 40px", textAlign: "center", position: "relative" }}>
            {/* Ambient ink dots */}
            <div style={{ position: "absolute", top: 28, left: 36, width: 5, height: 5, borderRadius: "50%", background: "#d4b896", opacity: 0.4 }} />
            <div style={{ position: "absolute", bottom: 48, right: 44, width: 3, height: 3, borderRadius: "50%", background: "#c8a870", opacity: 0.5 }} />
            <div style={{ position: "absolute", top: "40%", right: 28, width: 2, height: 44, background: "linear-gradient(to bottom, #e8d8b8, transparent)", borderRadius: 2 }} />

            {/* Book icon illustration */}
            <div style={{
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.92)",
                transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.4,0.64,1)",
                marginBottom: 28,
            }}>
                <svg width="72" height="58" viewBox="0 0 72 58" fill="none">
                    <rect x="8" y="6" width="25" height="46" rx="3" fill="#e8d4b4" stroke="#c8a870" strokeWidth="1" />
                    <rect x="10" y="8" width="21" height="42" rx="2" fill="#f5ede0" />
                    <line x1="14" y1="16" x2="27" y2="16" stroke="#d4b896" strokeWidth="1" strokeLinecap="round" />
                    <line x1="14" y1="20" x2="27" y2="20" stroke="#d4b896" strokeWidth="1" strokeLinecap="round" />
                    <line x1="14" y1="24" x2="23" y2="24" stroke="#d4b896" strokeWidth="1" strokeLinecap="round" />
                    <line x1="14" y1="32" x2="27" y2="32" stroke="#d4b896" strokeWidth="1" strokeLinecap="round" />
                    <line x1="14" y1="36" x2="24" y2="36" stroke="#d4b896" strokeWidth="1" strokeLinecap="round" />
                    <rect x="34" y="6" width="30" height="46" rx="3" fill="#dfc9a5" stroke="#b8966a" strokeWidth="1" />
                    <rect x="36" y="8" width="26" height="42" rx="2" fill="#faf3e8" />
                    <line x1="40" y1="16" x2="57" y2="16" stroke="#c8a870" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="40" y1="21" x2="57" y2="21" stroke="#c8a870" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="40" y1="26" x2="52" y2="26" stroke="#c8a870" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="40" y1="34" x2="57" y2="34" stroke="#c8a870" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="40" y1="39" x2="50" y2="39" stroke="#c8a870" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="49" cy="50" r="3" fill="#b8966a" opacity="0.6" />
                </svg>
            </div>

            <div style={{
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.65s ease 0.18s, transform 0.65s ease 0.18s",
            }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: "#b8a888", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px" }}>ReadWise · AI Reading Platform</p>
                <h1 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 700, color: "#1a1510",
                    lineHeight: 1.15, letterSpacing: "-0.03em", margin: "0 0 14px",
                }}>
                    Reading should feel<br />
                    <em style={{ color: "#b8966a", fontStyle: "italic" }}>effortless.</em>
                </h1>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#7a6a52", lineHeight: 1.7, fontWeight: 300, maxWidth: 320, margin: "0 auto 28px" }}>
                    We built a reading experience that stays out of your way — and steps in exactly when you need it.
                </p>
                <button
                    onClick={onNext}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "11px 24px", background: "#1a1510", color: "#f5f0e8",
                        border: "none", borderRadius: 10, cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                        letterSpacing: "0.03em", transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "#2e2519"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#1a1510"; }}
                >
                    Open the book
                    <span style={{ fontSize: 16 }}>→</span>
                </button>
            </div>

            {/* Page number */}
            <div style={{ position: "absolute", bottom: 18, right: 22, fontFamily: "'Playfair Display', serif", fontSize: 11, color: "#c8b898", fontStyle: "italic" }}>1</div>
        </div>
    );
};

// ─── Page 2: Upload & Start ───────────────────────────────────────────────────
const Page2 = () => {
    const [step, setStep] = useState(0);
    useEffect(() => {
        const timers = [
            setTimeout(() => setStep(1), 600),
            setTimeout(() => setStep(2), 1500),
            setTimeout(() => setStep(3), 2600),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    const steps = ["Drop a PDF into the sidebar", "Click the document to open it", "Reading mode activates instantly"];

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "28px 32px", position: "relative" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, fontWeight: 500, color: "#b8a888", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>How to start</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 600, color: "#1a1510", margin: "0 0 18px", letterSpacing: "-0.02em" }}>Upload &amp; begin reading</h2>

            {/* Mini UI mockup */}
            <div style={{ flex: 1, background: "#faf6f0", borderRadius: 10, border: "1px solid #e8ddd0", overflow: "hidden", display: "flex", flexDirection: "column", marginBottom: 18 }}>
                {/* Fake top bar */}
                <div style={{ height: 28, background: "#f0ebe3", borderBottom: "1px solid #e4dcd0", display: "flex", alignItems: "center", padding: "0 10px", gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#e8a898" }} />
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#e8d498" }} />
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#a8d898" }} />
                    <div style={{ flex: 1 }} />
                    <div style={{ width: 80, height: 6, borderRadius: 3, background: "#d8d0c4" }} />
                    <div style={{ flex: 1 }} />
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                    {/* Fake sidebar */}
                    <div style={{ width: 90, background: "#f5f0e8", borderRight: "1px solid #e8ddd0", padding: "10px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ fontSize: 8, fontFamily: "'DM Sans', sans-serif", color: "#b8a888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Library</div>
                        {/* Upload button highlight */}
                        <div style={{
                            padding: "5px 7px", borderRadius: 6, border: `1px dashed ${step >= 1 ? "#b8966a" : "#d4c8b4"}`,
                            background: step >= 1 ? "rgba(184,150,106,0.08)" : "transparent",
                            transition: "all 0.4s ease",
                            display: "flex", alignItems: "center", gap: 4,
                        }}>
                            <span style={{ fontSize: 9, color: step >= 1 ? "#b8966a" : "#c8b898" }}>⊕</span>
                            <span style={{ fontSize: 8, fontFamily: "'DM Sans', sans-serif", color: step >= 1 ? "#b8966a" : "#c8b898", fontWeight: step >= 1 ? 500 : 300 }}>Add PDF</span>
                        </div>
                        {/* File items */}
                        {["research.pdf", "chapter3.pdf"].map((name, i) => (
                            <div key={name} style={{
                                padding: "5px 7px", borderRadius: 6,
                                background: step >= 2 && i === 0 ? "rgba(26,21,16,0.06)" : "transparent",
                                border: `1px solid ${step >= 2 && i === 0 ? "#c8b898" : "transparent"}`,
                                transition: "all 0.3s ease",
                                cursor: "default",
                            }}>
                                <div style={{ fontSize: 8, fontFamily: "'DM Sans', sans-serif", color: "#7a6a52", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📄 {name}</div>
                            </div>
                        ))}
                    </div>
                    {/* Fake reader */}
                    <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 5, opacity: step >= 3 ? 1 : 0.3, transition: "opacity 0.6s ease" }}>
                        <div style={{ height: 6, background: "#2a2010", borderRadius: 3, width: "70%" }} />
                        <div style={{ height: 4, background: "#d4c8b4", borderRadius: 2, width: "95%" }} />
                        <div style={{ height: 4, background: "#d4c8b4", borderRadius: 2, width: "88%" }} />
                        <div style={{ height: 4, background: "#d4c8b4", borderRadius: 2, width: "92%" }} />
                        <div style={{ height: 4, background: "#d4c8b4", borderRadius: 2, width: "80%" }} />
                        <div style={{ margin: "4px 0" }} />
                        <div style={{ height: 4, background: "#d4c8b4", borderRadius: 2, width: "96%" }} />
                        <div style={{ height: 4, background: "#d4c8b4", borderRadius: 2, width: "78%" }} />
                        <div style={{ height: 4, background: "#b8966a", borderRadius: 2, width: "85%", opacity: 0.4 }} />
                        <div style={{ height: 4, background: "#d4c8b4", borderRadius: 2, width: "90%" }} />
                    </div>
                </div>
            </div>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {steps.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: step > i ? 1 : 0.35, transition: "opacity 0.4s ease" }}>
                        <div style={{
                            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                            background: step > i ? "#1a1510" : "#f0ebe3",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background 0.3s ease",
                        }}>
                            <span style={{ fontSize: 9, color: step > i ? "#f5f0e8" : "#9a8a72", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{i + 1}</span>
                        </div>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: "#4a3e30", fontWeight: step > i ? 400 : 300 }}>{s}</span>
                        {step > i && <span style={{ fontSize: 11, marginLeft: "auto" }}>✓</span>}
                    </div>
                ))}
            </div>

            <div style={{ position: "absolute", bottom: 18, right: 22, fontFamily: "'Playfair Display', serif", fontSize: 11, color: "#c8b898", fontStyle: "italic" }}>2</div>
        </div>
    );
};

// ─── Page 3: Word Meaning ─────────────────────────────────────────────────────
const Page3 = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [clicked, setClicked] = useState(false);
    useEffect(() => { setTimeout(() => setShowPopup(true), 1200); }, []);

    const handleWordClick = () => {
        setClicked(true);
        setShowPopup(true);
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "28px 32px", position: "relative" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, fontWeight: 500, color: "#b8a888", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Feature · Word clarity</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(17px, 2vw, 22px)", fontWeight: 600, color: "#1a1510", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Hover any word.</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: "#9a8870", margin: "0 0 18px", fontWeight: 300 }}>Meaning appears — without leaving the page.</p>

            {/* Reading simulation */}
            <div style={{ flex: 1, background: "#fdf8f2", border: "1px solid #ede8df", borderRadius: 10, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(13px, 1.5vw, 15px)", color: "#2a2010", lineHeight: 1.85, margin: 0, fontWeight: 400 }}>
                    The researchers observed a significant{" "}
                    <span
                        onClick={handleWordClick}
                        style={{
                            background: clicked ? "rgba(184,150,106,0.25)" : showPopup ? "rgba(184,150,106,0.18)" : "rgba(184,150,106,0.12)",
                            borderRadius: 3, padding: "1px 3px", cursor: "pointer",
                            borderBottom: "1.5px solid #b8966a",
                            transition: "background 0.2s ease",
                            fontWeight: 600, color: "#1a1510",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(184,150,106,0.28)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = clicked ? "rgba(184,150,106,0.25)" : "rgba(184,150,106,0.18)"; }}
                    >
                        epistemological
                    </span>{" "}
                    shift in how communities processed collective memory, challenging prior{" "}
                    <span style={{ color: "#5a4a38" }}>assumptions</span> about retention and narrative.
                </p>

                {/* Floating popup */}
                <div style={{
                    position: "absolute", bottom: 18, left: 16, right: 16,
                    background: "rgba(255,252,248,0.97)", border: "1px solid #e0d4c0",
                    borderRadius: 11, padding: "13px 16px",
                    boxShadow: "0 6px 24px rgba(26,21,16,0.1), 0 2px 8px rgba(26,21,16,0.06)",
                    opacity: showPopup ? 1 : 0,
                    transform: showPopup ? "translateY(0)" : "translateY(10px)",
                    transition: "opacity 0.45s ease, transform 0.45s cubic-bezier(0.34,1.4,0.64,1)",
                    backdropFilter: "blur(8px)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ padding: "2px 8px", borderRadius: 5, background: "#f0ebe3", border: "1px solid #e0d4c0" }}>
                            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, fontWeight: 600, color: "#1a1510", fontStyle: "italic" }}>epistemological</span>
                        </div>
                        <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", color: "#b8a888", fontStyle: "italic" }}>adj.</span>
                    </div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: "#4a3e30", lineHeight: 1.6, margin: "0 0 7px", fontWeight: 300 }}>
                        Relating to the nature and scope of knowledge — how we know what we know.
                    </p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: "#9a8870", lineHeight: 1.55, margin: 0, fontWeight: 300, fontStyle: "italic" }}>
                        In context: referring to a fundamental change in how knowledge and memory were understood.
                    </p>
                </div>
            </div>

            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#b8a888", marginTop: 10, textAlign: "center", fontStyle: "italic" }}>
                {showPopup ? "Try clicking the highlighted word ↑" : "Loading demo..."}
            </p>

            <div style={{ position: "absolute", bottom: 18, right: 22, fontFamily: "'Playfair Display', serif", fontSize: 11, color: "#c8b898", fontStyle: "italic" }}>3</div>
        </div>
    );
};

// ─── Page 4: Sentence Explanation ────────────────────────────────────────────
const Page4 = () => {
    const [selected, setSelected] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const handleSelect = () => {
        setSelected(true);
        setTimeout(() => setShowExplanation(true), 400);
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "28px 32px", position: "relative" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, fontWeight: 500, color: "#b8a888", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Feature · Sentence clarity</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(17px, 2vw, 22px)", fontWeight: 600, color: "#1a1510", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Select any sentence.</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: "#9a8870", margin: "0 0 18px", fontWeight: 300 }}>Plain-language explanation appears instantly.</p>

            <div style={{ flex: 1, background: "#fdf8f2", border: "1px solid #ede8df", borderRadius: 10, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(12px, 1.4vw, 14.5px)", color: "#2a2010", lineHeight: 1.85, margin: 0 }}>
                    The mitochondrial hypothesis suggests that aerobic eukaryotes descended from a fateful endosymbiotic event where an ancestral archaeon engulfed an alpha-proteobacterium.
                </p>

                {/* Highlight target sentence */}
                <div
                    onClick={!selected ? handleSelect : undefined}
                    style={{
                        background: selected ? "rgba(184,150,106,0.14)" : "transparent",
                        borderRadius: 5, padding: selected ? "3px 5px" : "3px 0",
                        cursor: selected ? "default" : "pointer",
                        transition: "all 0.3s ease",
                        border: selected ? "1.5px solid rgba(184,150,106,0.4)" : "1.5px solid transparent",
                    }}
                >
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(12px, 1.4vw, 14.5px)", color: "#2a2010", lineHeight: 1.85, margin: 0 }}>
                        This symbiosis ultimately led to the transfer of most mitochondrial genes to the nuclear genome, creating a state of genomic interdependence unprecedented in prokaryotic lineages.
                    </p>
                </div>

                {!selected && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#b8a888", margin: 0, fontStyle: "italic", textAlign: "center" }}>← Tap the second paragraph to explain it</p>
                )}

                {/* Explanation card */}
                <div style={{
                    background: "#fff", border: "1px solid #e0d4c0", borderRadius: 10,
                    padding: "13px 16px",
                    opacity: showExplanation ? 1 : 0,
                    transform: showExplanation ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
                    transition: "opacity 0.45s ease, transform 0.45s cubic-bezier(0.34,1.4,0.64,1)",
                    boxShadow: "0 3px 12px rgba(26,21,16,0.07)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 5, background: "#1a1510", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 10, color: "#f5f0e8" }}>✦</span>
                        </div>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, fontWeight: 500, color: "#b8966a", textTransform: "uppercase", letterSpacing: "0.08em" }}>Plain English</span>
                    </div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#3a2e20", lineHeight: 1.65, margin: 0, fontWeight: 300 }}>
                        Over time, most of the mitochondria's own DNA was moved into the cell's nucleus — so now the cell and its mitochondria depend completely on each other to survive. Neither could exist alone.
                    </p>
                </div>
            </div>

            <div style={{ position: "absolute", bottom: 18, right: 22, fontFamily: "'Playfair Display', serif", fontSize: 11, color: "#c8b898", fontStyle: "italic" }}>4</div>
        </div>
    );
};

// ─── Page 5: Smart Summary ────────────────────────────────────────────────────
const Page5 = () => {
    const [summarized, setSummarized] = useState(false);
    const [animating, setAnimating] = useState(false);

    const handleSummarize = () => {
        setAnimating(true);
        setTimeout(() => { setSummarized(true); setAnimating(false); }, 900);
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "28px 32px", position: "relative" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, fontWeight: 500, color: "#b8a888", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Feature · Smart summary</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(17px, 2vw, 22px)", fontWeight: 600, color: "#1a1510", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Long text, distilled.</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: "#9a8870", margin: "0 0 14px", fontWeight: 300 }}>Any section compressed into its core idea.</p>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>
                {/* Original paragraph */}
                <div style={{
                    background: "#fdf8f2", border: "1px solid #ede8df", borderRadius: 10, padding: "14px 16px",
                    maxHeight: summarized ? 50 : 200,
                    overflow: "hidden",
                    transition: "max-height 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease",
                    opacity: summarized ? 0.45 : 1,
                    position: "relative",
                }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#2a2010", lineHeight: 1.8, margin: 0 }}>
                        The industrial revolution brought profound changes to British society throughout the 18th and 19th centuries, transforming agrarian communities into urban industrial centers, reshaping labour markets, accelerating technological innovation, exacerbating class divisions, and fundamentally altering the relationship between citizens, labour, and capital in ways that economists and historians continue to debate today.
                    </p>
                    {!summarized && (
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 28, background: "linear-gradient(transparent, #fdf8f2)" }} />
                    )}
                </div>

                {/* Summarize button */}
                {!summarized && (
                    <button
                        onClick={handleSummarize}
                        disabled={animating}
                        style={{
                            alignSelf: "center",
                            padding: "8px 18px",
                            background: animating ? "#f0ebe3" : "#1a1510",
                            color: animating ? "#9a8870" : "#f5f0e8",
                            border: "none", borderRadius: 8, cursor: animating ? "wait" : "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, fontWeight: 500,
                            display: "flex", alignItems: "center", gap: 6, transition: "all 0.25s ease",
                        }}
                    >
                        {animating ? (
                            <><span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>◌</span> Summarising…</>
                        ) : (
                            <><span>✦</span> Summarise this section</>
                        )}
                    </button>
                )}

                {/* Summary card */}
                <div style={{
                    background: "#1a1510", borderRadius: 11, padding: "16px 18px",
                    opacity: summarized ? 1 : 0,
                    transform: summarized ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
                    transition: "opacity 0.5s ease 0.1s, transform 0.5s cubic-bezier(0.34,1.4,0.64,1) 0.1s",
                    pointerEvents: summarized ? "auto" : "none",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 500, color: "#b8966a", textTransform: "uppercase", letterSpacing: "0.1em" }}>AI Summary</span>
                        <div style={{ padding: "1px 7px", borderRadius: 10, background: "rgba(184,150,106,0.18)", border: "1px solid rgba(184,150,106,0.3)" }}>
                            <span style={{ fontSize: 9, fontFamily: "'DM Sans', sans-serif", color: "#d4a870" }}>1 sentence</span>
                        </div>
                    </div>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#e8d8b8", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                        "Britain's industrial revolution reshaped society from rural to urban, widened class divides, and permanently transformed how work, technology, and capital intersected."
                    </p>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ position: "absolute", bottom: 18, right: 22, fontFamily: "'Playfair Display', serif", fontSize: 11, color: "#c8b898", fontStyle: "italic" }}>5</div>
        </div>
    );
};

// ─── Page 6: Ask Questions ────────────────────────────────────────────────────
const Page6 = () => {
    const [messages, setMessages] = useState([]);
    const [typed, setTyped] = useState("");
    const [thinking, setThinking] = useState(false);
    const chatRef = useRef(null);

    const QUESTION = "What is the main idea of this chapter?";
    const ANSWER = "The chapter argues that knowledge is not passively received but actively constructed — shaped by culture, experience, and prior beliefs. Understanding is always interpretation.";

    const handleAsk = () => {
        if (!typed.trim() || thinking) return;
        const q = typed.trim();
        setTyped("");
        setMessages(m => [...m, { role: "user", text: q }]);
        setThinking(true);
        setTimeout(() => {
            setMessages(m => [...m, { role: "ai", text: ANSWER }]);
            setThinking(false);
        }, 1400);
    };

    const handlePrefill = () => setTyped(QUESTION);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages, thinking]);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "28px 32px", position: "relative" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, fontWeight: 500, color: "#b8a888", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Feature · Ask anything</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(17px, 2vw, 22px)", fontWeight: 600, color: "#1a1510", margin: "0 0 14px", letterSpacing: "-0.02em" }}>Your PDF answers back.</h2>

            {/* Chat area */}
            <div ref={chatRef} style={{ flex: 1, background: "#fdf8f2", border: "1px solid #ede8df", borderRadius: 10, padding: "12px 14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                {messages.length === 0 && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f0ebe3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💬</div>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#b8a888", margin: 0, textAlign: "center", fontStyle: "italic" }}>Ask a question about your PDF</p>
                        <button
                            onClick={handlePrefill}
                            style={{ padding: "6px 13px", background: "transparent", border: "1px solid #d4c8b4", borderRadius: 7, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: "#8a7a62" }}
                        >
                            Try: "What is the main idea?"
                        </button>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{
                            maxWidth: "82%", padding: "9px 13px", borderRadius: m.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                            background: m.role === "user" ? "#1a1510" : "#fff",
                            border: m.role === "ai" ? "1px solid #e8ddd0" : "none",
                            boxShadow: m.role === "ai" ? "0 2px 8px rgba(26,21,16,0.06)" : "none",
                        }}>
                            {m.role === "ai" && <div style={{ fontSize: 9, fontFamily: "'DM Sans', sans-serif", color: "#b8966a", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>ReadWise AI</div>}
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: m.role === "user" ? "#f5f0e8" : "#3a2e20", margin: 0, lineHeight: 1.62, fontWeight: 300 }}>{m.text}</p>
                        </div>
                    </div>
                ))}
                {thinking && (
                    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "6px 10px" }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#c8b898", animation: `bounce 1s ease ${i * 0.18}s infinite` }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Input */}
            <div style={{ display: "flex", gap: 8 }}>
                <input
                    value={typed}
                    onChange={e => setTyped(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAsk()}
                    placeholder="Ask about your PDF…"
                    style={{
                        flex: 1, padding: "9px 13px", border: "1px solid #e0d4c0", borderRadius: 9,
                        fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: "#2a2010",
                        background: "#fdf8f2", outline: "none",
                    }}
                />
                <button
                    onClick={handleAsk}
                    style={{ padding: "9px 16px", background: "#1a1510", color: "#f5f0e8", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 14, transition: "background 0.2s" }}
                >→</button>
            </div>

            <style>{`@keyframes bounce { 0%,60%,100% { transform:translateY(0); } 30% { transform:translateY(-5px); } }`}</style>
            <div style={{ position: "absolute", bottom: 18, right: 22, fontFamily: "'Playfair Display', serif", fontSize: 11, color: "#c8b898", fontStyle: "italic" }}>6</div>
        </div>
    );
};

// ─── Page 7: Progress & Retention ────────────────────────────────────────────
const Page7 = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setTimeout(() => setMounted(true), 200); }, []);

    const books = [
        { title: "Deep Work", progress: 78, color: "#b8966a" },
        { title: "The Innovators", progress: 45, color: "#8a9e7a" },
        { title: "Thinking Fast", progress: 92, color: "#9a7a9e" },
    ];

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "28px 32px", position: "relative" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, fontWeight: 500, color: "#b8a888", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Feature · Progress</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(17px, 2vw, 22px)", fontWeight: 600, color: "#1a1510", margin: "0 0 14px", letterSpacing: "-0.02em" }}>Track what you've read.</h2>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Streak */}
                <div style={{ background: "#1a1510", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, color: "#b8966a", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Reading streak</p>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#f5f0e8", margin: 0, lineHeight: 1 }}>14 <span style={{ fontSize: 14, fontWeight: 400, fontStyle: "italic", color: "#c8b898" }}>days</span></p>
                    </div>
                    <div style={{ display: "flex", gap: 3 }}>
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} style={{ width: 10, height: 28, borderRadius: 4, background: i < 6 ? "#b8966a" : "rgba(255,255,255,0.12)", transition: `height 0.4s ease ${0.05 * i}s` }} />
                        ))}
                    </div>
                </div>

                {/* Books progress */}
                <div style={{ background: "#fdf8f2", border: "1px solid #ede8df", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, fontWeight: 500, color: "#b8a888", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Current reads</p>
                    {books.map((b, i) => (
                        <div key={b.title}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: "#2a2010", fontWeight: 400 }}>{b.title}</span>
                                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: "#9a8870", fontWeight: 300 }}>{b.progress}%</span>
                            </div>
                            <div style={{ height: 5, background: "#ede8df", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: 3, background: b.color, width: mounted ? `${b.progress}%` : "0%", transition: `width 0.8s cubic-bezier(0.4,0,0.2,1) ${0.15 * i}s` }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[["47", "pages today"], ["3.2k", "words read"], ["12", "highlights"]].map(([n, l]) => (
                        <div key={l} style={{ background: "#f5f0e8", borderRadius: 9, padding: "10px 12px", border: "1px solid #e8ddd0" }}>
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: "#1a1510", margin: "0 0 2px", lineHeight: 1 }}>{n}</p>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#9a8870", margin: 0, fontWeight: 300 }}>{l}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ position: "absolute", bottom: 18, right: 22, fontFamily: "'Playfair Display', serif", fontSize: 11, color: "#c8b898", fontStyle: "italic" }}>7</div>
        </div>
    );
};

// ─── Page 8: Final ────────────────────────────────────────────────────────────
const Page8 = ({ onUploadClick }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 40px", textAlign: "center", background: "#1a1510", position: "relative", overflow: "hidden" }}>
            {/* Ambient orb */}
            <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(184,150,106,0.12) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />

            <div style={{
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
            }}>
                <div style={{ fontSize: 32, marginBottom: 20, opacity: 0.7 }}>✦</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, fontWeight: 500, color: "#b8966a", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 20px" }}>ReadWise</p>
                <p style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "clamp(18px, 2.5vw, 26px)",
                    fontStyle: "italic", color: "#e8d8b8",
                    lineHeight: 1.5, margin: "0 0 10px", fontWeight: 500,
                }}>
                    "The best reading tool<br />disappears."
                </p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(16px, 2vw, 22px)", color: "#f5f0e8", lineHeight: 1.5, margin: "0 0 30px", fontWeight: 600 }}>
                    Only understanding remains.
                </p>
                <button
                    onClick={onUploadClick}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "12px 26px", background: "#f5f0e8", color: "#1a1510",
                        border: "none", borderRadius: 10, cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 500,
                        letterSpacing: "0.02em", transition: "all 0.22s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#f5f0e8"; }}
                >
                    Upload your first PDF
                    <span style={{ fontSize: 16 }}>→</span>
                </button>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 14 }}>No account needed · Free to start</p>
            </div>

            <div style={{ position: "absolute", bottom: 18, right: 22, fontFamily: "'Playfair Display', serif", fontSize: 11, color: "#5a4a38", fontStyle: "italic" }}>8</div>
        </div>
    );
};

// ─── Book Container ───────────────────────────────────────────────────────────
const PAGES = [Page1, Page2, Page3, Page4, Page5, Page6, Page7, Page8];
const PAGE_TITLES = ["Welcome", "Getting Started", "Word Clarity", "Sentence Clarity", "Smart Summary", "Ask Questions", "Your Progress", "Begin Reading"];

const BookContainer = ({ onUploadClick }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [flipping, setFlipping] = useState(false);
    const [flipDir, setFlipDir] = useState("next");
    const [displayedPage, setDisplayedPage] = useState(0);
    const [hoverZone, setHoverZone] = useState(null); // "left" | "right" | null
    const [showIndicator, setShowIndicator] = useState(false);
    const indicatorTimer = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const totalPages = PAGES.length;

    const goTo = (idx) => {
        if (idx === currentPage || flipping || idx < 0 || idx >= totalPages) return;
        setFlipDir(idx > currentPage ? "next" : "prev");
        setFlipping(true);
        setTimeout(() => {
            setDisplayedPage(idx);
            setCurrentPage(idx);
        }, 220);
        setTimeout(() => setFlipping(false), 440);
        // Flash the indicator briefly
        setShowIndicator(true);
        clearTimeout(indicatorTimer.current);
        indicatorTimer.current = setTimeout(() => setShowIndicator(false), 1800);
    };

    // Touch swipe
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
            if (dx < 0) goTo(currentPage + 1);
            else goTo(currentPage - 1);
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    // Keyboard
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(currentPage + 1);
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(currentPage - 1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [currentPage, flipping]);

    useEffect(() => () => clearTimeout(indicatorTimer.current), []);

    const PageComp = PAGES[displayedPage];
    const isDark = displayedPage === totalPages - 1;
    const pageProps = { onNext: () => goTo(displayedPage + 1), onUploadClick };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 0, margin: 0 }}>
            <style>{`
        ${FONTS}
        @keyframes flipNext {
          0%   { transform: perspective(1100px) rotateY(0deg) scale(1);    opacity: 1; }
          40%  { transform: perspective(1100px) rotateY(-14deg) scale(0.985); opacity: 0.88; }
          60%  { transform: perspective(1100px) rotateY(-14deg) scale(0.985); opacity: 0.88; }
          100% { transform: perspective(1100px) rotateY(0deg) scale(1);    opacity: 1; }
        }
        @keyframes flipPrev {
          0%   { transform: perspective(1100px) rotateY(0deg) scale(1);    opacity: 1; }
          40%  { transform: perspective(1100px) rotateY(14deg) scale(0.985);  opacity: 0.88; }
          60%  { transform: perspective(1100px) rotateY(14deg) scale(0.985);  opacity: 0.88; }
          100% { transform: perspective(1100px) rotateY(0deg) scale(1);    opacity: 1; }
        }
        @keyframes indicatorFade {
          0%   { opacity: 0; transform: translateX(-50%) translateY(4px); }
          15%  { opacity: 1; transform: translateX(-50%) translateY(0); }
          70%  { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-3px); }
        }
        .rw-zone-left,
        .rw-zone-right {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: auto;
        height: auto;
        z-index: 20;
        cursor: pointer;
        }
        .rw-zone-left  { left: 7px;  justify-content: flex-start; border-radius: 0; }
        .rw-zone-right { right: 7px; justify-content: flex-end;   border-radius: 0; }
        .rw-zone-left:hover  { background: rgba(26,21,16,0.035); }
        .rw-zone-right:hover { background: rgba(26,21,16,0.035); }
        .rw-zone-left.dark:hover  { background: rgba(255,255,255,0.04); }
        .rw-zone-right.dark:hover { background: rgba(255,255,255,0.04); }
        .rw-arrow {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            margin: 8px;

            opacity: 1;
            transform: scale(1);

            transition: transform 0.2s ease;
        }
        .rw-zone-left:hover  .rw-arrow { opacity: 1; transform: scale(1); }
        .rw-zone-right:hover .rw-arrow { opacity: 1; transform: scale(1); }
      `}</style>

            {/* Book — fills entire container */}
            <div
                style={{ position: "relative", flex: 1, width: "100%", minHeight: 0 }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Depth shadow layers */}
                <div style={{ position: "absolute", inset: 0, transform: "translateX(6px) translateY(9px)", background: "rgba(26,21,16,0.09)", borderRadius: 0, filter: "blur(6px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 0, transform: "translateX(3px) translateY(4px)", background: "rgba(26,21,16,0.05)", borderRadius: 0, pointerEvents: "none" }} />
                {/* Stacked pages peaking at bottom-right */}
                <div style={{ position: "absolute", inset: 0, background: "#ece6da", borderRadius: 0, border: "1px solid #d4ccbf", transform: "translate(2px, 2px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 0, background: "#f2ece2", borderRadius: 0, border: "1px solid #ddd5c8", transform: "translate(1px, 1px)", pointerEvents: "none" }} />

                {/* Main page surface */}
                <div style={{
                    position: "absolute", inset: 0, borderRadius: 0,
                    background: isDark ? "#1a1510" : "#fdf8f2",
                    border: `1px solid ${isDark ? "#2e2519" : "#e2dbd0"}`,
                    overflow: "hidden",
                    transformOrigin: "center center",
                    animation: flipping ? `${flipDir === "next" ? "flipNext" : "flipPrev"} 0.46s cubic-bezier(0.4,0,0.2,1)` : "none",
                    boxShadow: "inset 3px 0 12px rgba(0,0,0,0.03)",
                }}>
                    {/* Paper ruled lines texture */}
                    {!isDark && (
                        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
                            {Array.from({ length: 32 }).map((_, i) => (
                                <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${3 + i * 3.1}%`, height: "0.5px", background: "rgba(196,182,164,0.2)" }} />
                            ))}
                            <div style={{ position: "absolute", left: 46, top: 0, bottom: 0, width: "0.5px", background: "rgba(196,182,164,0.28)" }} />
                        </div>
                    )}

                    {/* Page content */}
                    <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
                        <PageComp {...pageProps} />
                    </div>

                    {/* Left hover zone — prev page */}
                    {currentPage > 0 && (
                        <div
                            className={`rw-zone-left${isDark ? " dark" : ""}`}
                            onClick={() => goTo(currentPage - 1)}
                            onMouseEnter={() => setHoverZone("left")}
                            onMouseLeave={() => setHoverZone(null)}
                        >
                            <div
                                className="rw-arrow"
                                style={{
                                    background: isDark ? "rgba(255,255,255,0.08)" : "rgba(26,21,16,0.07)",
                                    color: isDark ? "#e8d8b8" : "#3a2e20",
                                }}
                            >‹</div>
                        </div>
                    )}

                    {/* Right hover zone — next page */}
                    {currentPage < totalPages - 1 && (
                        <div
                            className={`rw-zone-right${isDark ? " dark" : ""}`}
                            onClick={() => goTo(currentPage + 1)}
                            onMouseEnter={() => setHoverZone("right")}
                            onMouseLeave={() => setHoverZone(null)}
                        >
                            <div
                                className="rw-arrow"
                                style={{
                                    background: isDark ? "rgba(255,255,255,0.08)" : "rgba(26,21,16,0.07)",
                                    color: isDark ? "#e8d8b8" : "#3a2e20",
                                }}
                            >›</div>
                        </div>
                    )}
                </div>

                {/* Floating chapter indicator — appears briefly after nav */}
                <div style={{
                    position: "absolute", bottom: 20, left: "50%",
                    transform: "translateX(-50%)",
                    pointerEvents: "none", zIndex: 30,
                    animation: showIndicator ? "indicatorFade 1.8s ease forwards" : "none",
                    opacity: 0,
                }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "4px 12px", borderRadius: 20,
                        background: isDark ? "rgba(255,255,255,0.07)" : "rgba(26,21,16,0.06)",
                        backdropFilter: "blur(6px)",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(26,21,16,0.07)"}`,
                    }}>
                        <span style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, letterSpacing: "0.06em",
                            color: isDark ? "rgba(232,216,184,0.7)" : "rgba(58,46,32,0.5)",
                            fontWeight: 400,
                        }}>
                            {currentPage + 1} / {totalPages}
                        </span>
                        <span style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.04em",
                            color: isDark ? "rgba(184,150,106,0.6)" : "rgba(184,150,106,0.8)",
                            fontWeight: 300,
                        }}>
                            {PAGE_TITLES[currentPage]}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Export ───────────────────────────────────────────────────────────────────
export default BookContainer;