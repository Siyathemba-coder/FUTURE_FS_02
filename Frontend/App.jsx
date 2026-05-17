import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:3001/api";

const STATUS_META = {
  new:       { label: "New",       color: "#D4A843", bg: "#2A2210", dot: "#F5C842" },
  contacted: { label: "Contacted", color: "#6B9FD4", bg: "#111E2E", dot: "#4A90D9" },
  converted: { label: "Converted", color: "#5DB87A", bg: "#0E2018", dot: "#3ECF6A" },
};

const SOURCE_ICONS = {
  "Contact Form": "⊞",
  "LinkedIn":     "in",
  "Referral":     "⇢",
  "Cold Email":   "✉",
  "Other":        "◈",
};

async function apiFetch(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function initials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function timeAgo(ts) {
  const d = Date.now() - new Date(ts);
  if (d < 60000) return "just now";
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

// ─── Status Badge ────────────────────────────────────────────────
function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.new;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: 4,
      background: m.bg, color: m.color,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
      textTransform: "uppercase", border: `1px solid ${m.color}22`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────
function Avatar({ name, size = 36 }) {
  const colors = ["#C8793A","#4A90D9","#5DB87A","#A06AD4","#D4637A","#6BBAB8"];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: colors[idx] + "22", border: `1.5px solid ${colors[idx]}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: colors[idx],
      flexShrink: 0, fontFamily: "var(--font-mono, monospace)",
    }}>
      {initials(name)}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: "#0E0E0F", border: "1px solid #222", borderRadius: 8,
      padding: "14px 18px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, width: 3, height: "100%",
        background: accent, borderRadius: "8px 0 0 8px",
      }} />
      <div style={{ fontSize: 11, color: "#555", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#E8E4DC", fontFamily: "'DM Mono', monospace" }}>{value}</div>
    </div>
  );
}

// ─── Notes Panel ─────────────────────────────────────────────────
function NotesPanel({ lead, onClose }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/leads/${lead.id}/notes`).then(setNotes).finally(() => setLoading(false));
  }, [lead.id]);

  const add = async () => {
    if (!text.trim()) return;
    const note = await apiFetch(`/leads/${lead.id}/notes`, { method: "POST", body: JSON.stringify({ content: text }) });
    setNotes(prev => [note, ...prev]);
    setText("");
  };

  const del = async (nid) => {
    await apiFetch(`/notes/${nid}`, { method: "DELETE" });
    setNotes(prev => prev.filter(n => n.id !== nid));
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
      zIndex: 200, backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 400, height: "100vh", background: "#0A0A0B",
        borderLeft: "1px solid #222", display: "flex", flexDirection: "column",
        animation: "slideIn 0.2s ease",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1A1A1A", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={lead.name} size={34} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#E8E4DC" }}>{lead.name}</div>
              <div style={{ fontSize: 11, color: "#444" }}>{lead.email}</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#555", fontSize: 20,
            cursor: "pointer", padding: "4px 8px", lineHeight: 1,
          }}>×</button>
        </div>

        <div style={{ padding: "16px 24px", borderBottom: "1px solid #1A1A1A" }}>
          <div style={{ fontSize: 11, color: "#555", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Add note</div>
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder="Write a follow-up note…"
            rows={3}
            style={{
              width: "100%", background: "#111", border: "1px solid #222",
              borderRadius: 6, color: "#D4CFC7", fontSize: 13, padding: "10px 12px",
              resize: "none", fontFamily: "inherit", outline: "none",
            }}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add(); }}
          />
          <button onClick={add} style={{
            marginTop: 8, padding: "7px 16px", background: "#C8793A",
            border: "none", borderRadius: 5, color: "#fff", fontSize: 12,
            fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em",
          }}>Save note ↵</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {loading && <div style={{ color: "#444", fontSize: 13, textAlign: "center", marginTop: 40 }}>Loading…</div>}
          {!loading && notes.length === 0 && (
            <div style={{ color: "#333", fontSize: 13, textAlign: "center", marginTop: 40 }}>No notes yet.</div>
          )}
          {notes.map(n => (
            <div key={n.id} style={{
              background: "#0E0E0F", border: "1px solid #1C1C1C",
              borderRadius: 6, padding: "12px 14px", marginBottom: 10, position: "relative",
            }}>
              <p style={{ color: "#C8C3BB", fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{n.content}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: "#333" }}>{timeAgo(n.created_at)}</span>
                <button onClick={() => del(n.id)} style={{
                  background: "none", border: "none", color: "#333",
                  fontSize: 12, cursor: "pointer", padding: "2px 6px",
                  borderRadius: 3, transition: "color 0.15s",
                }} onMouseEnter={e => e.target.style.color = "#D4637A"}
                   onMouseLeave={e => e.target.style.color = "#333"}>
                  delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Add / Edit Lead Modal ────────────────────────────────────────
function LeadModal({ lead, onSave, onClose }) {
  const [form, setForm] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    source: lead?.source || "Contact Form",
    status: lead?.status || "new",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    setSaving(true); setError("");
    try {
      const result = lead
        ? await apiFetch(`/leads/${lead.id}`, { method: "PUT", body: JSON.stringify(form) })
        : await apiFetch("/leads", { method: "POST", body: JSON.stringify(form) });
      onSave(result, !!lead);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, color: "#555", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>{label}</label>
      <input
        type={type} value={form[key]} placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        style={{
          width: "100%", background: "#0E0E0F", border: "1px solid #252525",
          borderRadius: 6, color: "#D4CFC7", fontSize: 14, padding: "9px 12px",
          outline: "none", fontFamily: "inherit",
        }}
      />
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 300, backdropFilter: "blur(6px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 440, background: "#0A0A0B", border: "1px solid #222",
        borderRadius: 12, overflow: "hidden",
        animation: "fadeUp 0.18s ease",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #181818", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#E8E4DC" }}>{lead ? "Edit lead" : "New lead"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#444", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {field("Full name", "name", "text", "e.g. Amara Nkosi")}
          {field("Email", "email", "email", "email@company.com")}
          {field("Phone", "phone", "tel", "+27 82 000 0000")}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: "#555", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Source</label>
              <select value={form.source} onChange={e => set("source", e.target.value)} style={{
                width: "100%", background: "#0E0E0F", border: "1px solid #252525",
                borderRadius: 6, color: "#D4CFC7", fontSize: 14, padding: "9px 12px", fontFamily: "inherit",
              }}>
                {["Contact Form","LinkedIn","Referral","Cold Email","Other"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#555", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} style={{
                width: "100%", background: "#0E0E0F", border: "1px solid #252525",
                borderRadius: 6, color: "#D4CFC7", fontSize: 14, padding: "9px 12px", fontFamily: "inherit",
              }}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
              </select>
            </div>
          </div>

          {error && <div style={{ color: "#D4637A", fontSize: 12, marginBottom: 12 }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{
              padding: "8px 18px", background: "none", border: "1px solid #252525",
              borderRadius: 6, color: "#666", fontSize: 13, cursor: "pointer",
            }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{
              padding: "8px 22px", background: "#C8793A", border: "none",
              borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
            }}>{saving ? "Saving…" : lead ? "Update" : "Create lead"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lead Row ────────────────────────────────────────────────────
function LeadRow({ lead, onEdit, onDelete, onNotes, onStatusChange }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${lead.name}?`)) return;
    setDeleting(true);
    await apiFetch(`/leads/${lead.id}`, { method: "DELETE" });
    onDelete(lead.id);
  };

  return (
    <tr style={{ borderBottom: "1px solid #141414", transition: "background 0.1s" }}
        onMouseEnter={e => { e.currentTarget.style.background = "#0E0E0F"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
      <td style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={lead.name} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#E8E4DC" }}>{lead.name}</div>
            <div style={{ fontSize: 12, color: "#444" }}>{lead.email}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "14px 16px" }}>
        <span style={{ fontSize: 12, color: "#666" }}>{lead.phone || <span style={{ color: "#2A2A2A" }}>—</span>}</span>
      </td>
      <td style={{ padding: "14px 16px" }}>
        <span style={{ fontSize: 12, color: "#555", fontFamily: "'DM Mono', monospace" }}>
          {SOURCE_ICONS[lead.source] || "◈"} {lead.source}
        </span>
      </td>
      <td style={{ padding: "14px 16px" }}>
        <select
          value={lead.status}
          onChange={e => onStatusChange(lead.id, e.target.value)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: 11, color: "inherit",
          }}
        >
          <option value="new">● New</option>
          <option value="contacted">● Contacted</option>
          <option value="converted">● Converted</option>
        </select>
        <StatusBadge status={lead.status} />
      </td>
      <td style={{ padding: "14px 16px", fontSize: 11, color: "#333", fontFamily: "'DM Mono', monospace" }}>
        {timeAgo(lead.created_at)}
      </td>
      <td style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <ActionBtn onClick={() => onNotes(lead)} title="Notes">✎</ActionBtn>
          <ActionBtn onClick={() => onEdit(lead)} title="Edit">⊙</ActionBtn>
          <ActionBtn onClick={handleDelete} title="Delete" danger disabled={deleting}>✕</ActionBtn>
        </div>
      </td>
    </tr>
  );
}

function ActionBtn({ onClick, children, title, danger, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 28, height: 28, border: `1px solid ${hov ? (danger ? "#D4637A" : "#333") : "#1C1C1C"}`,
        borderRadius: 5, background: hov ? (danger ? "#200A0D" : "#161616") : "none",
        color: hov ? (danger ? "#D4637A" : "#C8793A") : "#333",
        fontSize: 13, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.12s",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
      {children}
    </button>
  );
}

// ─── Main App ────────────────────────────────────────────────────
export default function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);       // null | "add" | lead object
  const [notesLead, setNotesLead] = useState(null);
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await apiFetch("/leads");
      setLeads(data);
    } catch (e) { setError("Could not connect to the API. Is your backend running on port 3001?"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = (lead, isEdit) => {
    setLeads(prev => isEdit ? prev.map(l => l.id === lead.id ? lead : l) : [lead, ...prev]);
    setModal(null);
  };

  const handleDelete = (id) => setLeads(prev => prev.filter(l => l.id !== id));

  const handleStatusChange = async (id, status) => {
    const lead = leads.find(l => l.id === id);
    const updated = await apiFetch(`/leads/${id}`, { method: "PUT", body: JSON.stringify({ ...lead, status }) });
    setLeads(prev => prev.map(l => l.id === id ? updated : l));
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = leads
    .filter(l => filter === "all" || l.status === filter)
    .filter(l => {
      const q = search.toLowerCase();
      return !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.source || "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      let av = a[sortKey] || ""; let bv = b[sortKey] || "";
      if (sortKey === "created_at") { av = new Date(av); bv = new Date(bv); }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const counts = {
    all: leads.length,
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    converted: leads.filter(l => l.status === "converted").length,
  };

  const SortTh = ({ label, k, style }) => (
    <th onClick={() => toggleSort(k)} style={{
      padding: "10px 16px", fontSize: 11, color: sortKey === k ? "#C8793A" : "#333",
      fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase",
      textAlign: "left", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", ...style,
    }}>
      {label} {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { background: #060607; font-family: 'Inter', sans-serif; color: #D4CFC7; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0A0A0B; } ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
        select { appearance: none; cursor: pointer; }
        input::placeholder { color: #2A2A2A; }
        textarea::placeholder { color: #2A2A2A; }
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{
          padding: "0 40px", height: 60, display: "flex", alignItems: "center",
          justifyContent: "space-between", borderBottom: "1px solid #141414",
          position: "sticky", top: 0, background: "#060607", zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 28, height: 28, background: "#C8793A",
              borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif",
            }}>C</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#E8E4DC", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>MiniCRM</span>
            <span style={{ fontSize: 11, color: "#2A2A2A", paddingLeft: 14, borderLeft: "1px solid #1A1A1A" }}>Lead Management</span>
          </div>
          <button onClick={() => setModal("add")} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "7px 16px", background: "#C8793A", border: "none",
            borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.01em",
            transition: "opacity 0.15s",
          }} onMouseEnter={e => e.target.style.opacity = 0.85} onMouseLeave={e => e.target.style.opacity = 1}>
            + New lead
          </button>
        </header>

        <main style={{ flex: 1, padding: "32px 40px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
            <StatCard label="Total Leads" value={counts.all} accent="#C8793A" />
            <StatCard label="New" value={counts.new} accent="#F5C842" />
            <StatCard label="Contacted" value={counts.contacted} accent="#4A90D9" />
            <StatCard label="Converted" value={counts.converted} accent="#3ECF6A" />
          </div>

          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {["all","new","contacted","converted"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "5px 14px", borderRadius: 5,
                  border: `1px solid ${filter === f ? "#C8793A" : "#1C1C1C"}`,
                  background: filter === f ? "#1D1208" : "none",
                  color: filter === f ? "#C8793A" : "#444",
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  fontWeight: filter === f ? 600 : 400, transition: "all 0.12s",
                  textTransform: "capitalize",
                }}>
                  {f === "all" ? `All (${counts.all})` : `${STATUS_META[f].label} (${counts[f]})`}
                </button>
              ))}
            </div>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, source…"
              style={{
                background: "#0A0A0B", border: "1px solid #1C1C1C", borderRadius: 6,
                color: "#C8C3BB", fontSize: 13, padding: "7px 14px", width: 260,
                fontFamily: "inherit", outline: "none",
              }}
            />
          </div>

          {/* Table */}
          <div style={{ background: "#080809", border: "1px solid #141414", borderRadius: 10, overflow: "hidden" }}>
            {error && (
              <div style={{ padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#D4637A", marginBottom: 8 }}>{error}</div>
                <button onClick={load} style={{
                  padding: "6px 14px", background: "none", border: "1px solid #252525",
                  borderRadius: 5, color: "#555", fontSize: 12, cursor: "pointer",
                }}>Retry</button>
              </div>
            )}
            {loading && !error && (
              <div style={{ padding: 60, textAlign: "center", color: "#222", fontSize: 13, animation: "pulse 1.5s infinite" }}>Loading leads…</div>
            )}
            {!loading && !error && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #141414", background: "#060607" }}>
                    <SortTh label="Lead" k="name" />
                    <SortTh label="Phone" k="phone" />
                    <SortTh label="Source" k="source" />
                    <SortTh label="Status" k="status" />
                    <SortTh label="Added" k="created_at" />
                    <th style={{ padding: "10px 16px", fontSize: 11, color: "#222", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", textAlign: "left" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 60, textAlign: "center", color: "#282828", fontSize: 13 }}>
                        {search ? "No leads match your search." : "No leads yet. Add your first one →"}
                      </td>
                    </tr>
                  ) : filtered.map(lead => (
                    <LeadRow key={lead.id} lead={lead}
                      onEdit={l => setModal(l)}
                      onDelete={handleDelete}
                      onNotes={l => setNotesLead(l)}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && !error && filtered.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 11, color: "#2A2A2A", textAlign: "right" }}>
              {filtered.length} of {leads.length} leads
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {modal && (
        <LeadModal
          lead={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {notesLead && <NotesPanel lead={notesLead} onClose={() => setNotesLead(null)} />}
    </>
  );
}
