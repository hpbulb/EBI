import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BNavbar from "./BNavbar.jsx";

import {
  faEnvelope,
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { PageHero } from "./Academics.jsx";

function Contact() {
  return (
    <>
      <BNavbar />

      <main className="bg-slate-50">
        <PageHero
          eyebrow="We would love to hear from you"
          title="Contact Us"
          text="Whether you have a question or would like to arrange a visit, our team is ready to help."
        />
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:px-16">
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-emerald-700 uppercase">
              Get in touch
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              Let’s start a conversation.
            </h2>
            <div className="mt-8 space-y-6 text-slate-600">
              <a
                className="flex items-start gap-4 hover:text-emerald-700"
                href="tel:+2347068642267"
              >
                <FontAwesomeIcon
                  className="mt-1 text-xl text-amber-500"
                  icon={faPhone}
                />
                <span>
                  <strong className="block text-slate-900">Call us</strong>+234
                  706 864 2267
                </span>
              </a>
              <a
                className="flex items-start gap-4 hover:text-emerald-700"
                href="mailto:edenbulbint@gmail.com"
              >
                <FontAwesomeIcon
                  className="mt-1 text-xl text-amber-500"
                  icon={faEnvelope}
                />
                <span>
                  <strong className="block text-slate-900">Email us</strong>
                  edenbulbint@gmail.com
                </span>
              </a>
              <div className="flex items-start gap-4">
                <FontAwesomeIcon
                  className="mt-1 text-xl text-amber-500"
                  icon={faLocationDot}
                />
                <span>
                  <strong className="block text-slate-900">Visit us</strong>
                  Contact our office to arrange a campus visit.
                </span>
              </div>
            </div>
          </div>
          <form className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <h2 className="text-2xl font-black text-slate-900">
              Send a message
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="First name" />
              <Field label="Last name" />
            </div>
            <div className="mt-5">
              <Field label="Email address" type="email" />
            </div>
            <div className="mt-5">
              <label className="block text-sm font-bold text-slate-700">
                Message
                <textarea
                  className="mt-2 min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  placeholder="How can we help?"
                />
              </label>
            </div>
            <button
              type="button"
              className="mt-6 rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
            >
              Send message
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
function Field({ label, type = "text" }) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input
        type={type}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}
export default Contact;
