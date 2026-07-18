import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCalendarDays,
  faClock,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

const news = [
  {
    title: "Celebrating Excellence at Our Annual Prize-Giving Day",
    excerpt: "Students, families, and staff gathered to recognise outstanding academic achievement, character, and leadership.",
    category: "School News",
    date: "12 June 2026",
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Young Innovators Shine at the Science Exhibition",
    excerpt: "Our learners shared inventive projects and practical solutions during an inspiring day of discovery.",
    category: "Learning",
    date: "28 May 2026",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Building Team Spirit Through Sport",
    excerpt: "Inter-house games brought the school community together for a memorable celebration of teamwork and resilience.",
    category: "Student Life",
    date: "16 May 2026",
    image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=80",
  },
];

const events = [
  { day: "22", month: "JUL", title: "Parent–Teacher Conference", time: "9:00 AM – 2:00 PM", place: "School Hall" },
  { day: "02", month: "AUG", title: "Cultural Day Celebration", time: "10:00 AM – 3:00 PM", place: "Main Campus" },
  { day: "16", month: "AUG", title: "New Term Orientation", time: "8:30 AM – 12:00 PM", place: "Assembly Ground" },
  { day: "05", month: "SEP", title: "Dedication Day", time: "8:00 AM – 2:00 PM", place: "The New Auditorium Hall" },

];

function NewsEvents() {
  return (
    <main className="bg-slate-50">
      <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-emerald-950 px-6 py-20 text-white sm:px-10 lg:px-16">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl text-center">
          <p className="text-sm font-bold tracking-[0.22em] text-amber-300 uppercase">Stay connected</p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">News & Events</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-200">Discover the moments, milestones, and opportunities that make life at Eden Bulb International School special.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-emerald-700 uppercase">Latest stories</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">From our school community</h2>
          </div>
          <a href="#all-news" className="inline-flex items-center gap-2 font-bold text-emerald-700 transition hover:text-emerald-900">View all news <FontAwesomeIcon icon={faArrowRight} /></a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
              <img className="h-52 w-full object-cover" src={item.image} alt="" />
              <div className="p-6">
                <div className="flex items-center justify-between gap-3 text-xs font-bold">
                  <span className="text-emerald-700">{item.category}</span><span className="text-slate-400">{item.date}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold leading-7 text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.excerpt}</p>
                <a href="#read-more" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900">Read more <FontAwesomeIcon icon={faArrowRight} /></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-bold tracking-[0.18em] text-emerald-700 uppercase">Coming up</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Upcoming events</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {events.map((event) => (
              <article key={event.title} className="flex gap-5 rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-300 hover:shadow-md">
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-700 text-white">
                  <span className="text-xl font-black leading-none">{event.day}</span><span className="mt-1 text-xs font-bold tracking-wider">{event.month}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{event.title}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><FontAwesomeIcon className="text-amber-500" icon={faClock} />{event.time}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-600"><FontAwesomeIcon className="text-amber-500" icon={faLocationDot} />{event.place}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a href="#calendar" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-700"><FontAwesomeIcon icon={faCalendarDays} /> View school calendar</a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default NewsEvents;
