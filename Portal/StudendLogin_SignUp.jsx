import { useEffect, useState } from "react";

const endpoint = `${import.meta.env.BASE_URL ?? "/"}backend/student_portal.php`;

async function parsePortalResponse(response) {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("The student portal server returned an invalid response.");
  }
}

async function portalRequest(payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await parsePortalResponse(response);
  if (!data.success) throw new Error(data.message);
  return data;
}

async function portalUpload(formData) {
  const response = await fetch(endpoint, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const data = await parsePortalResponse(response);
  if (!data.success) throw new Error(data.message);
  return data;
}

// ─── Shared UI helpers ──────────────────────────────────────────────────────

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

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-emerald-700 text-white shadow-md"
          : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
      }`}
    >
      {label}
    </button>
  );
}

function SectionHeading({ children }) {
  return (
    <h2 className="border-b border-emerald-200 pb-2 text-xl font-bold text-emerald-900">
      {children}
    </h2>
  );
}

function FormField({ label, children, required = false }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

// ─── Overview Tab ───────────────────────────────────────────────────────────

function OverviewTab({ student }) {
  const name = [student.first_name, student.middle_name, student.surname]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Main info card */}
      <section className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
        <SectionHeading>Student overview</SectionHeading>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <Detail label="Student name" value={name} />
          <Detail
            label="Student ID"
            value={`EBI-${String(student.id).padStart(6, "0")}`}
          />
          <Detail label="Portal username" value={student.portal_username} />
          <Detail label="Programme" value={student.programme} />
          <Detail label="Session" value={student.session} />
          <Detail label="Application type" value={student.application_type} />
          <Detail label="Date of birth" value={student.dob} />
          <Detail label="Gender" value={student.gender} />
          <Detail label="Nationality" value={student.nationality} />
          <Detail label="State of origin" value={student.state_of_origin} />
          <Detail label="LGA" value={student.lga} />
          <Detail label="City" value={student.city} />
          <Detail label="Religion" value={student.religion} />
          <Detail label="Email" value={student.email} />
          <Detail label="Phone" value={student.phone} />
        </dl>
      </section>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Passport thumbnail */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Passport photo
          </h3>
          {student.passport ? (
            <img
              src={`${import.meta.env.BASE_URL}RegistrationFormBackend/${student.passport}`}
              alt="Passport"
              className="mt-3 h-32 w-32 rounded-xl border border-slate-200 object-cover"
            />
          ) : (
            <p className="mt-3 text-sm text-slate-400">Not uploaded</p>
          )}
        </section>

        {/* Quick links */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Quick links
          </h3>
          <div className="mt-3 space-y-3 text-sm">
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

      {/* Guardian & emergency info */}
      <section className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
        <SectionHeading>Guardian &amp; emergency contacts</SectionHeading>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <Detail label="Guardian name" value={student.guardian_name} />
          <Detail label="Relationship" value={student.relationship} />
          <Detail label="Guardian phone" value={student.guardian_phone} />
          <Detail label="Guardian email" value={student.guardian_email} />
          <Detail label="Emergency contact" value={student.emergency_name} />
          <Detail label="Emergency phone" value={student.emergency_phone} />
        </dl>
      </section>

      {/* Health info */}
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <SectionHeading>Health information</SectionHeading>
        <dl className="mt-5 grid gap-5">
          <Detail label="Blood group" value={student.blood_group} />
          <Detail
            label="Medical information"
            value={student.medical_information}
          />
        </dl>
      </section>
    </div>
  );
}

// ─── Documents Tab ──────────────────────────────────────────────────────────

function DocumentsTab({ student, onStudentUpdate }) {
  const [uploading, setUploading] = useState("");
  const [message, setMessage] = useState("");

  async function uploadDocument(documentType, file) {
    setUploading(documentType);
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("action", "upload_document");
      fd.append("document_type", documentType);
      fd.append("file", file);
      const data = await portalUpload(fd);
      onStudentUpdate(data.student);
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading("");
    }
  }

  function handleFileSelect(documentType, event) {
    const file = event.target.files?.[0];
    if (file) uploadDocument(documentType, file);
  }

  return (
    <div className="space-y-6">
      {message && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800"
        >
          {message}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Passport photograph */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Passport photograph</h3>
              <p className="text-xs text-slate-500">
                JPG, PNG, WEBP, or GIF · Max 5 MB
              </p>
            </div>
          </div>

          {student.passport ? (
            <div className="mt-4">
              <img
                src={`${import.meta.env.BASE_URL}RegistrationFormBackend/${student.passport}`}
                alt="Passport"
                className="h-36 w-36 rounded-xl border border-slate-200 object-cover"
              />
              <p className="mt-2 text-xs font-semibold text-emerald-700">
                ✓ Uploaded
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
              <p className="text-sm text-slate-400">No passport uploaded yet</p>
            </div>
          )}

          <label
            className={`mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              uploading === "passport"
                ? "bg-slate-200 text-slate-500"
                : "bg-emerald-700 text-white hover:bg-emerald-800"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!!uploading}
              onChange={(e) => handleFileSelect("passport", e)}
            />
            {uploading === "passport"
              ? "Uploading…"
              : student.passport
                ? "Replace photo"
                : "Upload photo"}
          </label>
        </section>

        {/* Birth certificate */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
                <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Birth certificate</h3>
              <p className="text-xs text-slate-500">
                JPG, PNG, WEBP, GIF, or PDF · Max 5 MB
              </p>
            </div>
          </div>

          {student.birth_certificate ? (
            <div className="mt-4">
              {student.birth_certificate.endsWith(".pdf") ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-8 w-8 text-red-500"
                  >
                    <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
                    <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      PDF Document
                    </p>
                    <a
                      href={`${import.meta.env.BASE_URL}RegistrationFormBackend/${student.birth_certificate}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 underline hover:text-emerald-900"
                    >
                      View file
                    </a>
                  </div>
                </div>
              ) : (
                <img
                  src={`${import.meta.env.BASE_URL}RegistrationFormBackend/${student.birth_certificate}`}
                  alt="Birth certificate"
                  className="h-36 rounded-xl border border-slate-200 object-cover"
                />
              )}
              <p className="mt-2 text-xs font-semibold text-emerald-700">
                ✓ Uploaded
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
              <p className="text-sm text-slate-400">
                No birth certificate uploaded yet
              </p>
            </div>
          )}

          <label
            className={`mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              uploading === "birth_certificate"
                ? "bg-slate-200 text-slate-500"
                : "bg-amber-700 text-white hover:bg-amber-800"
            }`}
          >
            <input
              type="file"
              accept="image/*,.pdf,application/pdf"
              className="hidden"
              disabled={!!uploading}
              onChange={(e) => handleFileSelect("birth_certificate", e)}
            />
            {uploading === "birth_certificate"
              ? "Uploading…"
              : student.birth_certificate
                ? "Replace file"
                : "Upload file"}
          </label>
        </section>
      </div>
    </div>
  );
}

// ─── Edit Profile Tab ───────────────────────────────────────────────────────

function EditProfileTab({ student, onStudentUpdate }) {
  const [form, setForm] = useState({
    firstName: student.first_name || "",
    middleName: student.middle_name || "",
    surname: student.surname || "",
    dob: student.dob || "",
    gender: student.gender || "",
    nationality: student.nationality || "",
    stateOfOrigin: student.state_of_origin || "",
    lga: student.lga || "",
    city: student.city || "",
    religion: student.religion || "",
    email: student.email || "",
    phone: student.phone || "",
    address: student.address || "",
    previousSchool: student.previous_school || "",
    lastClass: student.last_class || "",
    bloodGroup: student.blood_group || "",
    medicalInformation: student.medical_information || "",
    guardianName: student.guardian_name || "",
    relationship: student.relationship || "",
    guardianPhone: student.guardian_phone || "",
    guardianEmail: student.guardian_email || "",
    emergencyName: student.emergency_name || "",
    emergencyPhone: student.emergency_phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await portalRequest({ action: "update_profile", ...form });
      onStudentUpdate(data.student);
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800"
        >
          {message}
        </p>
      )}

      {/* Personal details */}
      <section>
        <SectionHeading>Personal details</SectionHeading>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <FormField label="First name" required>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
          <FormField label="Middle name">
            <input
              name="middleName"
              value={form.middleName}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>
          <FormField label="Surname" required>
            <input
              name="surname"
              value={form.surname}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
          <FormField label="Date of birth" required>
            <input
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
          <FormField label="Gender" required>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </FormField>
          <FormField label="Nationality" required>
            <input
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
          <FormField label="State of origin" required>
            <input
              name="stateOfOrigin"
              value={form.stateOfOrigin}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
          <FormField label="Local government area" required>
            <input
              name="lga"
              value={form.lga}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
          <FormField label="City" required>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
          <FormField label="Religion">
            <select
              name="religion"
              value={form.religion}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select religion</option>
              <option value="Christianity">Christianity</option>
              <option value="Islam">Islam</option>
              <option value="Traditional religion">Traditional religion</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </FormField>
        </div>
      </section>

      {/* Contact details */}
      <section>
        <SectionHeading>Contact details</SectionHeading>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <FormField label="Student email" required>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
          <FormField label="Student phone" required>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
          <FormField label="Home address" required>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
        </div>
      </section>

      {/* Academic details */}
      <section>
        <SectionHeading>Academic history</SectionHeading>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FormField label="Previous school">
            <input
              name="previousSchool"
              value={form.previousSchool}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>
          <FormField label="Last class attended">
            <input
              name="lastClass"
              value={form.lastClass}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>
        </div>
      </section>

      {/* Guardian details */}
      <section>
        <SectionHeading>Guardian &amp; emergency contacts</SectionHeading>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <FormField label="Guardian name" required>
            <input
              name="guardianName"
              value={form.guardianName}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
          <FormField label="Relationship" required>
            <select
              name="relationship"
              value={form.relationship}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="" disabled>
                Select relationship
              </option>
              <option value="Parent">Parent</option>
              <option value="Guardian">Guardian</option>
              <option value="Sibling">Sibling</option>
              <option value="Other">Other</option>
            </select>
          </FormField>
          <FormField label="Guardian phone" required>
            <input
              name="guardianPhone"
              type="tel"
              value={form.guardianPhone}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
          <FormField label="Guardian email">
            <input
              name="guardianEmail"
              type="email"
              value={form.guardianEmail}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>
          <FormField label="Emergency contact name" required>
            <input
              name="emergencyName"
              value={form.emergencyName}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
          <FormField label="Emergency contact phone" required>
            <input
              name="emergencyPhone"
              type="tel"
              value={form.emergencyPhone}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FormField>
        </div>
      </section>

      {/* Health information */}
      <section>
        <SectionHeading>Health information</SectionHeading>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FormField label="Blood group">
            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select blood group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </FormField>
          <FormField label="Medical conditions, allergies, or medications">
            <textarea
              name="medicalInformation"
              rows="3"
              value={form.medicalInformation}
              onChange={handleChange}
              placeholder="Provide relevant information, or write None"
              className={inputClass}
            />
          </FormField>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-700 px-7 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

// ─── Change Password section ────────────────────────────────────────────────

function ChangePasswordSection() {
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

  return (
    <section className="mt-6 max-w-xl rounded-2xl bg-white p-6 shadow-sm">
      <SectionHeading>Change password</SectionHeading>
      <form onSubmit={changePassword} className="mt-4 space-y-4">
        <input
          className={inputClass}
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          className={inputClass}
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
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

function Dashboard({ student: initialStudent, onLogout }) {
  const [student, setStudent] = useState(initialStudent);
  const [activeTab, setActiveTab] = useState("overview");

  function handleStudentUpdate(updatedStudent) {
    setStudent(updatedStudent);
  }

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "documents", label: "Documents" },
    { key: "edit", label: "Edit Profile" },
  ];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto max-w-6xl">
        {/* Header */}
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

        {/* Tab navigation */}
        <nav className="mt-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <TabButton
              key={tab.key}
              label={tab.label}
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </nav>

        {/* Tab content */}
        <div className="mt-6">
          {activeTab === "overview" && <OverviewTab student={student} />}
          {activeTab === "documents" && (
            <DocumentsTab
              student={student}
              onStudentUpdate={handleStudentUpdate}
            />
          )}
          {activeTab === "edit" && (
            <EditProfileTab
              student={student}
              onStudentUpdate={handleStudentUpdate}
            />
          )}
        </div>

        {/* Change password — always visible at the bottom */}
        <ChangePasswordSection />
      </section>
    </main>
  );
}

// ─── Login Screen ───────────────────────────────────────────────────────────

export default function StudentLoginSignUp() {
  const [student, setStudent] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  useEffect(() => {
    portalRequest({ action: "session" })
      .then(({ student: profile }) => {
        setStudent(profile);
      })
      .catch(() => {})
      .finally(() => {
        setCheckingSession(false);
      });
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
    try {
      await portalRequest({ action: "logout" });
    } catch (error) {
      console.error(error);
    } finally {
      setStudent(null);
      setUsername("");
      setPassword("");
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <p className="text-sm font-medium text-slate-600">Loading student portal…</p>
      </main>
    );
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
            and sent to your parent or guardian.
            <span className="text-red-600">
              Note that these login credentials are temporary and cannot be used
              to access the main Eden Bulb International School student portal.
            </span>
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
