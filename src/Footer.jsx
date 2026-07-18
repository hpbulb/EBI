import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEnvelope,
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const quickLinks = [
  ["Home", "/"],
  ["About Us", "/about"],
  ["Academics", "/academics"],
  ["Admissions", "/admission"],
];

const schoolLinks = [
  ["Student Life", "/student-life"],
  ["News & Events", "/news-events"],
  ["Contact Us", "/contact"],
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:px-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1.15fr] lg:px-16">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/gwmunrsy/image/upload/f_auto,q_auto/ChatGPT_Image_Jun_9_2026_04_03_29_AM-Photoroom_run7zg"
              alt="Eden Bulb International School logo"
              className="h-14 w-14 rounded-full bg-white object-contain p-1"
            />
            <p className="font-bold leading-tight text-white">
              EDEN BULB
              <span className="block text-xs font-medium tracking-[0.14em] text-amber-300">
                INTERNATIONAL SCHOOL
              </span>
            </p>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
            Nurturing confident, compassionate learners with the knowledge and character to lead tomorrow.
          </p>
          <Link
            to="/admission"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 focus:outline-2 focus:outline-offset-2 focus:outline-amber-300"
          >
            Begin your journey <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>

        <FooterLinks title="Quick Links" links={quickLinks} />
        <FooterLinks title="School Life" links={schoolLinks} />

        <div>
          <h2 className="text-sm font-bold tracking-[0.14em] text-white uppercase">Get in touch</h2>
          <ul className="mt-5 space-y-4 text-sm leading-6">
            <li className="flex gap-3"><FontAwesomeIcon className="mt-1 text-amber-300" icon={faLocationDot} /><span>Visit our campus to discover the Eden Bulb experience.</span></li>
            <li className="flex gap-3"><FontAwesomeIcon className="mt-1 text-amber-300" icon={faPhone} /><a className="transition hover:text-white" href="tel:+2347068642267">Call the admissions office</a></li>
            <li className="flex gap-3"><FontAwesomeIcon className="mt-1 text-amber-300" icon={faEnvelope} /><a className="transition hover:text-white" href="mailto:info@edenbulbschool.com">info@edenbulbschool.com</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
          <p>© {year} Eden Bulb International School. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#privacy" className="transition hover:text-white">Privacy Policy</a>
            <a href="#terms" className="transition hover:text-white">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }) {
  return (
    <div>
      <h2 className="text-sm font-bold tracking-[0.14em] text-white uppercase">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map(([label, path]) => (
          <li key={path}>
            <Link className="transition hover:text-amber-300" to={path}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Footer;
