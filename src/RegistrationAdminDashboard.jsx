import { useEffect, useMemo, useState } from "react";
import Modal from "./modal.jsx";

const statusBadgeClass = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

const statusLabel = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function RegistrationAdminDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, message: "" });

  const apiUrl = `${import.meta.env.BASE_URL}backend/admin-dashboard.php`;

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Unable to load registrations.");
        }

        if (cancelled) {
          return;
        }

        setStudents(data.students || []);
        if (data.students?.[0]) {
          setSelectedStudent((current) => {
            if (!current) {
              return data.students[0];
            }

            return data.students.find((student) => student.id === current.id) || current;
          });
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
        setModalState({
          isOpen: true,
          message: error.message || "We could not load the dashboard right now.",
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  const stats = useMemo(() => {
    const summary = {
      total: students.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    students.forEach((student) => {
      const status = student.review_status || "pending";
      if (status === "approved") {
        summary.approved += 1;
      } else if (status === "rejected") {
        summary.rejected += 1;
      } else {
        summary.pending += 1;
      }
    });

    return summary;
  }, [students]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesStatus = statusFilter === "all" || student.review_status === statusFilter;
      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [
        student.full_name,
        student.email,
        student.programme,
        student.application_type,
        student.phone,
        student.guardian_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [search, statusFilter, students]);

  const updateStatus = async (status) => {
    if (!selectedStudent) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedStudent.id,
          status,
          note,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to save applicant review.");
      }

      setStudents((current) =>
        current.map((student) => (student.id === selectedStudent.id ? data.student : student)),
      );
      setSelectedStudent(data.student);
      setModalState({
        isOpen: true,
        message: `${data.student.full_name} is now marked ${statusLabel[status]}.`,
      });
    } catch (error) {
      console.error(error);
      setModalState({
        isOpen: true,
        message: error.message || "The update could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-800 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-100">
                Registration admin
              </p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                Review and manage student registrations
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                Track every application at a glance, search by applicant details, and update the review status for each student.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-sm text-slate-100">Live view</p>
              <p className="text-2xl font-semibold">{stats.total} applicants</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total applications</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-700">Pending review</p>
            <p className="mt-2 text-3xl font-bold text-amber-900">{stats.pending}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">Approved</p>
            <p className="mt-2 text-3xl font-bold text-emerald-900">{stats.approved}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-rose-700">Rejected</p>
            <p className="mt-2 text-3xl font-bold text-rose-900">{stats.rejected}</p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Applicant list</h2>
                  <p className="text-sm text-slate-500">
                    Filter by name, programme, or review status.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search applicants"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">Loading applications…</div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No applicants match the current filters.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Applicant</th>
                      <th className="px-5 py-3 font-semibold">Programme</th>
                      <th className="px-5 py-3 font-semibold">Submitted</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className={`cursor-pointer transition hover:bg-slate-50 ${selectedStudent?.id === student.id ? "bg-amber-50" : ""}`}
                        onClick={() => {
                          setSelectedStudent(student);
                          setNote(student.review_note || "");
                        }}
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">{student.full_name}</div>
                          <div className="mt-1 text-xs text-slate-500">{student.email}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-700">{student.programme || "—"}</td>
                        <td className="px-5 py-4 text-slate-700">{formatDate(student.created_at)}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass[student.review_status || "pending"]}`}>
                            {statusLabel[student.review_status || "pending"]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {selectedStudent ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
                      Selected application
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                      {selectedStudent.full_name}
                    </h2>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass[selectedStudent.review_status || "pending"]}`}>
                    {statusLabel[selectedStudent.review_status || "pending"]}
                  </span>
                </div>

                <dl className="mt-6 space-y-4 text-sm text-slate-700">
                  <div>
                    <dt className="font-semibold text-slate-900">Email</dt>
                    <dd className="mt-1">{selectedStudent.email}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Phone</dt>
                    <dd className="mt-1">{selectedStudent.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Programme</dt>
                    <dd className="mt-1">{selectedStudent.programme || "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Application type</dt>
                    <dd className="mt-1">{selectedStudent.application_type || "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Academic session</dt>
                    <dd className="mt-1">{selectedStudent.session || "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Guardian</dt>
                    <dd className="mt-1">{selectedStudent.guardian_name || "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Address</dt>
                    <dd className="mt-1">{selectedStudent.address || "—"}</dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <label htmlFor="review-note" className="text-sm font-semibold text-slate-700">
                    Review note
                  </label>
                  <textarea
                    id="review-note"
                    rows="4"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Add internal notes for this application"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => updateStatus("pending")}
                    disabled={saving}
                    className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
                  >
                    Mark pending
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus("approved")}
                    disabled={saving}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus("rejected")}
                    disabled={saving}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Select an applicant from the list to review their details.
              </div>
            )}
          </aside>
        </section>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        title="Dashboard update"
        message={modalState.message}
        onClose={() => setModalState({ isOpen: false, message: "" })}
      />
    </main>
  );
}

export default RegistrationAdminDashboard;
