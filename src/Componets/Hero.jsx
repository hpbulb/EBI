

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCirclePlay, faSchool } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function Hero() {
  const schoolPortalUrl = import.meta.env.VITE_SCHOOL_PORTAL_URL || "https://ebi-school-portal.vercel.app";

  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      <img
        src="https://images.unsplash.com/photo-1592066575517-58df903152f2?auto=format&fit=crop&w=1800&q=85"
        alt="Eden Bulb International School campus"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-slate-950 via-slate-950/80 to-slate-900/35" />
      <div className="mx-auto grid min-h-6xl max-w-7xl items-center gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-16 lg:py-24">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-bold tracking-[0.24em] text-amber-300 uppercase">Eden Bulb International School</p>
          <h1 className="text-4xl font-black leading-[1.08] sm:text-5xl lg:text-6xl">Where bright minds find their purpose.</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">A welcoming learning community where children are encouraged to discover, create, lead, and grow with confidence.</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link to="/registration" className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-amber-300">Apply for admission <FontAwesomeIcon icon={faArrowRight} /></Link>
            <Link to="/about" className="inline-flex items-center gap-2 rounded-xl border border-white/50 px-6 py-3.5 font-bold transition hover:bg-white/10"><FontAwesomeIcon icon={faCirclePlay} /> Discover EBI</Link>
            <a href={schoolPortalUrl} className="inline-flex items-center gap-2 rounded-xl border border-amber-300/70 px-6 py-3.5 font-bold text-amber-200 transition hover:bg-amber-300/10"><FontAwesomeIcon icon={faSchool} /> School Portal</a>
          </div>
        </div>
        <div className="justify-self-start rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-sm lg:justify-self-end">
          <p className="text-sm font-bold tracking-[0.18em] text-amber-300 uppercase">Now enrolling</p>
          <p className="mt-3 text-2xl font-bold">Give your child a confident start.</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-200">Join a school that balances strong academics, character, creativity, and care.</p>
          <Link to="/contact" className="mt-5 inline-block text-sm font-bold text-white underline decoration-amber-300 decoration-2 underline-offset-6">Speak with admissions</Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
