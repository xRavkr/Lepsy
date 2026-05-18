import { useState, useEffect } from "react";

const formatTime = (seconds) => {
  if (seconds < 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// Medication presets based on real narcolepsy meds
const MED_PRESETS = {
  xywav: {
    id: "xywav",
    name: "Xywav",
    type: "oxybate",
    morningDose: false,
    hasFoodTimer: true,
    foodWaitHours: 2,
    hasAlcoholTimer: true,
    alcoholRules: { drink1Hours: 4, drink2Hours: 6, maxDrinks: 2 },
    hasNightDoses: true,
    doseGapHours: 2,
    defaultCutoffHour: 5,
    description: "Two nighttime doses · no food within 2hr · alcohol caution",
  },
  xyrem: {
    id: "xyrem",
    name: "Xyrem",
    type: "oxybate",
    morningDose: false,
    hasFoodTimer: true,
    foodWaitHours: 2,
    hasAlcoholTimer: true,
    alcoholRules: { drink1Hours: 4, drink2Hours: 6, maxDrinks: 2 },
    hasNightDoses: true,
    doseGapHours: 2.5,
    defaultCutoffHour: 5,
    description: "Two nighttime doses · no food within 2hr · alcohol caution",
  },
  modafinil: {
    id: "modafinil",
    name: "Modafinil",
    type: "stimulant",
    morningDose: true,
    hasFoodTimer: false,
    hasAlcoholTimer: false,
    hasNightDoses: false,
    description: "Morning stimulant · take early to avoid sleep disruption",
  },
  armodafinil: {
    id: "armodafinil",
    name: "Armodafinil",
    type: "stimulant",
    morningDose: true,
    hasFoodTimer: false,
    hasAlcoholTimer: false,
    hasNightDoses: false,
    description: "Morning stimulant · long acting",
  },
  adderall: {
    id: "adderall",
    name: "Adderall",
    type: "stimulant",
    morningDose: true,
    hasFoodTimer: false,
    hasAlcoholTimer: false,
    hasNightDoses: false,
    description: "Stimulant · usually morning and afternoon",
  },
  vyvanse: {
    id: "vyvanse",
    name: "Vyvanse",
    type: "stimulant",
    morningDose: true,
    hasFoodTimer: false,
    hasAlcoholTimer: false,
    hasNightDoses: false,
    description: "Long-acting stimulant · take in morning",
  },
  sunosi: {
    id: "sunosi",
    name: "Sunosi",
    type: "wake_promoter",
    morningDose: true,
    hasFoodTimer: false,
    hasAlcoholTimer: false,
    hasNightDoses: false,
    description: "Wake-promoting agent · once daily",
  },
  wakix: {
    id: "wakix",
    name: "Wakix",
    type: "wake_promoter",
    morningDose: true,
    hasFoodTimer: false,
    hasAlcoholTimer: false,
    hasNightDoses: false,
    description: "Non-stimulant · once daily morning",
  },
  other: {
    id: "other",
    name: "Other",
    type: "custom",
    morningDose: true,
    hasFoodTimer: false,
    hasAlcoholTimer: false,
    hasNightDoses: false,
    description: "Custom medication — configure your own timers",
  },
};

const Icon = ({ name, size = 22 }) => {
  const icons = {
    pill: <><ellipse cx="12" cy="12" rx="9" ry="4.5" transform="rotate(-45 12 12)" /><line x1="8.5" y1="15.5" x2="15.5" y2="8.5" /></>,
    log: <><rect x="4" y="3" width="16" height="18" rx="2" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="12" y2="16" /></>,
    id: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M5 19c0-2 2-3 4-3s4 1 4 3" /><line x1="15" y1="9" x2="19" y2="9" /><line x1="15" y1="13" x2="17" y2="13" /></>,
    moon: <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />,
    check: <polyline points="20 6 9 17 4 12" />,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    home: <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ─── ONBOARDING / MED SETUP ────────────────────────────────────────────────
function SetupScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedMedId, setSelectedMedId] = useState(null);
  const [customName, setCustomName] = useState("");
  const [customConfig, setCustomConfig] = useState({
    morningDose: true,
    hasFoodTimer: false,
    foodWaitHours: 2,
    hasAlcoholTimer: false,
    alcoholHours: 4,
    hasNightDoses: false,
    doseGapHours: 2,
    defaultCutoffHour: 5,
  });

  const medList = Object.values(MED_PRESETS);

  const finish = () => {
    if (selectedMedId === "other") {
      onComplete({
        ...MED_PRESETS.other,
        name: customName || "My Medication",
        ...customConfig,
        alcoholRules: customConfig.hasAlcoholTimer ? { drink1Hours: customConfig.alcoholHours, drink2Hours: customConfig.alcoholHours + 2, maxDrinks: 2 } : null,
      });
    } else {
      onComplete(MED_PRESETS[selectedMedId]);
    }
  };

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <div className="setup-tag">SETUP</div>
        <h1 className="setup-title">Which medication{step === 1 && selectedMedId === "other" ? "" : "?"}</h1>
        <p className="setup-sub">
          {step === 0 ? "We'll customise your timers based on your medication." : "Configure your timers below."}
        </p>
      </div>

      {step === 0 && (
        <>
          <div className="med-list">
            {medList.map(m => (
              <button key={m.id} className={`med-option ${selectedMedId === m.id ? "selected" : ""}`} onClick={() => setSelectedMedId(m.id)}>
                <div className="med-option-main">
                  <span className="med-option-name">{m.name}</span>
                  <span className={`med-option-tag tag-${m.type}`}>{m.type.replace("_", " ")}</span>
                </div>
                <span className="med-option-desc">{m.description}</span>
              </button>
            ))}
          </div>
          <button className="setup-btn" disabled={!selectedMedId} onClick={() => selectedMedId === "other" ? setStep(1) : finish()}>
            Continue <Icon name="arrow" size={18} />
          </button>
        </>
      )}

      {step === 1 && selectedMedId === "other" && (
        <div className="custom-form">
          <div className="field-group">
            <label className="field-label">Medication Name</label>
            <input className="field-input" placeholder="e.g. Sodium Oxybate" value={customName} onChange={e => setCustomName(e.target.value)} />
          </div>

          <div className="toggle-row">
            <div>
              <p className="toggle-title">Morning Dose</p>
              <p className="toggle-desc">Tap to log morning medication</p>
            </div>
            <button className={`toggle ${customConfig.morningDose ? "on" : ""}`} onClick={() => setCustomConfig(p => ({ ...p, morningDose: !p.morningDose }))}>
              <span className="toggle-dot" />
            </button>
          </div>

          <div className="toggle-row">
            <div>
              <p className="toggle-title">Food Timer</p>
              <p className="toggle-desc">Wait period after eating before dose</p>
            </div>
            <button className={`toggle ${customConfig.hasFoodTimer ? "on" : ""}`} onClick={() => setCustomConfig(p => ({ ...p, hasFoodTimer: !p.hasFoodTimer }))}>
              <span className="toggle-dot" />
            </button>
          </div>
          {customConfig.hasFoodTimer && (
            <div className="inline-config">
              <label>Hours to wait after food</label>
              <select value={customConfig.foodWaitHours} onChange={e => setCustomConfig(p => ({ ...p, foodWaitHours: parseInt(e.target.value) }))}>
                {[1, 2, 3, 4].map(h => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          )}

          <div className="toggle-row">
            <div>
              <p className="toggle-title">Alcohol Timer</p>
              <p className="toggle-desc">Wait period after drinking</p>
            </div>
            <button className={`toggle ${customConfig.hasAlcoholTimer ? "on" : ""}`} onClick={() => setCustomConfig(p => ({ ...p, hasAlcoholTimer: !p.hasAlcoholTimer }))}>
              <span className="toggle-dot" />
            </button>
          </div>
          {customConfig.hasAlcoholTimer && (
            <div className="inline-config">
              <label>Hours per drink</label>
              <select value={customConfig.alcoholHours} onChange={e => setCustomConfig(p => ({ ...p, alcoholHours: parseInt(e.target.value) }))}>
                {[2, 3, 4, 5, 6].map(h => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          )}

          <div className="toggle-row">
            <div>
              <p className="toggle-title">Two Nighttime Doses</p>
              <p className="toggle-desc">Split dose with gap between</p>
            </div>
            <button className={`toggle ${customConfig.hasNightDoses ? "on" : ""}`} onClick={() => setCustomConfig(p => ({ ...p, hasNightDoses: !p.hasNightDoses }))}>
              <span className="toggle-dot" />
            </button>
          </div>
          {customConfig.hasNightDoses && (
            <div className="inline-config">
              <label>Gap between doses</label>
              <select value={customConfig.doseGapHours} onChange={e => setCustomConfig(p => ({ ...p, doseGapHours: parseFloat(e.target.value) }))}>
                {[1.5, 2, 2.5, 3, 3.5, 4].map(h => <option key={h} value={h}>{h} hours</option>)}
              </select>
            </div>
          )}

          <button className="setup-btn" onClick={finish}>
            Save & Continue <Icon name="arrow" size={18} />
          </button>
          <button className="back-btn" onClick={() => setStep(0)}>← Back</button>
        </div>
      )}

      <p className="setup-disclaimer">
        Always follow your prescribing doctor's instructions. This app supports — it does not replace — medical advice.
      </p>
    </div>
  );
}

// ─── HOME ──────────────────────────────────────────────────────────────────
function HomeScreen({ setScreen, medState, logEntries, medConfig }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayLogs = logEntries.filter(e => new Date(e.time).toDateString() === new Date().toDateString());

  return (
    <div className="screen home-screen">
      <div className="home-header">
        <div className="greeting-tag">LEPSY · {medConfig.name.toUpperCase()}</div>
        <h1 className="greeting">{greeting}</h1>
        <p className="subtitle">Your daily companion</p>
      </div>

      <div className="status-strip">
        <div className="status-item">
          <span className="status-num">{todayLogs.length}</span>
          <span className="status-label">Logs today</span>
        </div>
        {medConfig.morningDose && (
          <>
            <div className="status-divider" />
            <div className="status-item">
              <span className="status-num" style={{ color: medState.morningTaken ? "#86efac" : "#94a3b8" }}>
                {medState.morningTaken ? "✓" : "—"}
              </span>
              <span className="status-label">Morning</span>
            </div>
          </>
        )}
        {medConfig.hasNightDoses && (
          <>
            <div className="status-divider" />
            <div className="status-item">
              <span className="status-num" style={{ color: medState.dose1Taken ? "#86efac" : "#94a3b8" }}>
                {medState.dose1Taken ? "✓" : "—"}
              </span>
              <span className="status-label">Night dose</span>
            </div>
          </>
        )}
      </div>

      <div className="quick-grid">
        <button className="quick-card primary" onClick={() => setScreen("medication")}>
          <Icon name="pill" size={28} />
          <span className="qc-title">{medConfig.name}</span>
          <small>Track your doses</small>
        </button>
        <button className="quick-card" onClick={() => setScreen("log")}>
          <Icon name="log" size={28} />
          <span className="qc-title">Log Entry</span>
          <small>Symptoms & triggers</small>
        </button>
        <button className="quick-card" onClick={() => setScreen("medicalid")}>
          <Icon name="id" size={28} />
          <span className="qc-title">Medical ID</span>
          <small>Emergency info</small>
        </button>
        <button className="quick-card" onClick={() => setScreen("nap")}>
          <Icon name="moon" size={28} />
          <span className="qc-title">Nap Tracker</span>
          <small>Track rest sessions</small>
        </button>
      </div>

      {todayLogs.length > 0 && (
        <div className="recent-section">
          <p className="section-label">TODAY</p>
          {todayLogs.slice(-3).reverse().map((e, i) => (
            <div key={i} className="log-pill">
              <span className="log-type-dot" style={{ background: e.type === "sleep_attack" ? "#fb7185" : e.type === "cataplexy" ? "#fb923c" : e.type === "nap" ? "#a78bfa" : "#94a3b8" }} />
              <span className="log-pill-type">{e.type.replace("_", " ")}</span>
              <span className="log-pill-time">{new Date(e.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MEDICATION ────────────────────────────────────────────────────────────
function MedicationScreen({ medState, setMedState, medConfig, onChangeMed }) {
  useEffect(() => {
    const timer = setInterval(() => {
      setMedState(prev => {
        const now = { ...prev };
        if (now.foodTimer > 0) now.foodTimer--;
        if (now.alcoholTimer > 0) now.alcoholTimer--;
        if (now.dose1Taken && !now.dose2Taken) now.dose1Elapsed = (now.dose1Elapsed || 0) + 1;
        return now;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [setMedState]);

  const takeMorningMed = () => setMedState(p => ({ ...p, morningTaken: true, morningTime: new Date().toISOString() }));
  const logFood = () => setMedState(p => ({ ...p, foodTimer: medConfig.foodWaitHours * 3600, foodTime: new Date().toISOString() }));
  const logAlcohol = () => setMedState(p => {
    const drinks = (p.alcoholDrinks || 0) + 1;
    const rules = medConfig.alcoholRules;
    if (drinks > rules.maxDrinks) return { ...p, alcoholDrinks: drinks, alcoholTimer: 0, alcoholExceeded: true };
    const hours = drinks === 1 ? rules.drink1Hours : rules.drink2Hours;
    return { ...p, alcoholDrinks: drinks, alcoholTimer: hours * 3600, alcoholTime: new Date().toISOString() };
  });
  const takeDose1 = () => setMedState(p => ({ ...p, dose1Taken: true, dose1Time: new Date().toISOString(), dose1Elapsed: 0 }));
  const takeDose2 = () => {
    const cutoffHour = medState.cutoffHour ?? medConfig.defaultCutoffHour ?? 5;
    const now = new Date();
    const pastCutoff = now.getHours() >= cutoffHour && now.getHours() < 12;
    if (pastCutoff) return;
    setMedState(p => ({ ...p, dose2Taken: true, dose2Time: new Date().toISOString() }));
  };
  const resetAll = () => setMedState({
    morningTaken: false, foodTimer: 0, alcoholTimer: 0, alcoholDrinks: 0,
    dose1Taken: false, dose2Taken: false, dose1Elapsed: 0, alcoholExceeded: false,
    cutoffHour: medConfig.defaultCutoffHour ?? 5
  });

  const doseGapSeconds = (medConfig.doseGapHours ?? 2) * 3600;
  const dose1Green = (medState.dose1Elapsed || 0) >= doseGapSeconds;
  const cutoffHour = medState.cutoffHour ?? medConfig.defaultCutoffHour ?? 5;
  const nowDate = new Date();
  const pastCutoff = medState.dose1Taken && nowDate.getHours() >= cutoffHour && nowDate.getHours() < 12;
  const bothTimersDone = medConfig.hasFoodTimer && medConfig.hasAlcoholTimer && medState.foodTimer === 0 && medState.alcoholTimer === 0 && (medState.foodTime || medState.alcoholTime) && !medState.alcoholExceeded;

  return (
    <div className="screen med-screen">
      <div className="med-header-row">
        <div>
          <h2 className="screen-title">{medConfig.name}</h2>
          <p className="screen-sub">{medConfig.description}</p>
        </div>
        <button className="change-med-btn" onClick={onChangeMed}>
          <Icon name="settings" size={18} />
        </button>
      </div>

      {medConfig.morningDose && (
        <div className="med-card">
          <div className="med-card-header">
            <Icon name="zap" size={18} />
            <span>Morning Medication</span>
          </div>
          {medState.morningTaken ? (
            <div className="taken-badge">
              <Icon name="check" size={16} /> Taken at {new Date(medState.morningTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          ) : (
            <button className="med-btn" onClick={takeMorningMed}>Tap when taken</button>
          )}
        </div>
      )}

      {medConfig.hasFoodTimer && (
        <div className="med-card">
          <div className="med-card-header">
            <span style={{ fontSize: 18 }}>🍽</span>
            <span>Last Food Timer</span>
          </div>
          <div className={`big-timer ${medState.foodTimer === 0 && medState.foodTime ? "timer-done" : ""}`}>
            {formatTime(medState.foodTimer)}
          </div>
          <p className="timer-sub">{medConfig.foodWaitHours} hour{medConfig.foodWaitHours > 1 ? "s" : ""} must pass after eating</p>
          <button className="med-btn" onClick={logFood}>Tap when you finish eating</button>
        </div>
      )}

      {medConfig.hasAlcoholTimer && (
        <div className="med-card">
          <div className="med-card-header">
            <span style={{ fontSize: 18 }}>🍺</span>
            <span>Alcohol Timer</span>
          </div>
          {medState.alcoholExceeded ? (
            <div className="alert-badge">⚠️ Limit exceeded — do not take {medConfig.name} tonight</div>
          ) : (
            <>
              <div className={`big-timer ${medState.alcoholTimer === 0 && medState.alcoholTime ? "timer-done" : ""}`}>
                {formatTime(Math.max(0, medState.alcoholTimer))}
              </div>
              <p className="timer-sub">
                {!medState.alcoholDrinks
                  ? `1 drink → ${medConfig.alcoholRules.drink1Hours}hr · 2 drinks → ${medConfig.alcoholRules.drink2Hours}hr`
                  : `${medState.alcoholDrinks} drink${medState.alcoholDrinks > 1 ? "s" : ""} logged`}
              </p>
              <button className="med-btn" onClick={logAlcohol}>Log a drink</button>
            </>
          )}
        </div>
      )}

      {bothTimersDone && (
        <div className="ready-banner">✓ Both timers complete — safe to take {medConfig.name}</div>
      )}

      {medConfig.hasNightDoses && (
        <div className="med-card">
          <div className="med-card-header">
            <Icon name="moon" size={18} />
            <span>Nighttime Doses</span>
          </div>

          <div className="dose-grid">
            <div className="dose-block">
              <p className="dose-label">Dose 1</p>
              {medState.dose1Taken ? (
                <div className="taken-badge small">✓ {new Date(medState.dose1Time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              ) : (
                <button className="med-btn small" onClick={takeDose1}>Tap when taken</button>
              )}
            </div>

            {medState.dose1Taken && !medState.dose2Taken && (
              <div className="dose-block">
                <p className="dose-label">Time since dose 1</p>
                <div className={`elapsed-timer ${dose1Green ? "elapsed-green" : ""}`}>
                  {formatTime(medState.dose1Elapsed || 0)}
                </div>
                {dose1Green ? <p className="dose-sub green">✓ Dose 2 window open</p> : <p className="dose-sub">Wait {medConfig.doseGapHours}hr</p>}
              </div>
            )}
          </div>

          {medState.dose1Taken && !medState.dose2Taken && (
            <div className="dose-grid" style={{ marginTop: 14 }}>
              <div className="dose-block">
                <p className="dose-label">Dose 2</p>
                {pastCutoff ? (
                  <div className="alert-badge small">⛔ Past {String(cutoffHour).padStart(2, "0")}:00</div>
                ) : (
                  <button className="med-btn small" onClick={takeDose2} disabled={!dose1Green}>
                    {dose1Green ? "Tap when taken" : "Not ready"}
                  </button>
                )}
              </div>
              <div className="dose-block">
                <p className="dose-label">Cutoff time</p>
                <select className="cutoff-select" value={cutoffHour} onChange={e => setMedState(p => ({ ...p, cutoffHour: parseInt(e.target.value) }))}>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(h => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
                </select>
              </div>
            </div>
          )}

          {medState.dose2Taken && (
            <div className="taken-badge" style={{ marginTop: 12 }}>✓ Dose 2 taken at {new Date(medState.dose2Time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          )}
        </div>
      )}

      {!medConfig.morningDose && !medConfig.hasFoodTimer && !medConfig.hasAlcoholTimer && !medConfig.hasNightDoses && (
        <div className="empty-med-state">
          <p>No timers configured for {medConfig.name}.</p>
          <button className="med-btn" onClick={onChangeMed}>Configure medication</button>
        </div>
      )}

      <button className="reset-btn" onClick={resetAll}>Reset all timers</button>
    </div>
  );
}

// ─── LOG ───────────────────────────────────────────────────────────────────
function LogScreen({ logEntries, setLogEntries }) {
  const [type, setType] = useState("sleep_attack");
  const [notes, setNotes] = useState("");
  const [severity, setSeverity] = useState(3);
  const [saved, setSaved] = useState(false);

  const logTypes = [
    { id: "sleep_attack", label: "Sleep Attack", color: "#fb7185" },
    { id: "cataplexy", label: "Cataplexy", color: "#fb923c" },
    { id: "brain_fog", label: "Brain Fog", color: "#94a3b8" },
    { id: "good_moment", label: "Good Moment", color: "#86efac" },
  ];

  const submit = () => {
    setLogEntries(p => [...p, { type, notes, severity, time: new Date().toISOString() }]);
    setNotes(""); setSeverity(3); setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="screen log-screen">
      <h2 className="screen-title">Log Entry</h2>
      <p className="screen-sub">Quick logs build up the picture for your sleep doctor</p>

      <p className="section-label">TYPE</p>
      <div className="type-grid">
        {logTypes.map(t => (
          <button key={t.id} className={`type-btn ${type === t.id ? "active" : ""}`}
            style={{ "--dot": t.color }} onClick={() => setType(t.id)}>
            <span className="type-dot" />
            {t.label}
          </button>
        ))}
      </div>

      <p className="section-label">SEVERITY (1–5)</p>
      <div className="severity-row">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} className={`sev-btn ${severity === n ? "active" : ""}`} onClick={() => setSeverity(n)}>{n}</button>
        ))}
      </div>

      <p className="section-label">NOTES (OPTIONAL)</p>
      <textarea className="notes-input" placeholder="What were you doing? Any triggers?" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />

      <button className="submit-btn" onClick={submit}>
        {saved ? <><Icon name="check" size={18} /> Saved</> : "Log it"}
      </button>

      {logEntries.length > 0 && (
        <>
          <p className="section-label" style={{ marginTop: 28 }}>RECENT ENTRIES</p>
          <div className="entries-list">
            {[...logEntries].reverse().slice(0, 8).map((e, i) => {
              const t = logTypes.find(x => x.id === e.type) || { label: e.type.replace("_", " "), color: "#a78bfa" };
              return (
                <div key={i} className="entry-card">
                  <div className="entry-header">
                    <span className="entry-type-dot" style={{ background: t.color }} />
                    <span className="entry-type">{t.label}</span>
                    <span className="entry-sev">{e.severity}/5</span>
                    <span className="entry-time">{new Date(e.time).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {e.notes && <p className="entry-notes">{e.notes}</p>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── MEDICAL ID ────────────────────────────────────────────────────────────
// Simple QR code generator (pure JS, no dependencies)
// Uses a basic implementation suitable for short emergency text
function generateQRCode(text, size = 200) {
  // We'll use a free public QR code rendering API as a fallback approach.
  // For a real production build, swap this for a local library like qrcode.js
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=0f172a&margin=2`;
}

function MedicalIDScreen({ medConfig }) {
  const [editing, setEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [info, setInfo] = useState({
    name: "",
    condition: "",
    medications: medConfig.name === "Other" ? "" : medConfig.name,
    emergencyName: "",
    emergencyPhone: "",
    notes: "",
  });

  const fields = [
    { key: "name", label: "Full Name", placeholder: "Your name" },
    { key: "condition", label: "Condition", placeholder: "e.g. Narcolepsy Type 1 with cataplexy" },
    { key: "medications", label: "Medications", placeholder: "List your medications and doses" },
    { key: "emergencyName", label: "Emergency Contact", placeholder: "Contact name" },
    { key: "emergencyPhone", label: "Emergency Phone", placeholder: "Phone number" },
    { key: "notes", label: "Notes for first responders", placeholder: "Anything responders should know (e.g. how to recognise cataplexy)", textarea: true },
  ];

  const hasAnyInfo = Object.values(info).some(v => v && v.trim().length > 0);

  // Build the QR payload — plain text, scannable by any phone camera
  const qrPayload = [
    info.name && `Name: ${info.name}`,
    info.condition && `Condition: ${info.condition}`,
    info.medications && `Meds: ${info.medications}`,
    info.emergencyName && `Emergency Contact: ${info.emergencyName}`,
    info.emergencyPhone && `Phone: ${info.emergencyPhone}`,
    info.notes && `Notes: ${info.notes}`,
  ].filter(Boolean).join("\n");

  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = generateQRCode(qrPayload, 600);
    link.download = "medical-id-qr.png";
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="screen medid-screen">
      <div className="medid-header">
        <div className="medid-badge">EMERGENCY INFO</div>
        <h2 className="screen-title">Medical ID</h2>
        <p className="medid-sub">Your information for emergencies</p>
      </div>

      <div className="disclaimer">
        <strong style={{ color: "#cbd5e1" }}>How to make this useful in a real emergency:</strong><br /><br />
        First responders won't open this app on a locked phone. Generate the QR code below and print it on a wallet card, bracelet, or sticker on your phone case. Anyone can scan it with their phone camera — no app required.
      </div>

      {!editing && !showQR && (
        <>
          <div className="medid-card">
            {fields.map(f => (
              <div key={f.key} className="medid-row">
                <span className="medid-label">{f.label}</span>
                <span className="medid-value">{info[f.key] || <em style={{ opacity: 0.4 }}>Not set</em>}</span>
              </div>
            ))}
          </div>

          <button className="submit-btn" onClick={() => setEditing(true)} style={{ marginBottom: 10 }}>
            {hasAnyInfo ? "Edit Information" : "Add Your Information"}
          </button>

          {hasAnyInfo && (
            <button className="qr-btn" onClick={() => setShowQR(true)}>
              Generate Emergency QR Code
            </button>
          )}
        </>
      )}

      {editing && (
        <div className="edit-form">
          {fields.map(f => (
            <div key={f.key} className="field-group">
              <label className="field-label">{f.label}</label>
              {f.textarea ? (
                <textarea className="notes-input" placeholder={f.placeholder} value={info[f.key]} onChange={e => setInfo(p => ({ ...p, [f.key]: e.target.value }))} rows={4} />
              ) : (
                <input className="field-input" placeholder={f.placeholder} value={info[f.key]} onChange={e => setInfo(p => ({ ...p, [f.key]: e.target.value }))} />
              )}
            </div>
          ))}
          <button className="submit-btn" onClick={() => setEditing(false)}>Save</button>
        </div>
      )}

      {showQR && (
        <div className="qr-view">
          <div className="qr-container">
            <img src={generateQRCode(qrPayload, 280)} alt="Medical ID QR Code" className="qr-image" />
          </div>
          <p className="qr-instructions">
            Scan with any phone camera to see your medical info instantly. Print this and keep it in your wallet, on your phone case, or on a medical bracelet.
          </p>
          <button className="submit-btn" onClick={downloadQR} style={{ marginBottom: 10 }}>
            Download QR Code
          </button>
          <button className="back-btn-medid" onClick={() => setShowQR(false)}>
            ← Back to Medical ID
          </button>
        </div>
      )}
    </div>
  );
}

// ─── NAP ───────────────────────────────────────────────────────────────────
function NapScreen({ logEntries, setLogEntries }) {
  const [napStart, setNapStart] = useState(null);
  const [napElapsed, setNapElapsed] = useState(0);
  const [feeling, setFeeling] = useState(3);
  const [napSaved, setNapSaved] = useState(false);

  useEffect(() => {
    if (!napStart) return;
    const t = setInterval(() => setNapElapsed(Math.floor((Date.now() - napStart) / 1000)), 1000);
    return () => clearInterval(t);
  }, [napStart]);

  const startNap = () => { setNapStart(Date.now()); setNapElapsed(0); };
  const endNap = () => {
    const mins = Math.round(napElapsed / 60);
    setLogEntries(p => [...p, { type: "nap", notes: `${mins} minute nap. Feeling ${feeling}/5 after.`, severity: feeling, time: new Date().toISOString() }]);
    setNapStart(null); setNapElapsed(0); setNapSaved(true);
    setTimeout(() => setNapSaved(false), 1800);
  };

  const napLogs = logEntries.filter(e => e.type === "nap").slice(-7).reverse();

  return (
    <div className="screen nap-screen">
      <h2 className="screen-title">Nap Tracker</h2>
      <p className="screen-sub">Quick tap to start, tap again when you wake</p>

      <div className="nap-card">
        {!napStart ? (
          <>
            <div className="nap-state-icon">🌙</div>
            <p className="nap-state-text">{napSaved ? "Nap saved" : "Ready when you are"}</p>
            <button className="nap-btn start" onClick={startNap}>Start Nap</button>
          </>
        ) : (
          <>
            <div className="nap-state-icon pulsing">😴</div>
            <p className="nap-state-text">Resting</p>
            <div className="nap-timer">{formatTime(napElapsed)}</div>
            <p className="section-label" style={{ textAlign: "center", marginTop: 18 }}>HOW DO YOU FEEL? (1–5)</p>
            <div className="severity-row" style={{ justifyContent: "center" }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} className={`sev-btn ${feeling === n ? "active" : ""}`} onClick={() => setFeeling(n)}>{n}</button>
              ))}
            </div>
            <button className="nap-btn end" onClick={endNap}>End Nap</button>
          </>
        )}
      </div>

      {napLogs.length > 0 && (
        <>
          <p className="section-label">RECENT NAPS</p>
          <div className="entries-list">
            {napLogs.map((e, i) => (
              <div key={i} className="entry-card">
                <div className="entry-header">
                  <span className="entry-type-dot" style={{ background: "#a78bfa" }} />
                  <span className="entry-type">Nap</span>
                  <span className="entry-sev">Felt {e.severity}/5</span>
                  <span className="entry-time">{new Date(e.time).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                {e.notes && <p className="entry-notes">{e.notes}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── ROOT APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [medConfig, setMedConfig] = useState(null);
  const [screen, setScreen] = useState("home");
  const [medState, setMedState] = useState({
    morningTaken: false, foodTimer: 0, alcoholTimer: 0, alcoholDrinks: 0,
    dose1Taken: false, dose2Taken: false, dose1Elapsed: 0, alcoholExceeded: false, cutoffHour: 5
  });
  const [logEntries, setLogEntries] = useState([]);

  const handleMedConfigChange = (newConfig) => {
    setMedConfig(newConfig);
    setMedState({
      morningTaken: false, foodTimer: 0, alcoholTimer: 0, alcoholDrinks: 0,
      dose1Taken: false, dose2Taken: false, dose1Elapsed: 0, alcoholExceeded: false,
      cutoffHour: newConfig.defaultCutoffHour ?? 5
    });
    setScreen("home");
  };

  const tabs = [
    { id: "home", icon: "home", label: "Home" },
    { id: "medication", icon: "pill", label: "Meds" },
    { id: "log", icon: "log", label: "Log" },
    { id: "nap", icon: "moon", label: "Nap" },
    { id: "medicalid", icon: "id", label: "ID" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body, html, #root { height: 100%; font-family: 'Inter', -apple-system, sans-serif; }

        .app-frame {
          min-height: 100vh;
          background: radial-gradient(ellipse at top, #1e293b 0%, #0f172a 60%, #020617 100%);
          display: flex;
          justify-content: center;
        }

        .phone {
          width: 100%;
          max-width: 440px;
          background: #0a0f1c;
          min-height: 100vh;
          position: relative;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          padding-bottom: 88px;
          background-image:
            radial-gradient(ellipse 600px 400px at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 70%),
            radial-gradient(ellipse 400px 600px at 100% 80%, rgba(168, 85, 247, 0.04) 0%, transparent 70%);
        }

        .screen { padding: 28px 22px 32px; flex: 1; }

        /* SETUP */
        .setup-screen { padding: 56px 22px 32px; min-height: 100vh; display: flex; flex-direction: column; }
        .setup-header { margin-bottom: 28px; }
        .setup-tag { font-size: 10px; letter-spacing: 0.18em; color: #818cf8; font-weight: 600; margin-bottom: 12px; }
        .setup-title {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 36px;
          line-height: 1.1;
          color: #f1f5f9;
          margin-bottom: 8px;
        }
        .setup-sub { color: #64748b; font-size: 14px; }

        .med-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .med-option {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 14px;
          padding: 14px 16px;
          text-align: left;
          cursor: pointer;
          color: #e2e8f0;
          display: flex; flex-direction: column; gap: 6px;
          font-family: inherit;
          transition: all 0.15s;
        }
        .med-option:hover { border-color: rgba(129, 140, 248, 0.3); }
        .med-option.selected {
          background: rgba(129, 140, 248, 0.15);
          border-color: rgba(129, 140, 248, 0.5);
        }
        .med-option-main { display: flex; align-items: center; justify-content: space-between; }
        .med-option-name { font-weight: 600; font-size: 16px; color: #f1f5f9; }
        .med-option-tag {
          font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 3px 8px; border-radius: 8px; font-weight: 600;
        }
        .tag-oxybate { background: rgba(168, 85, 247, 0.15); color: #d8b4fe; }
        .tag-stimulant { background: rgba(251, 146, 60, 0.15); color: #fdba74; }
        .tag-wake_promoter { background: rgba(56, 189, 248, 0.15); color: #7dd3fc; }
        .tag-custom { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; }
        .med-option-desc { font-size: 12px; color: #64748b; line-height: 1.4; }

        .setup-btn {
          width: 100%;
          background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
          color: #0f172a;
          padding: 16px;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; gap: 8px; justify-content: center;
          font-family: inherit;
          margin-top: auto;
        }
        .setup-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .back-btn {
          background: none; border: none; color: #64748b;
          padding: 12px; margin-top: 8px;
          font-size: 13px; cursor: pointer; font-family: inherit;
          align-self: center;
        }

        .setup-disclaimer {
          font-size: 11px; color: #64748b; line-height: 1.5;
          text-align: center; margin-top: 24px; padding: 0 20px;
        }

        .custom-form { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px;
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.08);
          border-radius: 14px;
          margin-bottom: 8px;
        }
        .toggle-title { font-size: 14px; font-weight: 600; color: #f1f5f9; }
        .toggle-desc { font-size: 11px; color: #64748b; margin-top: 2px; }
        .toggle {
          width: 44px; height: 26px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 13px;
          border: none; cursor: pointer;
          position: relative;
          transition: background 0.2s;
        }
        .toggle.on { background: #818cf8; }
        .toggle-dot {
          position: absolute;
          top: 3px; left: 3px;
          width: 20px; height: 20px;
          background: white; border-radius: 50%;
          transition: transform 0.2s;
        }
        .toggle.on .toggle-dot { transform: translateX(18px); }

        .inline-config {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px; margin: -4px 0 8px;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
          font-size: 12px; color: #94a3b8;
        }
        .inline-config select {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.15);
          color: #e2e8f0;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-family: inherit;
        }

        /* HOME */
        .home-header { margin-bottom: 28px; }
        .greeting-tag { font-size: 10px; letter-spacing: 0.18em; color: #818cf8; font-weight: 600; margin-bottom: 12px; }
        .greeting {
          font-family: 'Fraunces', serif; font-weight: 400; font-style: italic;
          font-size: 38px; line-height: 1.05; letter-spacing: -0.02em; color: #f1f5f9;
        }
        .subtitle { color: #64748b; font-size: 14px; margin-top: 6px; }

        .status-strip {
          display: flex; align-items: center;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: 20px;
          padding: 16px;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
        }
        .status-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .status-num { font-size: 24px; font-weight: 600; font-family: 'Fraunces', serif; color: #f1f5f9; }
        .status-label { font-size: 10px; letter-spacing: 0.1em; color: #64748b; text-transform: uppercase; }
        .status-divider { width: 1px; height: 28px; background: rgba(148, 163, 184, 0.15); }

        .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
        .quick-card {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 18px;
          padding: 20px 16px;
          text-align: left;
          display: flex; flex-direction: column; gap: 8px;
          color: #e2e8f0; cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .quick-card:hover { background: rgba(30, 41, 59, 0.7); border-color: rgba(129, 140, 248, 0.3); transform: translateY(-1px); }
        .quick-card.primary {
          background: linear-gradient(135deg, rgba(129, 140, 248, 0.18) 0%, rgba(168, 85, 247, 0.12) 100%);
          border-color: rgba(129, 140, 248, 0.35);
        }
        .quick-card svg { color: #a5b4fc; margin-bottom: 4px; }
        .quick-card.primary svg { color: #c7d2fe; }
        .qc-title { font-weight: 600; font-size: 15px; color: #f1f5f9; }
        .quick-card small { font-size: 11px; color: #64748b; }

        .section-label {
          font-size: 10px; letter-spacing: 0.18em; color: #64748b;
          font-weight: 600; margin-bottom: 12px; margin-top: 4px;
        }
        .recent-section { margin-top: 8px; }
        .log-pill {
          display: flex; align-items: center; gap: 12px;
          background: rgba(30, 41, 59, 0.4);
          border-radius: 12px;
          padding: 12px 14px; margin-bottom: 8px;
          font-size: 13px;
        }
        .log-type-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .log-pill-type { flex: 1; text-transform: capitalize; color: #cbd5e1; }
        .log-pill-time { color: #64748b; font-size: 12px; }

        .screen-title {
          font-family: 'Fraunces', serif; font-weight: 400; font-style: italic;
          font-size: 32px; letter-spacing: -0.02em; color: #f1f5f9; margin-bottom: 6px;
        }
        .screen-sub { color: #64748b; font-size: 13px; margin-bottom: 24px; }

        .med-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .change-med-btn {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.12);
          color: #94a3b8;
          padding: 10px; border-radius: 12px; cursor: pointer;
          margin-top: 4px;
        }
        .change-med-btn:hover { color: #c7d2fe; border-color: rgba(129, 140, 248, 0.3); }

        .med-card {
          background: rgba(30, 41, 59, 0.45);
          border: 1px solid rgba(148, 163, 184, 0.08);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 14px;
          backdrop-filter: blur(8px);
        }
        .med-card-header {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-weight: 600; color: #cbd5e1;
          margin-bottom: 14px; letter-spacing: 0.02em;
        }
        .med-card-header svg { color: #a5b4fc; }
        .big-timer {
          font-family: 'Fraunces', serif;
          font-size: 44px; font-weight: 300;
          letter-spacing: -0.02em; color: #f1f5f9;
          text-align: center; padding: 8px 0;
          font-variant-numeric: tabular-nums;
        }
        .big-timer.timer-done { color: #86efac; }
        .timer-sub { font-size: 11px; color: #64748b; text-align: center; margin-bottom: 14px; letter-spacing: 0.04em; }

        .med-btn {
          width: 100%;
          background: rgba(129, 140, 248, 0.12);
          border: 1px solid rgba(129, 140, 248, 0.3);
          color: #c7d2fe;
          border-radius: 14px;
          padding: 14px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: all 0.15s;
        }
        .med-btn:hover:not(:disabled) { background: rgba(129, 140, 248, 0.22); }
        .med-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .med-btn.small { padding: 10px; font-size: 13px; }

        .taken-badge {
          background: rgba(134, 239, 172, 0.1);
          border: 1px solid rgba(134, 239, 172, 0.25);
          color: #86efac;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 13px; font-weight: 500;
          display: flex; align-items: center; gap: 8px; justify-content: center;
        }
        .taken-badge.small { padding: 9px; font-size: 12px; }

        .alert-badge {
          background: rgba(251, 113, 133, 0.1);
          border: 1px solid rgba(251, 113, 133, 0.3);
          color: #fda4af;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 13px; font-weight: 500; text-align: center;
        }
        .alert-badge.small { padding: 9px; font-size: 12px; }

        .ready-banner {
          background: linear-gradient(90deg, rgba(134, 239, 172, 0.18), rgba(134, 239, 172, 0.08));
          border: 1px solid rgba(134, 239, 172, 0.35);
          color: #86efac;
          padding: 16px;
          border-radius: 14px;
          text-align: center;
          font-size: 14px; font-weight: 600;
          margin-bottom: 14px;
        }

        .empty-med-state {
          text-align: center; padding: 40px 20px;
          color: #64748b;
        }
        .empty-med-state p { margin-bottom: 16px; font-size: 14px; }

        .dose-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .dose-block {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 14px;
          padding: 14px;
        }
        .dose-label { font-size: 10px; letter-spacing: 0.12em; color: #64748b; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; }
        .dose-sub { font-size: 11px; color: #64748b; text-align: center; margin-top: 6px; }
        .dose-sub.green { color: #86efac; font-weight: 600; }
        .elapsed-timer {
          font-family: 'Fraunces', serif; font-size: 22px; font-weight: 400;
          color: #cbd5e1; text-align: center;
          font-variant-numeric: tabular-nums;
        }
        .elapsed-timer.elapsed-green { color: #86efac; }
        .cutoff-select {
          width: 100%;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.15);
          color: #e2e8f0;
          padding: 10px; border-radius: 10px;
          font-size: 14px; font-family: inherit;
        }

        .reset-btn {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(148, 163, 184, 0.15);
          color: #64748b;
          padding: 12px; border-radius: 12px;
          font-size: 12px; cursor: pointer;
          margin-top: 8px; font-family: inherit;
        }
        .reset-btn:hover { color: #cbd5e1; border-color: rgba(148, 163, 184, 0.3); }

        .type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 22px; }
        .type-btn {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.1);
          color: #cbd5e1;
          padding: 14px; border-radius: 14px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          display: flex; align-items: center; gap: 10px;
          font-family: inherit; transition: all 0.15s;
        }
        .type-btn.active { background: rgba(129, 140, 248, 0.15); border-color: rgba(129, 140, 248, 0.4); }
        .type-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--dot); }

        .severity-row { display: flex; gap: 8px; margin-bottom: 22px; }
        .sev-btn {
          flex: 1;
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.1);
          color: #cbd5e1;
          padding: 14px; border-radius: 12px;
          font-size: 16px; font-weight: 600; cursor: pointer;
          font-family: 'Fraunces', serif;
        }
        .sev-btn.active { background: rgba(129, 140, 248, 0.18); border-color: rgba(129, 140, 248, 0.45); color: #c7d2fe; }

        .notes-input, .field-input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.12);
          color: #e2e8f0;
          padding: 14px; border-radius: 12px;
          font-size: 14px; font-family: inherit;
          resize: vertical; margin-bottom: 16px;
        }
        .notes-input:focus, .field-input:focus { outline: none; border-color: rgba(129, 140, 248, 0.4); }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
          color: #0f172a;
          padding: 16px; border: none; border-radius: 14px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; gap: 8px; justify-content: center;
          font-family: inherit; letter-spacing: 0.01em;
        }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(129, 140, 248, 0.25); }

        .entries-list { display: flex; flex-direction: column; gap: 10px; }
        .entry-card {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.08);
          border-radius: 14px;
          padding: 14px;
        }
        .entry-header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .entry-type-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .entry-type { font-size: 13px; font-weight: 600; color: #e2e8f0; flex: 1; }
        .entry-sev { font-size: 11px; color: #94a3b8; background: rgba(15, 23, 42, 0.6); padding: 3px 8px; border-radius: 8px; }
        .entry-time { font-size: 11px; color: #64748b; }
        .entry-notes { font-size: 13px; color: #94a3b8; margin-top: 8px; line-height: 1.5; }

        .medid-header { text-align: center; margin-bottom: 18px; }
        .medid-badge {
          display: inline-block;
          background: rgba(251, 113, 133, 0.12);
          border: 1px solid rgba(251, 113, 133, 0.3);
          color: #fda4af;
          font-size: 10px; letter-spacing: 0.18em;
          padding: 6px 12px; border-radius: 20px;
          margin-bottom: 14px; font-weight: 600;
        }
        .medid-sub { color: #64748b; font-size: 13px; }
        .disclaimer {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.1);
          color: #94a3b8;
          padding: 12px 14px; border-radius: 12px;
          font-size: 12px; line-height: 1.5; margin-bottom: 20px;
        }
        .medid-card {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 18px;
          padding: 6px 18px; margin-bottom: 18px;
        }
        .medid-row {
          display: flex; flex-direction: column; gap: 4px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.08);
        }
        .medid-row:last-child { border-bottom: none; }
        .medid-label { font-size: 11px; letter-spacing: 0.1em; color: #64748b; text-transform: uppercase; font-weight: 600; }
        .medid-value { font-size: 15px; color: #f1f5f9; line-height: 1.5; }

        .edit-form { display: flex; flex-direction: column; }
        .field-group { margin-bottom: 4px; }
        .field-label { display: block; font-size: 11px; letter-spacing: 0.1em; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }

        .qr-btn {
          width: 100%;
          background: rgba(134, 239, 172, 0.1);
          border: 1px solid rgba(134, 239, 172, 0.3);
          color: #86efac;
          padding: 16px; border-radius: 14px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: inherit;
        }
        .qr-btn:hover { background: rgba(134, 239, 172, 0.18); }

        .qr-view { display: flex; flex-direction: column; align-items: center; }
        .qr-container {
          background: white;
          padding: 20px;
          border-radius: 20px;
          margin-bottom: 18px;
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
        }
        .qr-image { display: block; width: 240px; height: 240px; }
        .qr-instructions {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.6;
          text-align: center;
          margin-bottom: 22px;
          padding: 0 8px;
        }
        .back-btn-medid {
          background: none; border: none;
          color: #64748b;
          padding: 12px;
          font-size: 13px; cursor: pointer;
          font-family: inherit;
          width: 100%;
        }
        .back-btn-medid:hover { color: #cbd5e1; }

        .nap-card {
          background: linear-gradient(180deg, rgba(167, 139, 250, 0.1) 0%, rgba(30, 41, 59, 0.4) 100%);
          border: 1px solid rgba(167, 139, 250, 0.2);
          border-radius: 24px;
          padding: 32px 22px;
          text-align: center; margin-bottom: 28px;
        }
        .nap-state-icon { font-size: 56px; margin-bottom: 14px; }
        .nap-state-icon.pulsing { animation: pulse 2.5s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        .nap-state-text { font-family: 'Fraunces', serif; font-style: italic; font-size: 18px; color: #cbd5e1; margin-bottom: 18px; }
        .nap-timer {
          font-family: 'Fraunces', serif;
          font-size: 52px; font-weight: 300;
          color: #c7d2fe; margin-bottom: 8px;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
        }
        .nap-btn {
          width: 100%; padding: 16px; border-radius: 14px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          margin-top: 18px; border: none; font-family: inherit;
        }
        .nap-btn.start { background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%); color: #0f172a; }
        .nap-btn.end { background: rgba(251, 113, 133, 0.15); border: 1px solid rgba(251, 113, 133, 0.4); color: #fda4af; }

        .tab-bar {
          position: fixed;
          bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 100%; max-width: 440px;
          background: rgba(10, 15, 28, 0.92);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          padding: 12px 8px 22px;
          z-index: 100;
        }
        .tab-btn {
          flex: 1;
          background: none; border: none;
          color: #64748b;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          padding: 6px 4px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.05em;
          cursor: pointer; transition: color 0.15s;
          font-family: inherit;
        }
        .tab-btn.active { color: #c7d2fe; }
        .tab-btn:hover { color: #cbd5e1; }
      `}</style>

      <div className="app-frame">
        <div className="phone">
          {!medConfig ? (
            <SetupScreen onComplete={handleMedConfigChange} />
          ) : (
            <>
              {screen === "home" && <HomeScreen setScreen={setScreen} medState={medState} logEntries={logEntries} medConfig={medConfig} />}
              {screen === "medication" && <MedicationScreen medState={medState} setMedState={setMedState} medConfig={medConfig} onChangeMed={() => setMedConfig(null)} />}
              {screen === "log" && <LogScreen logEntries={logEntries} setLogEntries={setLogEntries} />}
              {screen === "medicalid" && <MedicalIDScreen medConfig={medConfig} />}
              {screen === "nap" && <NapScreen logEntries={logEntries} setLogEntries={setLogEntries} />}

              <div className="tab-bar">
                {tabs.map(t => (
                  <button key={t.id} className={`tab-btn ${screen === t.id ? "active" : ""}`} onClick={() => setScreen(t.id)}>
                    <Icon name={t.icon} size={22} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
