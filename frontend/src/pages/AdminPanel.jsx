import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ShieldCheck, Users, Mail, FileSpreadsheet, Activity, LogOut, Crown, UserCog
} from "lucide-react";
import { BRAND_STRAPLINE } from "@/constants/brand";
import { PAGE_FADE_IN } from "@/constants/motion";
import { useAuth } from "@/auth/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ROLE_OPTIONS = ["super_admin", "photographer", "client"];

function Stat({ label, value, sub, icon: Icon }) {
  return (
    <div className="border border-white/10 rounded-md p-6 bg-white/[0.02]" data-testid={`admin-stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500">{label}</p>
        {Icon && <Icon size={16} className="text-[#D4AF37]" strokeWidth={1.6} />}
      </div>
      <p className="font-serif-twc text-4xl text-[#FDFBF7] tracking-tight">{value}</p>
      {sub && <p className="font-sans-twc text-xs text-zinc-500 mt-2">{sub}</p>}
    </div>
  );
}

function RoleBadge({ role }) {
  const cls = {
    super_admin: "text-[#D4AF37] border-[#D4AF37]/40 bg-[#1a1410]",
    photographer: "text-zinc-200 border-white/20",
    client: "text-zinc-400 border-white/10",
  }[role] || "text-zinc-400 border-white/10";
  return <span className={`inline-flex items-center gap-1.5 border rounded-sm px-2 py-0.5 font-sans-twc text-[10px] uppercase tracking-[0.22em] ${cls}`}>{role === "super_admin" && <Crown size={10} />}{role}</span>;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState(null);
  const [audit, setAudit] = useState(null);
  const [tab, setTab] = useState("overview");

  const refresh = useCallback(async () => {
    const [o, u, a] = await Promise.all([
      axios.get(`${API}/admin/overview`, { withCredentials: true }),
      axios.get(`${API}/admin/users`, { withCredentials: true }),
      axios.get(`${API}/admin/audit`, { withCredentials: true }),
    ]);
    setOverview(o.data); setUsers(u.data); setAudit(a.data);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const onRoleChange = async (userId, role) => {
    await axios.patch(`${API}/admin/users/${userId}/role`, { role }, { withCredentials: true });
    await refresh();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (!overview) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-sans-twc text-xs uppercase tracking-[0.3em]" data-testid="admin-loading">Loading the command room…</div>;
  }

  const t = overview.totals;

  return (
    <div className="min-h-screen bg-black" data-testid="admin-panel">
      <div className="border-b border-white/5 backdrop-blur-md bg-black/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-zinc-500 hover:text-white inline-flex items-center gap-2 font-sans-twc text-xs uppercase tracking-[0.22em] transition" data-testid="admin-back">
              <ArrowLeft size={14} /> The Wed Cinema
            </Link>
            <span className="hidden md:inline text-zinc-700">/</span>
            <span className="hidden md:inline font-sans-twc text-[11px] uppercase tracking-[0.28em] text-[#D4AF37] inline-flex items-center gap-2"><ShieldCheck size={12} /> Super Admin</span>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2" data-testid="admin-user-pill">
                {user.picture && <img src={user.picture} alt="" className="w-7 h-7 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />}
                <span className="hidden lg:inline font-sans-twc text-[11px] uppercase tracking-[0.22em] text-zinc-300">{user.name}</span>
                <RoleBadge role={user.role || "photographer"} />
              </div>
            )}
            <button onClick={handleLogout} className="border border-white/15 hover:bg-white/10 text-white font-sans-twc text-[11px] uppercase tracking-[0.22em] px-3 py-2 rounded-sm transition inline-flex items-center gap-2" data-testid="admin-logout">
              <LogOut size={12} /> <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <motion.div {...PAGE_FADE_IN}>
          <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3">Command Room</p>
          <h1 className="font-serif-twc text-5xl md:text-7xl text-[#FDFBF7] tracking-tighter leading-[0.95]">Super Admin.</h1>
          <p className="font-sans-twc text-zinc-400 leading-relaxed mt-6 max-w-2xl">Every photographer. Every client. Every session. Full RBAC, audit-logged actions, role transitions, and a live count of what&apos;s flowing through The Wed Cinema right now.</p>
        </motion.div>

        <div className="mt-12 inline-flex items-center gap-1 border border-white/10 rounded-sm p-1 bg-white/[0.02]" data-testid="admin-tabs">
          {[
            { id: "overview", label: "Overview" },
            { id: "users",    label: "Users & Roles" },
            { id: "audit",    label: "Audit Log" },
          ].map((x) => (
            <button key={x.id} onClick={() => setTab(x.id)} className={`px-4 py-2 rounded-sm font-sans-twc text-[11px] uppercase tracking-[0.22em] transition ${tab === x.id ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"}`} data-testid={`admin-tab-${x.id}`}>
              {x.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="mt-10 grid md:grid-cols-3 gap-4" data-testid="admin-overview-pane">
            <Stat label="Total Users" value={t.users} sub={`SA ${t.by_role.super_admin} · P ${t.by_role.photographer} · C ${t.by_role.client}`} icon={Users} />
            <Stat label="Founder Applications" value={t.founder_applications} sub="100 spot cap" icon={FileSpreadsheet} />
            <Stat label="Active Sessions" value={t.active_sessions} sub="across all roles" icon={Activity} />
            <Stat label="Weddings Live" value={t.weddings} sub="public OTT routes" icon={Crown} />
            <Stat label="Photo Categories" value={t.photo_categories} sub="GitHub-synced" icon={FileSpreadsheet} />
            <Stat label="Client Invites" value={t.client_invites} sub="pending + accepted" icon={Mail} />
          </div>
        )}

        {tab === "users" && users && (
          <div className="mt-10 border border-white/10 rounded-md bg-white/[0.02] overflow-x-auto" data-testid="admin-users-pane">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left font-sans-twc text-[10px] uppercase tracking-[0.22em] text-zinc-500 px-5 py-4">User</th>
                  <th className="text-left font-sans-twc text-[10px] uppercase tracking-[0.22em] text-zinc-500 px-5 py-4">Email</th>
                  <th className="text-left font-sans-twc text-[10px] uppercase tracking-[0.22em] text-zinc-500 px-5 py-4">Role</th>
                  <th className="text-left font-sans-twc text-[10px] uppercase tracking-[0.22em] text-zinc-500 px-5 py-4">Joined</th>
                  <th className="text-right font-sans-twc text-[10px] uppercase tracking-[0.22em] text-zinc-500 px-5 py-4">Change Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-b border-white/5 hover:bg-white/[0.03]" data-testid={`admin-user-row-${u.user_id}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {u.picture ? <img src={u.picture} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" /> : <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><UserCog size={14} className="text-zinc-500" /></div>}
                        <span className="font-serif-twc text-[#FDFBF7]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-sans-twc text-sm text-zinc-300">{u.email}</td>
                    <td className="px-5 py-4"><RoleBadge role={u.role || "photographer"} /></td>
                    <td className="px-5 py-4 font-sans-twc text-[11px] uppercase tracking-[0.22em] text-zinc-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-4 text-right">
                      <select defaultValue={u.role || "photographer"} onChange={(e) => onRoleChange(u.user_id, e.target.value)} className="bg-black border border-white/15 hover:border-white/30 focus:border-[#D4AF37] outline-none rounded-sm px-3 py-2 font-sans-twc text-xs text-[#FDFBF7] transition" data-testid={`admin-role-select-${u.user_id}`}>
                        {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "audit" && audit && (
          <div className="mt-10 border border-white/10 rounded-md bg-white/[0.02]" data-testid="admin-audit-pane">
            {audit.length === 0 && <p className="font-sans-twc text-zinc-500 text-xs uppercase tracking-[0.28em] p-8">No audit entries yet.</p>}
            {audit.map((a) => (
              <div key={a.id} className="px-5 py-4 border-b border-white/5 flex items-center justify-between gap-4" data-testid={`admin-audit-${a.id}`}>
                <div>
                  <p className="font-serif-twc text-lg text-[#FDFBF7]">{a.action}</p>
                  <p className="font-sans-twc text-[11px] uppercase tracking-[0.22em] text-zinc-500 mt-0.5">actor: {a.actor_id} · target: {a.target || "—"}</p>
                </div>
                <span className="font-sans-twc text-[10px] uppercase tracking-[0.22em] text-zinc-500">{a.ts ? new Date(a.ts).toLocaleString() : "—"}</span>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="font-sans-twc text-[11px] uppercase tracking-[0.28em] text-zinc-500" data-testid="brand-strapline">{BRAND_STRAPLINE}</p>
        </footer>
      </div>
    </div>
  );
}
