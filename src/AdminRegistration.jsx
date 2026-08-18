import { useState } from "react";
import { apiUrl } from "./apiBase";
import { Link, Navigate, useNavigate } from "react-router-dom";

const endpoint = apiUrl("backend/admin-dashboard.php");

const adminBlocks = [
  "Admissions",
  "Academics",
  "Student Affairs",
  "Finance",
  "Administration",
  "Examinations",
  "ICT",
  "Library",
];

async function parseResponse(response) {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("The administrator server returned an invalid response.");
  }
}

export default function AdminRegistration() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminBlock, setAdminBlock] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  async function register(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      const data = await parseResponse(
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: "register",
            fullName,
            email,
            password,
            adminBlock,
            registrationCode,
          }),
        }),
      );

      if (!data.success) throw new Error(data.message);

      setRegistered(true);
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (registered) return <Navigate to="/admin/dashboard" replace />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <header className="bg-slate-900 p-7 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
            EBI School
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Administrator registration
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Create an administrator account and select the block you want to
            work in.
          </p>
        </header>
        <form onSubmit={register} className="space-y-5 p-7">
          <label className="block text-sm font-semibold text-slate-700">
            Full name
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-amber-500"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              autoComplete="name"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Email address
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-amber-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-amber-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Confirm password
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-amber-500"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Administrator registration code
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-amber-500"
              value={registrationCode}
              onChange={(event) => setRegistrationCode(event.target.value)}
              required
              autoComplete="off"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Admin block
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-amber-500"
              value={adminBlock}
              onChange={(event) => setAdminBlock(event.target.value)}
              required
            >
              <option value="" disabled>
                Select your admin block
              </option>
              {adminBlocks.map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>
          </label>

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
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create administrator account"}
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/admin/login"
              className="font-semibold text-amber-700 hover:text-amber-900"
            >
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
