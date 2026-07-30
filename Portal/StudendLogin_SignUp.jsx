import { useEffect, useState } from "react";

const endpoint = `${import.meta.env.BASE_URL}backend/student_portal.php`;

async function portalRequest(payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data;
}

function Dashboard({ student, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  async function changePassword(event) {
    event.preventDefault();
    setMessage("");
    try {
      const data = await portalRequest({
        action: "change_password",
        currentPassword,
        newPassword,
      });
      setMessage(data.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  const name = [student.first_name, student.middle_name, student.surname]
    .filter(Boolean)
    .join(" ");
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-emerald-800 px-6 py-6 text-white shadow-lg">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
              Student Portal
            </p>
            <h1 className="mt-1 text-3xl font-bold">
              Welcome, {student.first_name}
            </h1>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg border border-white/60 px-4 py-2 font-semibold hover:bg-white hover:text-emerald-900"
          >
            Sign out
          </button>
        </header>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">
              Student overview
            </h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <Detail label="Student name" value={name} />
              <Detail
                label="Student ID"
                value={`EBI-${String(student.id).padStart(6, "0")}`}
              />
              <Detail label="Portal username" value={student.portal_username} />
              <Detail label="Programme" value={student.programme} />
              <Detail label="Session" value={student.session} />
              <Detail
                label="Application type"
                value={student.application_type}
              />
            </dl>
          </section>
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Quick links</h2>
            <div className="mt-5 space-y-3 text-sm">
              <p className="rounded-lg bg-emerald-50 p-3 text-emerald-900">
                Profile details
              </p>
              <p className="rounded-lg bg-slate-50 p-3 text-slate-600">
                Results — coming soon
              </p>
              <p className="rounded-lg bg-slate-50 p-3 text-slate-600">
                Fees — coming soon
              </p>
            </div>
          </section>
        </div>
        <section className="mt-6 max-w-xl rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Change password</h2>
          <form onSubmit={changePassword} className="mt-4 space-y-4">
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              type="password"
              minLength="8"
              placeholder="New password (8+ characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">
              Update password
            </button>
            {message && (
              <p role="status" className="text-sm text-slate-700">
                {message}
              </p>
            )}
          </form>
        </section>
        <section className="mt-6 max-w-xl rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Upload Birth Certificate</h2>
          <form onSubmit={uploadBirthCertificate} className="mt-4 space-y-4">
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              type="file"
              accept="application/pdf"
              onChange={(e) => setBirthCertificate(e.target.files)}
              required
            />
            <button className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">
              Upload Birth Certificate
            </button>
            {message && (
              <p role="status" className="text-sm text-slate-700">
                {message}
              </p>
            )}
          </form>
        </section>
      </section>
    </main>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-slate-900">{value || "—"}</dd>
    </div>
  );
}

export default function StudentLoginSignUp() {
  const [student, setStudent] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalRequest({ action: "session" })
      .then(({ student: profile }) => setStudent(profile))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);
  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await portalRequest({ action: "login", username, password });
      setStudent(data.student);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }
  async function logout() {
    await portalRequest({ action: "logout" });
    setStudent(null);
    setUsername("");
    setPassword("");
  }
  if (student) return <Dashboard student={student} onLogout={logout} />;
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <section className="mx-auto max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <header className="bg-emerald-800 p-7 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
            EBI School
          </p>
          <h1 className="mt-2 text-3xl font-bold">Student Portal</h1>
          <p className="mt-2 text-sm text-emerald-50">
            Your login details are created automatically after paid registration
            and sent to your parent or guardian. <br /> "Note that this logins are
            temporal and you can't use to login to the Eden Bulb International
            School's main student portal "
          </p>
        </header>
        <form onSubmit={login} className="space-y-5 p-7">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Username
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {message && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
            >
              {message}
            </p>
          )}
          <button
            disabled={loading}
            className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading ? "Please wait…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
