import { useState, useEffect } from "react";

const formatTime = (seconds) => {
  if (seconds < 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const MED_PRESETS = {
  xywav: { id: "xywav", name: "Xywav", type: "oxybate", morningDose: false, hasFoodTimer: true, foodWaitHours: 2, hasNightDoses: true, doseGapHours: 2, defaultCutoffHour: 5, description: "Two nighttime doses Â· no food within 2hr" },
  xyrem: { id: "xyrem", name: "Xyrem", type: "oxybate", morningDose: false, hasFoodTimer: true, foodWaitHours: 2, hasNightDoses: true, doseGapHours: 2.5, defaultCutoffHour: 5, description: "Two nighttime doses Â· no food within 2hr" },
  modafinil: { id: "modafinil", name: "Modafinil", type: "stimulant", morningDose: true, hasFoodTimer: false, hasNightDoses: false, description: "Morning stimulant Â· take early" },
  armodafinil: { id: "armodafinil", name: "Armodafinil", type: "stimulant", morningDose: true, hasFoodTimer: false, hasNightDoses: false, description: "Morning stimulant Â· long acting" },
  adderall: { id: "adderall", name: "Adderall", type: "stimulant", morningDose: true, hasFoodTimer: false, hasNightDoses: false, description: "Stimulant Â· morning and afternoon" },
  vyvanse: { id: "vyvanse", name: "Vyvanse", type: "stimulant", morningDose: true, hasFoodTimer: false, hasNightDoses: false, description: "Long-acting stimulant Â· take in morning" },
  sunosi: { id: "sunosi", name: "Sunosi", type: "wake_promoter", morningDose: true, hasFoodTimer: false, hasNightDoses: false, description: "Wake-promoting agent Â· once daily" },
  wakix: { id: "wakix", name: "Wakix", type: "wake_promoter", morningDose: true, hasFoodTimer: false, hasNightDoses: false, description: "Non-stimulant Â· once daily" },
  other: { id: "other", name: "Other", type: "custom", morningDose: true, hasFoodTimer: false, hasNightDoses: false, description: "Custom medication â€” configure your own" },
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
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    beer: <><path d="M6 9V6a2 2 0 012-2h6a2 2 0 012 2v3" /><path d="M16 9v11a2 2 0 01-2 2H8a2 2 0 01-2-2V9" /><path d="M16 11h2a2 2 0 012 2v3a2 2 0 01-2 2h-2" /></>,
    timer: <><circle cx="12" cy="13" r="8" /><polyline points="12 9 12 13 15 15" /><line x1="9" y1="2" x2="15" y2="2" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// â”€â”€â”€ SETUP / ONBOARDING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SetupScreen({ onComplete }) {
  // step 0 = pick presets (multi-select) + manage custom meds, step 1 = configure a custom med
  const [step, setStep] = useState(0);
  const [selectedPresetIds, setSelectedPresetIds] = useState([]);
  const [customMeds, setCustomMeds] = useState([]);
  const [customName, setCustomName] = useState("");
  const [customConfig, setCustomConfig] = useState({
    morningDose: true,
    hasFoodTimer: false,
    foodWaitHours: 2,
    hasNightDoses: false,
    doseGapHours: 2,
    defaultCutoffHour: 5,
  });

  const togglePreset = (medId) => {
    if (medId === "other") {
      setStep(1);
      return;
    }
    setSelectedPresetIds(prev =>
      prev.includes(medId) ? prev.filter(id => id !== medId) : [...prev, medId]
    );
  };

  const removeCustomMed = (instanceId) => {
    setCustomMeds(prev => prev.filter(m => m.instanceId !== instanceId));
  };

  const finishCustom = () => {
    setCustomMeds(prev => [...prev, {
      ...MED_PRESETS.other,
      name: customName || "My Medication",
      ...customConfig,
      instanceId: uid(),
    }]);
    setCustomName("");
    setCustomConfig({ morningDose: true, hasFoodTimer: false, foodWaitHours: 2, hasNightDoses: false, doseGapHours: 2, defaultCutoffHour: 5 });
    setStep(0);
  };

  const handleContinue = () => {
    const presetMeds = selectedPresetIds.map(id => ({ ...MED_PRESETS[id], instanceId: uid() }));
    onComplete([...presetMeds, ...customMeds]);
  };

  const totalSelected = selectedPresetIds.length + customMeds.length;
  const presetList = Object.values(MED_PRESETS).filter(m => m.id !== "other");

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <div className="setup-tag">SETUP {totalSelected > 0 && `Â· ${totalSelected} SELECTED`}</div>
        <h1 className="setup-title">
          {step === 0 ? "Which medications?" : "Configure your medication"}
        </h1>
        <p className="setup-sub">
          {step === 0
            ? "Select all the medications you take. Tap to select more than one."
            : "Set up timers for your custom medication."}
        </p>
      </div>

      {step === 0 && (
        <>
          <div className="med-list">
            {presetList.map(m => {
              const selected = selectedPresetIds.includes(m.id);
              return (
                <button key={m.id} className={`med-option ${selected ? "selected multi-selected" : ""}`} onClick={() => togglePreset(m.id)}>
                  <div className="med-option-main">
                    <span className="med-option-name">
                      {selected && <span className="check-pill">âœ“</span>}
                      {m.name}
                    </span>
                    <span className={`med-option-tag tag-${m.type}`}>{m.type.replace("_", " ")}</span>
                  </div>
                  <span className="med-option-desc">{m.description}</span>
                </button>
              );
            })}

            {customMeds.map(m => (
              <div key={m.instanceId} className="med-option selected multi-selected">
                <div className="med-option-main">
                  <span className="med-option-name">
                    <span className="check-pill">âœ“</span>
                    {m.name}
                  </span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span className="med-option-tag tag-custom">custom</span>
                    <button className="icon-btn" onClick={() => removeCustomMed(m.instanceId)}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
                <span className="med-option-desc">{m.description}</span>
              </div>
            ))}
          </div>

          <button className="add-med-btn" onClick={() => setStep(1)}>
            <Icon name="plus" size={18} /> Add custom medication
          </button>

          <button className="setup-btn" disabled={totalSelected === 0} onClick={handleContinue}>
            Continue to Lepsy <Icon name="arrow" size={18} />
          </button>
        </>
      )}

      {step === 1 && (
        <div className="custom-form">
          <div className="field-group">
            <label className="field-label">Medication Name</label>
            <input className="field-input" placeholder="e.g. Sodium Oxybate" value={customName} onChange={e => setCustomName(e.target.value)} />
          </div>

          <ToggleRow title="Morning Dose" desc="Tap to log morning medication" value={customConfig.morningDose} onChange={v => setCustomConfig(p => ({ ...p, morningDose: v }))} />

          <ToggleRow title="Food Timer" desc="Wait period after eating before dose" value={customConfig.hasFoodTimer} onChange={v => setCustomConfig(p => ({ ...p, hasFoodTimer: v }))} />
          {customConfig.hasFoodTimer && (
            <InlineSelect label="Hours to wait after food" value={customConfig.foodWaitHours} options={[1, 2, 3, 4]} unit="hour" onChange={v => setCustomConfig(p => ({ ...p, foodWaitHours: v }))} />
          )}

          <ToggleRow title="Two Nighttime Doses" desc="Split dose with gap between" value={customConfig.hasNightDoses} onChange={v => setCustomConfig(p => ({ ...p, hasNightDoses: v }))} />
          {customConfig.hasNightDoses && (
            <InlineSelect label="Gap between doses" value={customConfig.doseGapHours} options={[1.5, 2, 2.5, 3, 3.5, 4]} unit="hours" onChange={v => setCustomConfig(p => ({ ...p, doseGapHours: v }))} />
          )}

          <button className="setup-btn" onClick={finishCustom}>
            Save Medication <Icon name="arrow" size={18} />
          </button>
          <button className="back-btn" onClick={() => setStep(0)}>â† Back</button>
        </div>
      )}

      <p className="setup-disclaimer">
        Always follow your prescribing doctor's instructions. Lepsy supports â€” it does not replace â€” medical advice.
      </p>
    </div>
  );
}

const ToggleRow = ({ title, desc, value, onChange }) => (
  <div className="toggle-row">
    <div>
      <p className="toggle-title">{title}</p>
      <p className="toggle-desc">{desc}</p>
    </div>
    <button className={`toggle ${value ? "on" : ""}`} onClick={() => onChange(!value)}>
      <span className="toggle-dot" />
    </button>
  </div>
);

const InlineSelect = ({ label, value, options, unit, onChange }) => (
  <div className="inline-config">
    <label>{label}</label>
    <select value={value} onChange={e => onChange(parseFloat(e.target.value))}>
      {options.map(o => <option key={o} value={o}>{o} {unit}{o !== 1 && unit !== "hours" ? "s" : ""}</option>)}
    </select>
  </div>
);

// â”€â”€â”€ HOME â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function HomeScreen({ setScreen, medications, logEntries }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayLogs = logEntries.filter(e => new Date(e.time).toDateString() === new Date().toDateString());
  const medNames = medications.map(m => m.name).join(" Â· ").toUpperCase();

  return (
    <div className="screen home-screen">
      <div className="home-header">
        <div className="greeting-tag">LEPSY Â· {medNames}</div>
        <h1 className="greeting">{greeting}</h1>
        <p className="subtitle">Your daily companion</p>
      </div>

      <div className="status-strip">
        <div className="status-item">
          <span className="status-num">{todayLogs.length}</span>
          <span className="status-label">Logs today</span>
        </div>
        <div className="status-divider" />
        <div className="status-item">
          <span className="status-num">{medications.length}</span>
          <span className="status-label">Meds tracked</span>
        </div>
      </div>

      <div className="quick-grid">
        <button className="quick-card primary" onClick={() => setScreen("medication")}>
          <Icon name="pill" size={28} />
          <span className="qc-title">Medications</span>
          <small>Timers & doses</small>
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

// â”€â”€â”€ EDIT TIMER MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EditTimerModal({ timer, onSave, onClose, onDelete }) {
  const [hours, setHours] = useState(Math.floor((timer.remainingSeconds || 0) / 3600));
  const [minutes, setMinutes] = useState(Math.floor(((timer.remainingSeconds || 0) % 3600) / 60));

  const save = () => {
    onSave(hours * 3600 + minutes * 60);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit {timer.label}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={20} /></button>
        </div>
        <p className="modal-sub">Adjust the remaining time on this timer</p>

        <div className="time-pickers">
          <div className="time-picker">
            <label>Hours</label>
            <select value={hours} onChange={e => setHours(parseInt(e.target.value))}>
              {Array.from({ length: 13 }, (_, i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="time-picker">
            <label>Minutes</label>
            <select value={minutes} onChange={e => setMinutes(parseInt(e.target.value))}>
              {Array.from({ length: 60 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, "0")}</option>)}
            </select>
          </div>
        </div>

        <button className="submit-btn" onClick={save}>Save</button>
        {onDelete && (
          <button className="danger-btn" onClick={() => { onDelete(); onClose(); }}>
            <Icon name="trash" size={16} /> Delete timer
          </button>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ ADD TIMER MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AddTimerModal({ onAdd, onClose, medications }) {
  // Detect if user is on an oxybate medication (Xywav or Xyrem) for stricter alcohol rules
  const hasOxybate = medications.some(m => m.type === "oxybate");

  const [type, setType] = useState("alcohol");
  const [name, setName] = useState("");
  const [hours, setHours] = useState(hasOxybate ? 4 : 4);
  const [strictMode, setStrictMode] = useState(hasOxybate); // default ON if on Xywav/Xyrem

  const presets = [
    { id: "alcohol", label: "Alcohol Timer", icon: "beer", defaultHours: 4, desc: "Track time after drinking" },
    { id: "custom", label: "Custom Timer", icon: "timer", defaultHours: 2, desc: "Anything you want to track" },
  ];

  const handleAdd = () => {
    const preset = presets.find(p => p.id === type);
    const isAlcoholStrict = type === "alcohol" && strictMode;

    onAdd({
      id: uid(),
      type,
      label: type === "custom" ? (name || "Custom Timer") : preset.label,
      durationSeconds: hours * 3600,
      remainingSeconds: 0,
      active: false,
      drinkCount: 0,
      // Strict mode = Xywav/Xyrem rules: 4hr â†’ 6hr â†’ exceeded after 3 drinks
      strictMode: isAlcoholStrict,
      drink1Hours: isAlcoholStrict ? 4 : hours,
      drink2Hours: isAlcoholStrict ? 6 : hours + 2,
      maxDrinks: isAlcoholStrict ? 2 : 99,
      drinkHourIncrement: 2,
      exceeded: false,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Timer</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={20} /></button>
        </div>

        <p className="section-label">TIMER TYPE</p>
        <div className="timer-type-grid">
          {presets.map(p => (
            <button key={p.id} className={`type-btn ${type === p.id ? "active" : ""}`} onClick={() => { setType(p.id); setHours(p.defaultHours); }}>
              <Icon name={p.icon} size={18} />
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{p.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {type === "custom" && (
          <div className="field-group" style={{ marginTop: 16 }}>
            <label className="field-label">Name your timer</label>
            <input className="field-input" placeholder="e.g. Caffeine cutoff, Screen time" value={name} onChange={e => setName(e.target.value)} />
          </div>
        )}

        {type === "alcohol" && hasOxybate && (
          <div style={{ marginTop: 16 }}>
            <ToggleRow
              title="Xywav/Xyrem safety rules"
              desc="1 drink â†’ 4hr Â· 2 drinks â†’ 6hr Â· 3 drinks â†’ exceeded warning"
              value={strictMode}
              onChange={setStrictMode}
            />
          </div>
        )}

        {type === "alcohol" && !strictMode && (
          <div className="field-group" style={{ marginTop: 16 }}>
            <label className="field-label">Hours per drink</label>
            <select className="field-input" value={hours} onChange={e => setHours(parseInt(e.target.value))} style={{ marginBottom: 16 }}>
              {[2, 3, 4, 5, 6, 8].map(h => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>)}
            </select>
          </div>
        )}

        {type === "custom" && (
          <div className="field-group">
            <label className="field-label">Duration (hours)</label>
            <select className="field-input" value={hours} onChange={e => setHours(parseInt(e.target.value))} style={{ marginBottom: 16 }}>
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(h => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>)}
            </select>
          </div>
        )}

        {type === "alcohol" && strictMode && (
          <p className="modal-info">
            âš ï¸ Xywav and Xyrem can interact dangerously with alcohol. After your 3rd drink, the timer will warn you not to take your medication tonight.
          </p>
        )}

        {type === "alcohol" && !strictMode && (
          <p className="modal-info">
            Each drink resets/extends the timer. Useful for tracking time since last drink regardless of medication.
          </p>
        )}

        <button className="submit-btn" onClick={handleAdd}>Add Timer</button>
      </div>
    </div>
  );
}

// â”€â”€â”€ MEDICATION SCREEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MedicationScreen({ medications, setMedications, medStates, setMedStates, customTimers, setCustomTimers, onManageMeds }) {
  const [editingTimer, setEditingTimer] = useState(null);
  const [showAddTimer, setShowAddTimer] = useState(false);

  // Tick all timers down every second
  useEffect(() => {
    const interval = setInterval(() => {
      setMedStates(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          const s = { ...next[key] };
          if (s.foodTimer > 0) s.foodTimer--;
          if (s.dose1Taken && !s.dose2Taken) s.dose1Elapsed = (s.dose1Elapsed || 0) + 1;
          next[key] = s;
        });
        return next;
      });
      setCustomTimers(prev => prev.map(t => {
        if (t.active && t.remainingSeconds > 0) {
          return { ...t, remainingSeconds: t.remainingSeconds - 1 };
        }
        return t;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [setMedStates, setCustomTimers]);

  const getState = (instanceId) => medStates[instanceId] || { morningTaken: false, foodTimer: 0, dose1Taken: false, dose2Taken: false, dose1Elapsed: 0, cutoffHour: 5 };

  const updateState = (instanceId, updates) => {
    setMedStates(prev => ({ ...prev, [instanceId]: { ...getState(instanceId), ...updates } }));
  };

  const startCustomTimer = (id) => {
    setCustomTimers(prev => prev.map(t => t.id === id ? { ...t, active: true, remainingSeconds: t.durationSeconds, startedAt: new Date().toISOString() } : t));
  };

  const logAlcoholDrink = (id) => {
    setCustomTimers(prev => prev.map(t => {
      if (t.id === id) {
        const newCount = t.drinkCount + 1;

        // Strict mode (Xywav/Xyrem): hardcoded safety rules
        if (t.strictMode) {
          if (newCount > 2) {
            return {
              ...t,
              active: true,
              drinkCount: newCount,
              remainingSeconds: 0,
              exceeded: true,
            };
          }
          const newDuration = newCount === 1 ? t.drink1Hours * 3600 : t.drink2Hours * 3600;
          return {
            ...t,
            active: true,
            drinkCount: newCount,
            remainingSeconds: newDuration,
            startedAt: t.startedAt || new Date().toISOString(),
            exceeded: false,
          };
        }

        // Non-strict: first drink starts timer, each additional extends
        const additionalSeconds = newCount === 1 ? t.durationSeconds : t.drinkHourIncrement * 3600;
        return {
          ...t,
          active: true,
          drinkCount: newCount,
          remainingSeconds: newCount === 1 ? t.durationSeconds : t.remainingSeconds + additionalSeconds,
          startedAt: t.startedAt || new Date().toISOString(),
        };
      }
      return t;
    }));
  };

  const resetTimer = (id) => {
    setCustomTimers(prev => prev.map(t => t.id === id ? { ...t, active: false, remainingSeconds: 0, drinkCount: 0, startedAt: null, exceeded: false } : t));
  };

  const deleteTimer = (id) => {
    setCustomTimers(prev => prev.filter(t => t.id !== id));
  };

  const updateTimerSeconds = (id, newSeconds) => {
    setCustomTimers(prev => prev.map(t => t.id === id ? { ...t, remainingSeconds: newSeconds, active: newSeconds > 0 } : t));
  };

  return (
    <div className="screen med-screen">
      <div className="med-header-row">
        <div>
          <h2 className="screen-title">Medications</h2>
          <p className="screen-sub">{medications.length} medication{medications.length !== 1 ? "s" : ""} Â· {customTimers.length} timer{customTimers.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="change-med-btn" onClick={onManageMeds}>
          <Icon name="settings" size={18} />
        </button>
      </div>

      {medications.map(med => {
        const state = getState(med.instanceId);
        const doseGapSeconds = (med.doseGapHours ?? 2) * 3600;
        const dose1Green = (state.dose1Elapsed || 0) >= doseGapSeconds;
        const cutoffHour = state.cutoffHour ?? med.defaultCutoffHour ?? 5;
        const nowDate = new Date();
        const pastCutoff = state.dose1Taken && nowDate.getHours() >= cutoffHour && nowDate.getHours() < 12;

        return (
          <div key={med.instanceId} className="med-group">
            <div className="med-group-header">
              <span className="med-group-name">{med.name}</span>
              <span className={`med-option-tag tag-${med.type}`}>{med.type.replace("_", " ")}</span>
            </div>

            {med.morningDose && (
              <div className="med-card">
                <div className="med-card-header">
                  <Icon name="zap" size={18} />
                  <span>Morning Dose</span>
                </div>
                {state.morningTaken ? (
                  <div className="taken-badge">
                    <Icon name="check" size={16} /> Taken at {new Date(state.morningTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    <button className="inline-edit" onClick={() => updateState(med.instanceId, { morningTaken: false, morningTime: null })}>Undo</button>
                  </div>
                ) : (
                  <button className="med-btn" onClick={() => updateState(med.instanceId, { morningTaken: true, morningTime: new Date().toISOString() })}>Tap when taken</button>
                )}
              </div>
            )}

            {med.hasFoodTimer && (
              <div className="med-card">
                <div className="med-card-header">
                  <span style={{ fontSize: 18 }}>ðŸ½</span>
                  <span>Food Timer</span>
                  {state.foodTimer > 0 && (
                    <button className="inline-edit-icon" onClick={() => setEditingTimer({
                      type: "food",
                      instanceId: med.instanceId,
                      label: "Food Timer",
                      remainingSeconds: state.foodTimer,
                    })}>
                      <Icon name="edit" size={14} />
                    </button>
                  )}
                </div>
                <div className={`big-timer ${state.foodTimer === 0 && state.foodTime ? "timer-done" : ""}`}>
                  {formatTime(state.foodTimer)}
                </div>
                <p className="timer-sub">{med.foodWaitHours} hour{med.foodWaitHours > 1 ? "s" : ""} must pass after eating</p>
                <button className="med-btn" onClick={() => updateState(med.instanceId, { foodTimer: med.foodWaitHours * 3600, foodTime: new Date().toISOString() })}>
                  Tap when you finish eating
                </button>
              </div>
            )}

            {med.hasNightDoses && (
              <div className="med-card">
                <div className="med-card-header">
                  <Icon name="moon" size={18} />
                  <span>Nighttime Doses</span>
                </div>

                <div className="dose-grid">
                  <div className="dose-block">
                    <p className="dose-label">Dose 1</p>
                    {state.dose1Taken ? (
                      <div className="taken-badge small">âœ“ {new Date(state.dose1Time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    ) : (
                      <button className="med-btn small" onClick={() => updateState(med.instanceId, { dose1Taken: true, dose1Time: new Date().toISOString(), dose1Elapsed: 0 })}>Tap when taken</button>
                    )}
                  </div>

                  {state.dose1Taken && !state.dose2Taken && (
                    <div className="dose-block">
                      <p className="dose-label">Time since dose 1</p>
                      <div className={`elapsed-timer ${dose1Green ? "elapsed-green" : ""}`}>
                        {formatTime(state.dose1Elapsed || 0)}
                      </div>
                      {dose1Green ? <p className="dose-sub green">âœ“ Dose 2 window open</p> : <p className="dose-sub">Wait {med.doseGapHours}hr</p>}
                    </div>
                  )}
                </div>

                {state.dose1Taken && !state.dose2Taken && (
                  <div className="dose-grid" style={{ marginTop: 14 }}>
                    <div className="dose-block">
                      <p className="dose-label">Dose 2</p>
                      {pastCutoff ? (
                        <div className="alert-badge small">â›” Past {String(cutoffHour).padStart(2, "0")}:00</div>
                      ) : (
                        <button className="med-btn small" onClick={() => updateState(med.instanceId, { dose2Taken: true, dose2Time: new Date().toISOString() })} disabled={!dose1Green}>
                          {dose1Green ? "Tap when taken" : "Not ready"}
                        </button>
                      )}
                    </div>
                    <div className="dose-block">
                      <p className="dose-label">Cutoff time</p>
                      <select className="cutoff-select" value={cutoffHour} onChange={e => updateState(med.instanceId, { cutoffHour: parseInt(e.target.value) })}>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(h => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {state.dose2Taken && (
                  <div className="taken-badge" style={{ marginTop: 12 }}>âœ“ Dose 2 taken at {new Date(state.dose2Time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                )}
              </div>
            )}

            {!med.morningDose && !med.hasFoodTimer && !med.hasNightDoses && (
              <div className="med-card" style={{ textAlign: "center", padding: 20 }}>
                <p style={{ color: "#64748b", fontSize: 13 }}>No timers configured for this medication.</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Custom + Alcohol Timers */}
      {customTimers.length > 0 && (
        <div className="med-group">
          <div className="med-group-header">
            <span className="med-group-name">Other Timers</span>
          </div>

          {customTimers.map(timer => (
            <div key={timer.id} className="med-card">
              <div className="med-card-header">
                <Icon name={timer.type === "alcohol" ? "beer" : "timer"} size={18} />
                <span>{timer.label}</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  {timer.active && !timer.exceeded && (
                    <button className="inline-edit-icon" onClick={() => setEditingTimer({
                      ...timer,
                      onUpdate: (s) => updateTimerSeconds(timer.id, s),
                      onDelete: () => deleteTimer(timer.id),
                    })}>
                      <Icon name="edit" size={14} />
                    </button>
                  )}
                  <button className="inline-edit-icon" onClick={() => deleteTimer(timer.id)}>
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>

              {timer.exceeded ? (
                <div className="alert-badge" style={{ marginBottom: 14 }}>
                  âš ï¸ Alcohol limit exceeded â€” do not take Xywav/Xyrem tonight
                </div>
              ) : (
                <div className={`big-timer ${timer.remainingSeconds === 0 && timer.active ? "timer-done" : ""}`}>
                  {formatTime(timer.remainingSeconds)}
                </div>
              )}

              {timer.type === "alcohol" ? (
                <>
                  {!timer.exceeded && (
                    <p className="timer-sub">
                      {timer.strictMode
                        ? (timer.drinkCount === 0
                            ? "Xywav/Xyrem rules: 1 drink â†’ 4hr Â· 2 drinks â†’ 6hr Â· 3 = stop"
                            : `${timer.drinkCount} drink${timer.drinkCount > 1 ? "s" : ""} Â· ${timer.drinkCount === 1 ? timer.drink1Hours : timer.drink2Hours}hr timer`)
                        : (timer.drinkCount === 0
                            ? `Each drink adds ${timer.drinkHourIncrement}hr Â· first drink starts ${timer.durationSeconds / 3600}hr`
                            : `${timer.drinkCount} drink${timer.drinkCount > 1 ? "s" : ""} logged`)}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    {!timer.exceeded && (
                      <button className="med-btn" style={{ flex: 1 }} onClick={() => logAlcoholDrink(timer.id)}>
                        Log a drink
                      </button>
                    )}
                    {(timer.active || timer.exceeded) && (
                      <button className="reset-btn" style={{ flex: timer.exceeded ? 1 : "0 0 auto", margin: 0, padding: "12px 16px" }} onClick={() => resetTimer(timer.id)}>
                        Reset
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="timer-sub">{timer.durationSeconds / 3600} hour countdown</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!timer.active ? (
                      <button className="med-btn" style={{ flex: 1 }} onClick={() => startCustomTimer(timer.id)}>Start timer</button>
                    ) : (
                      <button className="reset-btn" style={{ flex: 1, margin: 0 }} onClick={() => resetTimer(timer.id)}>Reset timer</button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <button className="add-timer-btn" onClick={() => setShowAddTimer(true)}>
        <Icon name="plus" size={18} /> Add timer
      </button>

      {editingTimer && (
        <EditTimerModal
          timer={editingTimer}
          onSave={(seconds) => {
            if (editingTimer.type === "food") {
              updateState(editingTimer.instanceId, { foodTimer: seconds });
            } else if (editingTimer.onUpdate) {
              editingTimer.onUpdate(seconds);
            }
          }}
          onDelete={editingTimer.onDelete}
          onClose={() => setEditingTimer(null)}
        />
      )}

      {showAddTimer && (
        <AddTimerModal
          onAdd={(timer) => setCustomTimers(prev => [...prev, timer])}
          onClose={() => setShowAddTimer(false)}
          medications={medications}
        />
      )}
    </div>
  );
}

// â”€â”€â”€ LOG SCREEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

      <p className="section-label">SEVERITY (1â€“5)</p>
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

// â”€â”€â”€ MEDICAL ID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function generateQRCode(text, size = 240) {
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=0f172a&margin=2`;
}

function MedicalIDScreen({ medications }) {
  const [editing, setEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const medListString = medications.map(m => m.name).join(", ");
  const [info, setInfo] = useState({
    name: "",
    condition: "",
    medications: medListString,
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
    { key: "notes", label: "Notes for first responders", placeholder: "Anything responders should know", textarea: true },
  ];

  const hasAnyInfo = Object.values(info).some(v => v && v.trim().length > 0);

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
        First responders won't open this app on a locked phone. Generate the QR code below and print it on a wallet card, bracelet, or sticker on your phone case. Anyone can scan it with their phone camera â€” no app required.
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
            â† Back to Medical ID
          </button>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ NAP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            <div className="nap-state-icon">ðŸŒ™</div>
            <p className="nap-state-text">{napSaved ? "Nap saved" : "Ready when you are"}</p>
            <button className="nap-btn start" onClick={startNap}>Start Nap</button>
          </>
        ) : (
          <>
            <div className="nap-state-icon pulsing">ðŸ˜´</div>
            <p className="nap-state-text">Resting</p>
            <div className="nap-timer">{formatTime(napElapsed)}</div>
            <p className="section-label" style={{ textAlign: "center", marginTop: 18 }}>HOW DO YOU FEEL? (1â€“5)</p>
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

// â”€â”€â”€ ROOT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function App() {
  const [medications, setMedications] = useState(null);
  const [screen, setScreen] = useState("home");
  const [medStates, setMedStates] = useState({});
  const [customTimers, setCustomTimers] = useState([]);
  const [logEntries, setLogEntries] = useState([]);
  const [managingMeds, setManagingMeds] = useState(false);

  const handleSetupComplete = (meds) => {
    setMedications(meds);
    const states = {};
    meds.forEach(m => {
      states[m.instanceId] = { morningTaken: false, foodTimer: 0, dose1Taken: false, dose2Taken: false, dose1Elapsed: 0, cutoffHour: m.defaultCutoffHour ?? 5 };
    });
    setMedStates(states);
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
          display: flex; justify-content: center;
        }

        .phone {
          width: 100%; max-width: 440px;
          background: #0a0f1c;
          min-height: 100vh; position: relative;
          color: #e2e8f0;
          display: flex; flex-direction: column;
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
          font-family: 'Fraunces', serif; font-style: italic; font-weight: 400;
          font-size: 36px; line-height: 1.1; color: #f1f5f9; margin-bottom: 8px;
        }
        .setup-sub { color: #64748b; font-size: 14px; }

        .med-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .med-option {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 14px;
          padding: 14px 16px;
          text-align: left; cursor: pointer;
          color: #e2e8f0;
          display: flex; flex-direction: column; gap: 6px;
          font-family: inherit; transition: all 0.15s;
        }
        .med-option:hover { border-color: rgba(129, 140, 248, 0.3); }
        .med-option.selected {
          background: rgba(129, 140, 248, 0.15);
          border-color: rgba(129, 140, 248, 0.5);
        }
        .med-option.multi-selected {
          background: rgba(134, 239, 172, 0.08);
          border-color: rgba(134, 239, 172, 0.4);
        }
        .check-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #86efac;
          color: #0f172a;
          font-size: 12px;
          font-weight: 700;
          margin-right: 8px;
          flex-shrink: 0;
        }
        .med-option.added {
          background: rgba(134, 239, 172, 0.06);
          border-color: rgba(134, 239, 172, 0.25);
          cursor: default;
        }
        .med-option-main { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
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

        .icon-btn {
          background: none; border: none; color: #64748b;
          padding: 6px; cursor: pointer; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
        }
        .icon-btn:hover { color: #fda4af; background: rgba(251, 113, 133, 0.1); }

        .setup-btn {
          width: 100%;
          background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
          color: #0f172a;
          padding: 16px; border: none; border-radius: 14px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; gap: 8px; justify-content: center;
          font-family: inherit; margin-top: 16px;
        }
        .setup-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .back-btn {
          background: none; border: none; color: #64748b;
          padding: 12px; margin-top: 8px;
          font-size: 13px; cursor: pointer; font-family: inherit;
          align-self: center;
        }

        .add-med-btn {
          width: 100%;
          background: transparent;
          border: 1px dashed rgba(148, 163, 184, 0.3);
          color: #cbd5e1;
          padding: 14px;
          border-radius: 14px;
          font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 8px; justify-content: center;
          margin-bottom: 8px;
        }
        .add-med-btn:hover { border-color: rgba(129, 140, 248, 0.5); color: #c7d2fe; }

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
          position: relative; transition: background 0.2s;
          flex-shrink: 0;
        }
        .toggle.on { background: #818cf8; }
        .toggle-dot {
          position: absolute; top: 3px; left: 3px;
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
          padding: 6px 10px; border-radius: 8px;
          font-size: 12px; font-family: inherit;
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
          transition: all 0.2s; font-family: inherit;
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

        .section-label { font-size: 10px; letter-spacing: 0.18em; color: #64748b; font-weight: 600; margin-bottom: 12px; margin-top: 4px; }
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

        /* MED GROUPS */
        .med-group { margin-bottom: 28px; }
        .med-group-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 12px; padding: 0 4px;
        }
        .med-group-name {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-style: italic;
          color: #f1f5f9;
        }

        .med-card {
          background: rgba(30, 41, 59, 0.45);
          border: 1px solid rgba(148, 163, 184, 0.08);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 12px;
          backdrop-filter: blur(8px);
        }
        .med-card-header {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-weight: 600; color: #cbd5e1;
          margin-bottom: 14px; letter-spacing: 0.02em;
        }
        .med-card-header svg { color: #a5b4fc; }
        .inline-edit-icon {
          background: rgba(148, 163, 184, 0.1);
          border: none;
          color: #94a3b8;
          padding: 6px; border-radius: 8px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .inline-edit-icon:hover { color: #c7d2fe; background: rgba(129, 140, 248, 0.15); }
        .inline-edit {
          background: none; border: none; color: #818cf8;
          font-size: 12px; cursor: pointer; margin-left: 6px;
          font-family: inherit;
        }
        .inline-edit:hover { text-decoration: underline; }

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

        .add-timer-btn {
          width: 100%;
          background: linear-gradient(135deg, rgba(129, 140, 248, 0.1) 0%, rgba(168, 85, 247, 0.08) 100%);
          border: 1px dashed rgba(129, 140, 248, 0.4);
          color: #c7d2fe;
          padding: 16px; border-radius: 14px;
          font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 8px; justify-content: center;
          margin-top: 8px;
        }
        .add-timer-btn:hover { border-color: rgba(129, 140, 248, 0.7); background: rgba(129, 140, 248, 0.15); }

        .reset-btn {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #94a3b8;
          padding: 12px; border-radius: 12px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          margin-top: 8px; font-family: inherit;
        }
        .reset-btn:hover { color: #cbd5e1; border-color: rgba(148, 163, 184, 0.4); }

        /* MODAL */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 200;
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); } to { transform: translateY(0); } }
        .modal {
          background: #0f172a;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
          width: 100%; max-width: 440px;
          padding: 22px;
          max-height: 85vh; overflow-y: auto;
          animation: slideUp 0.25s;
        }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 8px;
        }
        .modal-header h3 {
          font-family: 'Fraunces', serif; font-style: italic;
          font-size: 22px; color: #f1f5f9; font-weight: 400;
        }
        .modal-sub { color: #64748b; font-size: 13px; margin-bottom: 20px; }
        .modal-info {
          background: rgba(129, 140, 248, 0.08);
          border: 1px solid rgba(129, 140, 248, 0.2);
          color: #cbd5e1;
          padding: 12px; border-radius: 12px;
          font-size: 12px; line-height: 1.5;
          margin-bottom: 16px;
        }
        .time-pickers { display: flex; gap: 12px; margin-bottom: 20px; }
        .time-picker { flex: 1; }
        .time-picker label {
          display: block; font-size: 11px;
          letter-spacing: 0.1em; color: #64748b;
          text-transform: uppercase; font-weight: 600;
          margin-bottom: 8px;
        }
        .time-picker select {
          width: 100%;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.15);
          color: #e2e8f0;
          padding: 14px; border-radius: 12px;
          font-size: 18px; text-align: center;
          font-family: 'Fraunces', serif;
        }

        .timer-type-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }

        .danger-btn {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(251, 113, 133, 0.3);
          color: #fda4af;
          padding: 12px; border-radius: 12px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: inherit; margin-top: 10px;
          display: flex; align-items: center; gap: 6px; justify-content: center;
        }
        .danger-btn:hover { background: rgba(251, 113, 133, 0.1); }

        /* LOG */
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

        /* MEDICAL ID */
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
          font-size: 13px; color: #94a3b8;
          line-height: 1.6; text-align: center;
          margin-bottom: 22px; padding: 0 8px;
        }
        .back-btn-medid {
          background: none; border: none; color: #64748b;
          padding: 12px; font-size: 13px; cursor: pointer;
          font-family: inherit; width: 100%;
        }
        .back-btn-medid:hover { color: #cbd5e1; }

        /* NAP */
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

        /* TAB BAR */
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
          {!medications || managingMeds ? (
            <SetupScreen onComplete={(meds) => {
              handleSetupComplete(meds);
              setManagingMeds(false);
              setScreen("home");
            }} />
          ) : (
            <>
              {screen === "home" && <HomeScreen setScreen={setScreen} medications={medications} logEntries={logEntries} />}
              {screen === "medication" && <MedicationScreen medications={medications} setMedications={setMedications} medStates={medStates} setMedStates={setMedStates} customTimers={customTimers} setCustomTimers={setCustomTimers} onManageMeds={() => setManagingMeds(true)} />}
              {screen === "log" && <LogScreen logEntries={logEntries} setLogEntries={setLogEntries} />}
              {screen === "medicalid" && <MedicalIDScreen medications={medications} />}
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
