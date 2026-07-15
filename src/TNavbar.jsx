// import "./index.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { faMailBulk } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faFile } from "@fortawesome/free-solid-svg-icons";

function Navbar() {
    return (
        <>
        <nav className="p-4 bg-gray-800 relative ">
                <div className="flex justify-between items-center ">
                    <div className="flex gap-3">
                        <h1 className="text-white font-semibold md:inline-flex items-center gap-2 text-sm hidden"> <FontAwesomeIcon icon={faPhone} className="text-white text-md" /> +2347068642267</h1>
                    <span className="text-white font-semibold inline-flex items-center gap-2 text-sm">  <FontAwesomeIcon icon={faMailBulk} className="text-white text-md" />edenbulbint'l@gmail.com</span>
                    </div>
                    <div>
                        <ul className="flex gap-3 item-center">
                        <li className="text-white font-semibold md:inline-flex items-center gap-2 text-sm hidden "> <FontAwesomeIcon icon={faUser} className="text-white text-md" />Student Portal</li>
                        <li className="text-white font-semibold inline-flex items-center gap-2 text-sm"> <FontAwesomeIcon icon={faFile} className="text-white text-md" />Apply Now</li>
                    </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}
export default Navbar