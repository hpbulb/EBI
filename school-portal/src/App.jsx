import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { adminCenters, centerFor } from "./adminCenters.js";
import { getSession, getStudents, signOut } from "./api.js";

function Overview({ session }) {
  const [students, setStudents] = useState([]);
  useEffect(() => { getStudents().then((data) => setStudents(data.students || [])).catch(() => setStudents([])); }, []);
  const pending = students.filter((student) => (student.review_status || "pending") === "pending").length;
  return <section className="workspace"><p className="eyebrow">EBI school portal</p><h2>Welcome, {session.full_name}</h2><p className="description">Use your assigned centre to manage student services and school operations.</p><div className="stats"><article><span>Applications</span><strong>{students.length}</strong></article><article><span>Awaiting review</span><strong>{pending}</strong></article><article><span>Your centre</span><strong className="small">{session.admin_block}</strong></article></div></section>;
}

function Portal() {
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { getSession().then((data) => setSession(data.authenticated ? data : false)).catch((err) => { setError(err.message); setSession(false); }); }, []);
  if (session === null) return <main className="status">Connecting to EBI…</main>;
  if (!session) return <main className="status"><h1>EBI School Portal</h1><p>{error || "Please sign in through the EBI administrator portal first."}</p><a href="/EBI/admin/login">Go to administrator sign in</a></main>;
  const assigned = centerFor(session.admin_block);
  const canUse = (center) => session.admin_block === "Super Admin" || center.name === session.admin_block;
  async function logout() { await signOut(); navigate("/"); setSession(false); }
  return <main className="portal"><aside><Link className="brand" to="/">EBI <span>School Portal</span></Link><p className="user">{session.full_name}<small>{session.admin_block}</small></p><nav><Link className={location.pathname === "/" ? "active" : ""} to="/">Overview</Link>{adminCenters.map((center) => canUse(center) ? <Link className={location.pathname === `/centres/${center.path}` ? "active" : ""} to={`/centres/${center.path}`} key={center.path}>{center.name}</Link> : <span className="locked" key={center.path}>{center.name}</span>)}</nav><button className="signout" onClick={logout}>Sign out</button></aside><div className="content"><header><p>Student main portal</p><h1>{assigned ? `${assigned.name} workspace` : "Administrator workspace"}</h1></header><Routes><Route index element={<Overview session={session} />}/>{adminCenters.map(({ path, name, Component }) => <Route key={path} path={`centres/${path}`} element={canUse({ name }) ? <Component /> : <Navigate to="/" replace />} />)}</Routes></div></main>;
}
export default function App() { return <Routes><Route path="/*" element={<Portal />}/></Routes>; }
