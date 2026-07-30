import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBookOpen, faFlask, faHeart, faMedal, faPalette, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const pillars = [
  [faBookOpen, "Academic excellence", "Purposeful teaching and engaging learning that help every child thrive."],
  [faHeart, "Character & care", "A values-led environment where every learner is known, supported, and respected."],
  [faPalette, "Creative confidence", "Opportunities in arts, clubs, and projects that let young talents shine."],
  [faPeopleGroup, "Community", "A close partnership between families, educators, and students."],
];

function Content() {
  return (
    <main>
      <section className="bg-white px-6 py-18 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl"><p className="text-sm font-bold tracking-[0.18em] text-amber-600 uppercase">The EBI difference</p><h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">Education that develops the whole child.</h2><p className="mt-4 leading-7 text-slate-600">We combine a strong academic foundation with the experiences and encouragement children need to become capable, compassionate people.</p></div>
          <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{pillars.map(([icon, title, description]) => <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"><span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-xl text-amber-700"><FontAwesomeIcon icon={icon} /></span><h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>)}</div>
        </div>
      </section>

      <section className="bg-slate-100 px-6 py-18 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl shadow-xl"><img className="h-3xl w-full object-cover" src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=85" alt="Teacher helping students in class" /></div>
          <div><p className="text-sm font-bold tracking-[0.18em] text-amber-600 uppercase">Learning with purpose</p><h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">Every day is a chance to discover more.</h2><p className="mt-5 leading-7 text-slate-600">From early years through to the next stage of learning, our students are challenged to think deeply, ask thoughtful questions, and celebrate progress.</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-white p-4 shadow-sm"><FontAwesomeIcon className="text-amber-600" icon={faFlask} /><p className="mt-2 font-bold text-slate-900">Explore & innovate</p><p className="mt-1 text-sm text-slate-600">Learning that connects ideas with real life.</p></div><div className="rounded-xl bg-white p-4 shadow-sm"><FontAwesomeIcon className="text-amber-600" icon={faMedal} /><p className="mt-2 font-bold text-slate-900">Grow & achieve</p><p className="mt-1 text-sm text-slate-600">Support to build skills and self-belief.</p></div></div><Link to="/academics" className="mt-7 inline-flex items-center gap-2 font-bold text-slate-900 transition hover:text-amber-700">Explore academics <FontAwesomeIcon icon={faArrowRight} /></Link></div>
        </div>
      </section>

      <section className="bg-slate-900 px-6 py-18 text-white sm:px-10 lg:px-16"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 md:flex-row md:items-center"><div><p className="text-sm font-bold tracking-[0.18em] text-amber-300 uppercase">Your child’s next chapter</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">A brighter future starts here.</h2><p className="mt-3 max-w-xl text-slate-300">Visit us, meet our community, and see how Eden Bulb can help your child flourish.</p></div><Link to="/registration" className="shrink-0 rounded-xl bg-amber-400 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-amber-300">Start an application</Link></div></section>
    </main>
  );
}

export default Content;
