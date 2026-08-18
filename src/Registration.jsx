import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "./apiBase";
import Modal from "./modal.jsx";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200";

const initialFormData = {
  surname: "",
  firstName: "",
  middleName: "",
  dateOfBirth: "",
  gender: "",
  // maritalStatus: "",
  nationality: "Nigerian",
  stateOfOrigin: "",
  lga: "",
  city: "",
  religion: "",
  applicationType: "",
  programme: "",
  session: "",
  previousSchool: "",
  lastClass: "",
  startDate: "",
  email: "",
  phone: "",
  address: "",
  guardianName: "",
  relationship: "",
  guardianPhone: "",
  guardianEmail: "",
  emergencyName: "",
  emergencyPhone: "",
  bloodGroup: "",
  medicalInformation: "",
};

async function parseApiResponse(response) {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(
      "The server returned an invalid response. Please try again or contact the school office.",
    );
  }
}

function Field({ label, name, children, required = false }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      {children}
    </div>
  );
}

function Registration() {
  const [formData, setFormData] = useState(initialFormData);
  const [passportFile, setPassportFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [paymentEmail, setPaymentEmail] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("");

  const paymentEndpoint = apiUrl("backend/payment.php");
  const authEndpoint = apiUrl("backend/auth.php");
  const registrationEndpoint = apiUrl("backend/register.php");

  useEffect(() => {
    fetch(authEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "session" }),
    })
      .then(parseApiResponse)
      .then((data) => {
        if (data.authenticated) setAccountEmail(data.email);
      })
      .catch(() => setAuthMessage("We could not check your account session."))
      .finally(() => setAuthLoading(false));
  }, [authEndpoint]);

  const grantPaymentAccess = useCallback((payment) => {
    const draftKey = `ebi-registration-draft-${payment.reference}`;
    let savedDraft = {};
    try {
      savedDraft = JSON.parse(window.localStorage.getItem(draftKey) || "{}");
    } catch {
      window.localStorage.removeItem(draftKey);
    }
    setPaymentReference(payment.reference);
    setPaymentEmail(payment.email);
    setFormData({
      ...initialFormData,
      ...savedDraft,
      guardianEmail: payment.email,
    });
  }, []);

  useEffect(() => {
    if (!paymentReference) return;
    window.localStorage.setItem(
      `ebi-registration-draft-${paymentReference}`,
      JSON.stringify(formData),
    );
  }, [formData, paymentReference]);

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get(
      "reference",
    );
    if (!reference) return;

    const verifyPayment = async () => {
      setPaymentLoading(true);
      setPaymentMessage("Verifying your Paystack payment…");
      try {
        const response = await fetch(paymentEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "verify", reference }),
        });
        const data = await parseApiResponse(response);
        if (!data.success) throw new Error(data.message);
        grantPaymentAccess(data);
        setPaymentMessage(
          "Payment confirmed. You can now complete the registration form.",
        );
        window.history.replaceState({}, "", window.location.pathname);
      } catch (error) {
        setPaymentMessage(error.message || "We could not verify that payment.");
      } finally {
        setPaymentLoading(false);
      }
    };
    verifyPayment();
  }, [grantPaymentAccess, paymentEndpoint]);

  const submitAccount = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");
    try {
      const response = await fetch(authEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: authMode,
          email: paymentEmail,
          password: authPassword,
        }),
      });
      const body = await response.text();
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        throw new Error(
          "The server returned an invalid response. Please contact the school office before submitting again.",
        );
      }
      if (!data.success) throw new Error(data.message);
      setAccountEmail(data.email);
      setPaymentEmail(data.email);
      setAuthPassword("");
    } catch (error) {
      setAuthMessage(error.message || "We could not access your account.");
    } finally {
      setAuthLoading(false);
    }
  };

  const signOutAccount = async () => {
    try {
      await fetch(authEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "logout" }),
      });
    } finally {
      setAccountEmail("");
      setPaymentEmail("");
      setPaymentMessage("");
    }
  };

  const startPayment = async (event) => {
    event.preventDefault();
    setPaymentLoading(true);
    setPaymentMessage("");
    try {
      const lookupResponse = await fetch(paymentEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "lookup" }),
      });
      const lookup = await parseApiResponse(lookupResponse);
      if (!lookup.success) throw new Error(lookup.message);
      if (lookup.paid) {
        grantPaymentAccess(lookup);
        setPaymentMessage(
          "Your completed payment was found. Your saved registration has been restored.",
        );
        return;
      }

      const response = await fetch(paymentEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "initialize" }),
      });
      const data = await parseApiResponse(response);
      if (!data.success) throw new Error(data.message);
      window.location.assign(data.authorization_url);
    } catch (error) {
      setPaymentMessage(error.message || "We could not start the payment.");
      setPaymentLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPassportFile(e.target.files[0]);
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    try {
      setShowSuccessModal(false);
      setLoading(true);

      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      if (passportFile) {
        form.append("passport", passportFile);
      }
      form.append("paymentReference", paymentReference);

      const response = await fetch(registrationEndpoint, {
        method: "POST",
        body: form,
      });

      const body = await response.text();
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        throw new Error(
          "The server returned an invalid response. Please contact the school office before submitting again.",
        );
      }

      if (data.success) {
        setSuccessMessage(data.message || "Registration successful!");
        setShowSuccessModal(true);
        setFormData(initialFormData);
        setPassportFile(null);
        window.localStorage.removeItem(
          `ebi-registration-draft-${paymentReference}`,
        );
        // prompt(data.message || 'Registration successful!')
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-violet-100 px-4 py-10 sm:px-6">
      {!accountEmail ? (
        <section className="mx-auto max-w-xl overflow-hidden rounded-3xl bg-white shadow-xl">
          <header className="bg-amber-800 px-6 py-8 text-white sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-200">
              Admissions
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {authMode === "login" ? "Sign in" : "Create an account"}
            </h1>
            <p className="mt-2 text-amber-50">
              Sign in or create an account before making your application
              payment.
            </p>
          </header>
          <form onSubmit={submitAccount} className="space-y-5 p-6 sm:p-10">
            <div>
              <label
                htmlFor="accountEmail"
                className="text-sm font-semibold text-slate-700"
              >
                Parent or guardian email
              </label>
              <input
                id="accountEmail"
                type="email"
                autoComplete="email"
                required
                value={paymentEmail}
                onChange={(event) => setPaymentEmail(event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="accountPassword"
                className="text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <input
                id="accountPassword"
                type="password"
                autoComplete={
                  authMode === "login" ? "current-password" : "new-password"
                }
                minLength="8"
                required
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                className={inputClass}
              />
            </div>
            {authMessage && (
              <p
                role="status"
                className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900"
              >
                {authMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-lg bg-amber-700 px-7 py-3 font-bold text-white transition hover:bg-amber-800 disabled:opacity-50"
            >
              {authLoading
                ? "Please wait…"
                : authMode === "login"
                  ? "Sign in and continue"
                  : "Create account and continue"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setAuthMessage("");
              }}
              className="w-full text-sm font-semibold text-amber-800 hover:text-amber-950"
            >
              {authMode === "login"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </form>
        </section>
      ) : !paymentReference ? (
        <section className="mx-auto max-w-xl overflow-hidden rounded-3xl bg-white shadow-xl">
          <header className="bg-amber-800 px-6 py-8 text-white sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-200">
              Admissions
            </p>
            <h1 className="mt-2 text-3xl font-bold">Application payment</h1>
            <p className="mt-2 text-amber-50">
              Pay the application fee before accessing the student registration
              form.
            </p>
          </header>
          <form onSubmit={startPayment} className="space-y-5 p-6 sm:p-10">
            <div>
              <label
                htmlFor="paymentEmail"
                className="text-sm font-semibold text-slate-700"
              >
                Parent or guardian email
              </label>
              <input
                id="paymentEmail"
                type="email"
                autoComplete="email"
                readOnly
                value={accountEmail}
                className={`${inputClass} cursor-not-allowed bg-slate-100`}
              />
              <p className="mt-2 text-sm text-slate-500">
                Your Paystack receipt will be sent to your signed-in account
                email.
              </p>
            </div>
            {paymentMessage && (
              <p
                role="status"
                className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900"
              >
                {paymentMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={paymentLoading}
              className="w-full rounded-lg bg-amber-700 px-7 py-3 font-bold text-white transition hover:bg-amber-800 disabled:opacity-50"
            >
              {paymentLoading ? "Please wait…" : "Pay application fee"}
            </button>
            <button
              type="button"
              onClick={signOutAccount}
              className="w-full text-sm font-semibold text-amber-800 hover:text-amber-950"
            >
              Sign out or use another account
            </button>
          </form>
        </section>
      ) : (
        <form
          onSubmit={submit}
          className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl"
        >
          <header className="bg-amber-800 px-6 py-8 text-white sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-200">
              Admissions
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Student Registration Form
            </h1>
            <p className="mt-2 text-amber-50">
              Fields marked with * are required.
            </p>
          </header>

          <div className="space-y-8 p-6 sm:p-10">
            {/* Student Details */}
            <section aria-labelledby="student-details">
              <h2
                id="student-details"
                className="border-b border-amber-200 pb-2 text-xl font-bold text-amber-900"
              >
                Student details
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <Field label="Surname" name="surname" required>
                  <input
                    id="surname"
                    name="surname"
                    type="text"
                    autoComplete="family-name"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="First name" name="firstName" required>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Middle name" name="middleName" required>
                  <input
                    id="middleName"
                    name="middleName"
                    type="text"
                    value={formData.middleName}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </Field>

                <Field label="Date of birth" name="dateOfBirth" required>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Gender" name="gender" required>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
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
                </Field>

                {/* <Field label="Marital status" name="maritalStatus" required>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select marital status
                  </option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Other">Other</option>
                </select>
              </Field> */}

                <Field label="Nationality" name="nationality" required>
                  <input
                    id="nationality"
                    name="nationality"
                    type="text"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="State of origin" name="stateOfOrigin" required>
                  <input
                    id="stateOfOrigin"
                    name="stateOfOrigin"
                    type="text"
                    value={formData.stateOfOrigin}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Local government area" name="lga" required>
                  <input
                    id="lga"
                    name="lga"
                    type="text"
                    value={formData.lga}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="City" name="city" required>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Religion" name="religion" required>
                  <select
                    id="religion"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Select religion</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Islam">Islam</option>
                    <option value="Traditional religion">
                      Traditional religion
                    </option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </Field>

                <Field label="Passport photograph" name="passport">
                  <input
                    id="passport"
                    name="passport"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            {/* Academic Details */}
            <section aria-labelledby="academic-details">
              <h2
                id="academic-details"
                className="border-b border-amber-200 pb-2 text-xl font-bold text-amber-900"
              >
                Academic details
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <Field label="Applying for" name="applicationType" required>
                  <select
                    id="applicationType"
                    name="applicationType"
                    value={formData.applicationType}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select application type
                    </option>
                    <option value="New admission">New admission</option>
                    <option value="Transfer admission">
                      Transfer admission
                    </option>
                    <option value="Returning student">Returning student</option>
                  </select>
                </Field>

                <Field label="Class / programme" name="programme" required>
                  <input
                    id="programme"
                    name="programme"
                    type="text"
                    placeholder="e.g. JSS 1 or Computer Science"
                    value={formData.programme}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Academic session" name="session" required>
                  <input
                    id="session"
                    name="session"
                    type="text"
                    placeholder="e.g. 2026/2027"
                    value={formData.session}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Previous school" name="previousSchool">
                  <input
                    id="previousSchool"
                    name="previousSchool"
                    type="text"
                    value={formData.previousSchool}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="Last class attended" name="lastClass">
                  <input
                    id="lastClass"
                    name="lastClass"
                    type="text"
                    value={formData.lastClass}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="Preferred start date" name="startDate">
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            {/* Contact Details */}
            <section aria-labelledby="contact-details">
              <h2
                id="contact-details"
                className="border-b border-amber-200 pb-2 text-xl font-bold text-amber-900"
              >
                Contact and guardian details
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <Field label="Student email" name="email" required>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Student phone number" name="phone" required>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Home address" name="address" required>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Parent / guardian name"
                  name="guardianName"
                  required
                >
                  <input
                    id="guardianName"
                    name="guardianName"
                    type="text"
                    autoComplete="name"
                    value={formData.guardianName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Relationship to student"
                  name="relationship"
                  required
                >
                  <select
                    id="relationship"
                    name="relationship"
                    value={formData.relationship}
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
                </Field>

                <Field
                  label="Parent / guardian phone"
                  name="guardianPhone"
                  required
                >
                  <input
                    id="guardianPhone"
                    name="guardianPhone"
                    type="tel"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Parent / guardian email"
                  name="guardianEmail"
                  required
                >
                  <input
                    id="guardianEmail"
                    name="guardianEmail"
                    type="email"
                    value={formData.guardianEmail}
                    readOnly
                    required
                    title="This email is linked to the verified application payment."
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Linked to the email used for the verified application
                    payment.
                  </p>
                </Field>

                <Field
                  label="Emergency contact name"
                  name="emergencyName"
                  required
                >
                  <input
                    id="emergencyName"
                    name="emergencyName"
                    type="text"
                    value={formData.emergencyName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Emergency contact phone"
                  name="emergencyPhone"
                  required
                >
                  <input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            {/* Health Information */}
            <section aria-labelledby="health-details">
              <h2
                id="health-details"
                className="border-b border-amber-200 pb-2 text-xl font-bold text-amber-900"
              >
                Health information
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field label="Blood group" name="bloodGroup" required>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Select blood group (optional)</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </Field>

                <Field
                  label="Medical conditions, allergies, or medications"
                  name="medicalInformation"
                  required
                >
                  <textarea
                    id="medicalInformation"
                    name="medicalInformation"
                    rows="3"
                    placeholder="Provide relevant information, or write None"
                    value={formData.medicalInformation}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </Field>
              </div>
            </section>

            <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              <input
                name="declaration"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 accent-amber-700"
              />
              <span>
                I confirm that the information supplied is accurate and I
                consent to its use for admission and student-record purposes.
              </span>
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-amber-700 px-7 py-3 font-bold text-white transition hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit registration"}
              </button>
            </div>
          </div>
        </form>
      )}

      <Modal
        isOpen={showSuccessModal}
        title="Registration successful"
        message={
          successMessage ||
          "Your registration request has been received. We will contact you after it has been reviewed."
        }
        onClose={() => setShowSuccessModal(false)}
      />
    </main>
  );
}

export default Registration;
