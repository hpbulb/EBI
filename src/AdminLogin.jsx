import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

const endpoint = `${import.meta.env.BASE_URL}backend/admin-dashboard.php`;

async function parseResponse(response) {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("The administrator server returned an invalid response.");
  }
}

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await parseResponse(
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "login", username, password }),
        }),
      );
      if (!data.success) throw new Error(data.message);
      setAuthenticated(true);
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (authenticated) return <Navigate to="/admin/dashboard" replace />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <header className="bg-slate-900 p-7 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
            EBI School
          </p>
          <h1 className="mt-2 text-3xl font-bold">Administrator sign in</h1>
          <p className="mt-2 text-sm text-slate-300">
            Use your school administrator account to review registrations.
          </p>
        </header>
        <form onSubmit={login} className="space-y-5 p-7">
          <label className="block text-sm font-semibold text-slate-700">
            Username
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
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
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              to="/admin/register"
              className="font-semibold text-amber-700 hover:text-amber-900"
            >
              Register as administrator
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
