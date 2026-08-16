// import "./index.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { faMailBulk } from "@fortawesome/free-solid-svg-icons";
import { faSchool, faUser, faUserShield } from "@fortawesome/free-solid-svg-icons";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function Navbar() {
    const schoolPortalUrl = import.meta.env.VITE_SCHOOL_PORTAL_URL || "https://ebi-school-portal.vercel.app";

    return (
        <>
        <nav className="p-4 bg-linear-to-br from-gray-900 to-blue-800  relative ">
                <div className="flex justify-between items-center ">
                    <div className="flex gap-3">
                        <h1 className="text-white font-semibold md:inline-flex items-center gap-2 text-sm hidden"> <FontAwesomeIcon icon={faPhone} className="text-white text-md" /> +2347068642267</h1>
                    <span className="text-white font-semibold inline-flex items-center gap-2 text-sm">  <FontAwesomeIcon icon={faMailBulk} className="text-white text-md" />edenbulbint'l@gmail.com</span>
                    </div>
                    <div>
                        <ul className="flex gap-3 item-center">
                        <li className="text-white bg-blue-700 p-2 rounded-full hover:-translate-x-0.5 transition duration-300 font-semibold md:inline-flex hidden items-center gap-1 text-sm"><a href={schoolPortalUrl} className="inline-flex items-center gap-2"><FontAwesomeIcon icon={faSchool} className="text-md" />School Portal</a></li>
                        <li className="text-blue-900 bg-white p-2 rounded-full hover:-translate-x-0.5 transition duration-300 font-semibold md:inline-flex hidden items-center gap-1 text-sm"><Link to="/student-portal" className="inline-flex items-center gap-2"><FontAwesomeIcon icon={faUser} className="text-blue text-md" />Student Portal</Link></li>
                        <li className="text-white bg-amber-600 p-2 rounded-full hover:-translate-x-0.5 transition duration-300 font-semibold inline-flex items-center gap-1 text-sm"><Link to="/admin/register" className="inline-flex items-center gap-2"><FontAwesomeIcon icon={faUserShield} className="text-md" />Admin Registration</Link></li>
                        <li className="text-blue-900 bg-white p-2 rounded-full hover:-translate-x-0.5 transition duration-300 font-semibold inline-flex items-center gap-1 text-sm"> <FontAwesomeIcon icon={faFile} className="text-blue-900 text-md" /><Link to="/registration">Apply Now</Link></li>
                    </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}
export default Navbar
