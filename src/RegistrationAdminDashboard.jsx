import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const statuses = ["pending", "approved", "rejected"];
const badgeClasses = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-NG", { dateStyle: "medium" });
}

async function parseResponse(response) {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("The dashboard server returned an invalid response.");
  }
}

export default function RegistrationAdminDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState(null);
  const [adminBlock, setAdminBlock] = useState("");
  const [adminName, setAdminName] = useState("");
  const navigate = useNavigate();
  const endpoint = `${import.meta.env.BASE_URL}backend/admin-dashboard.php`;

  useEffect(() => {
    let active = true;
    async function checkSession() {
      try {
        const data = await parseResponse(
          await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ action: "session" }),
          }),
        );
        if (active) {
          setAuthenticated(Boolean(data.authenticated));
          if (data.authenticated) {
            setAdminBlock(data.admin_block || "");
            setAdminName(data.full_name || "");
          }
        }
      } catch {
        if (active) setAuthenticated(false);
      }
    }
    void checkSession();
    return () => {
      active = false;
    };
  }, [endpoint]);

  useEffect(() => {
    if (!authenticated) return undefined;
    let active = true;
    async function loadStudents() {
      try {
        const data = await parseResponse(
          await fetch(endpoint, { credentials: "include" }),
        );
        if (!data.success) throw new Error(data.message);
        if (active) {
          setStudents(data.students || []);
          setSelectedStudent(data.students?.[0] || null);
          setNote(data.students?.[0]?.review_note || "");
        }
      } catch (error) {
        if (active) setMessage(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadStudents();
    return () => {
      active = false;
    };
  }, [authenticated, endpoint]);

  async function logout() {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "logout" }),
    });
    navigate("/admin/login", { replace: true });
  }

  const summary = useMemo(
    () =>
      students.reduce(
        (counts, student) => {
          counts.total += 1;
          counts[student.review_status || "pending"] += 1;
          return counts;
        },
        { total: 0, pending: 0, approved: 0, rejected: 0 },
      ),
    [students],
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      const status = student.review_status || "pending";
      const details = [
        student.full_name,
        student.email,
        student.phone,
        student.programme,
        student.guardian_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (statusFilter === "all" || status === statusFilter) &&
        (!query || details.includes(query))
      );
    });
  }, [search, statusFilter, students]);

  async function updateStatus(status) {
    if (!selectedStudent) return;
    setSaving(true);
    setMessage("");
    try {
      const data = await parseResponse(
        await fetch(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: selectedStudent.id, status, note }),
        }),
      );
      if (!data.success) throw new Error(data.message);
      setStudents((current) =>
        current.map((student) =>
          student.id === data.student.id ? data.student : student,
        ),
      );
      setSelectedStudent(data.student);
      setNote(data.student.review_note || "");
      setMessage("Applicant review saved.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (authenticated === null)
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm font-medium text-slate-600">
          Checking administrator access…
        </p>
      </main>
    );
  if (!authenticated) return <Navigate to="/admin/login" replace />;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
            Registration admin
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Student registration dashboard
          </h1>
          {adminName && (
            <p className="mt-1 text-sm text-slate-300">Signed in as {adminName}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-slate-300">
              Search applications, review submitted details, and record approval
              decisions.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {adminBlock && (
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
                  {adminBlock}
                </span>
              )}
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-500 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total", summary.total, "bg-white"],
            ["Pending", summary.pending, "bg-amber-50"],
            ["Approved", summary.approved, "bg-emerald-50"],
            ["Rejected", summary.rejected, "bg-rose-50"],
          ].map(([label, value, color]) => (
            <div key={label} className={`rounded-2xl p-5 shadow-sm ${color}`}>
              <p className="text-sm text-slate-600">{label}</p>
              <p className="mt-1 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {message && (
          <p
            role="status"
            className="mt-5 rounded-lg bg-white p-3 text-sm font-medium text-slate-700 shadow-sm"
          >
            {message}
          </p>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search applicants"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-amber-500"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-amber-500"
              >
                <option value="all">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            {loading ? (
              <p className="p-8 text-center text-slate-500">
                Loading registrations…
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-5 py-3">Applicant</th>
                      <th className="px-5 py-3">Programme</th>
                      <th className="px-5 py-3">Submitted</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => {
                      const status = student.review_status || "pending";
                      return (
                        <tr
                          key={student.id}
                          onClick={() => {
                            setSelectedStudent(student);
                            setNote(student.review_note || "");
                          }}
                          className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${selectedStudent?.id === student.id ? "bg-amber-50" : ""}`}
                        >
                          <td className="px-5 py-4 font-medium">
                            {student.full_name}
                            <span className="mt-1 block text-xs font-normal text-slate-500">
                              {student.email}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {student.programme || "—"}
                          </td>
                          <td className="px-5 py-4">
                            {formatDate(student.created_at)}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeClasses[status]}`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredStudents.length === 0 && (
                  <p className="p-8 text-center text-slate-500">
                    No applicants match these filters.
                  </p>
                )}
              </div>
            )}
          </section>

          <aside className="rounded-2xl bg-white p-6 shadow-sm">
            {selectedStudent ? (
              <>
                <h2 className="text-2xl font-bold">
                  {selectedStudent.full_name}
                </h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold">Email</dt>
                    <dd>{selectedStudent.email}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Phone</dt>
                    <dd>{selectedStudent.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Guardian</dt>
                    <dd>{selectedStudent.guardian_name || "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Address</dt>
                    <dd>{selectedStudent.address || "—"}</dd>
                  </div>
                </dl>
                <label className="mt-6 block text-sm font-semibold">
                  Review note
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows="4"
                    className="mt-2 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-amber-500"
                  />
                </label>
                <div className="mt-5 flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={saving}
                      onClick={() => updateStatus(status)}
                      className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold capitalize text-white hover:bg-slate-700 disabled:opacity-50"
                    >
                      Mark {status}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-slate-500">
                Select an applicant to view their details.
              </p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
