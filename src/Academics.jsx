import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faFlask,
  faGraduationCap,
  faLaptopCode,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import BNavbar from "./BNavbar";

const programmes = [
  [
    faBookOpen,
    "Early Years",
    "A joyful foundation where children learn through play, exploration, and care.",
  ],
  [
    faGraduationCap,
    "Primary School",
    "Strong literacy, numeracy, and character development for confident young learners.",
  ],
  [
    faFlask,
    "Secondary School",
    "A challenging, supportive curriculum that prepares students for future success.",
  ],
  [
    faLaptopCode,
    "Digital Learning",
    "Technology-rich learning experiences that build creativity and problem-solving skills.",
  ],
];

function Academics() {
  return (
   <>
   <BNavbar/>
    <main className="bg-slate-50">
      <PageHero
        eyebrow="Learning for life"
        title="Academics"
        text="We challenge every learner to think deeply, discover their strengths, and achieve their very best."
      />
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <img
            className="h-72 w-full rounded-2xl object-cover shadow-lg lg:h-96"
            src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80"
            alt="Students learning in a classroom"
          />
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-emerald-700 uppercase">
              Our approach
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              Education that inspires curiosity.
            </h2>
            <p className="mt-5 leading-8 text-slate-600">
              Our curriculum balances academic rigour with creativity,
              collaboration, and personal growth. Experienced teachers provide
              meaningful support so every child can make progress with
              confidence.
            </p>
            <Link
              to="/admission"
              className="mt-7 inline-block rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
            >
              Explore admissions
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-white px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-bold tracking-[0.18em] text-emerald-700 uppercase">
              Every stage matters
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              Our learning programmes
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {programmes.map(([icon, title, text]) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  className="text-3xl text-amber-500"
                  icon={icon}
                />
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
   </>
  );
}

export function PageHero({ eyebrow, title, text }) {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-emerald-950 px-6 py-20 text-white sm:px-10 lg:px-16">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl text-center">
        <p className="text-sm font-bold tracking-[0.22em] text-amber-300 uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-black sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-200">
          {text}
        </p>
      </div>
    </section>
  );
}

export default Academics;
