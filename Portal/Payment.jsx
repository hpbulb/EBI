import { useEffect, useState } from "react";
import { apiUrl } from "../src/apiBase";

/**
 * Paystack application-fee screen.
 *
 * Add <Payment onVerified={(reference, email) => navigate('/registration')} /> to
 * your portal route. The Paystack secret key stays in backend/.env handling;
 * this component only asks the backend for a hosted checkout URL.
 */
export default function Payment({ onVerified }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [paid, setPaid] = useState(false);
const endpoint = apiUrl("backend/payment.php");

async function parsePaymentResponse(response) {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("The payment server returned an invalid response.");
  }
}

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get("reference");
    if (!reference) return;

    async function verifyPayment() {
      setLoading(true);
      setMessage("Confirming your payment…");
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify", reference }),
        });
        const data = await parsePaymentResponse(response);
        if (!data.success) throw new Error(data.message);

        setPaid(true);
        setMessage("Payment confirmed. You may now continue with registration.");
        window.history.replaceState({}, "", window.location.pathname);
        onVerified?.(data.reference, data.email);
      } catch (error) {
        setMessage(error.message || "We could not verify your payment.");
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [endpoint, onVerified]);

  async function beginPayment(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const lookupResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "lookup", email }),
      });
      const lookup = await parsePaymentResponse(lookupResponse);
      if (!lookup.success) throw new Error(lookup.message);
      if (lookup.paid) {
        setPaid(true);
        setMessage("Your completed payment was found. You may continue with registration.");
        onVerified?.(lookup.reference, lookup.email);
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "initialize", email }),
      });
      const data = await parsePaymentResponse(response);
      if (!data.success) throw new Error(data.message);

      // Paystack's hosted checkout is used so card details never touch this site.
      window.location.assign(data.authorization_url);
    } catch (error) {
      setMessage(error.message || "Unable to start the Paystack payment.");
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-lg">
      <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
        Admissions
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Application payment</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Make your application payment securely with Paystack to continue.
      </p>

      {paid ? (
        <p role="status" className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
          {message}
        </p>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={beginPayment}>
          <label className="block text-sm font-medium text-slate-700" htmlFor="paystack-email">
            Parent or guardian email
            <input
              id="paystack-email"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          {message && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-700 px-4 py-3 font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait…" : "Pay with Paystack"}
          </button>
        </form>
      )}
    </section>
  );
}
