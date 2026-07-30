import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function BNavbar() {
    const [open, setOpen] = useState(false);

    return (
        <nav className="p-4 bg-white shadow sticky top-0 z-50">
            <div className="flex justify-between items-center">

                <div className="flex items-center gap-2">
                    <img src="https://res.cloudinary.com/gwmunrsy/image/upload/f_auto,q_auto/ChatGPT_Image_Jun_9_2026_04_03_29_AM-Photoroom_run7zg" alt="EBI_LOGO" className="w-16 h-16" />
                    <span className="flex flex-col">
                        <span className="text-amber-500 font-bold">
                            EDEN BULB
                        </span>
                        <span className="text-gray-900 text-sm">
                            INTERNATIONAL SCHOOL
                        </span>
                    </span>
                </div>

                {/* Desktop Menu */}
                <ul className="hidden gap-6 items-center max-w-6xl  md:inline-flex">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/about">About Us</Link></li>
                    <li><Link to="/academics">Academics</Link></li>
                    <li><Link to="/admission">Admission</Link></li>
                    <li><Link to="/student-life">Student Life</Link></li>
                    <li><Link to="/news-events">News & Events</Link></li>
                    <li><Link to="/contact">Contact Us</Link></li>
                    <li><Link to="/admin/dashboard" className="font-semibold text-amber-700">Admin Dashboard</Link></li>
                </ul>

                {/* Mobile Button */}
                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden px-3 py-2 bg-gray-900 flex justify-center items-center w-10 h-10 rounded-full text-white hover:scale-105 cursor-pointer transition duration-400 hover:shadow font-semibold"
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>
            </div>

            {/* Mobile Menu */}
            {open && (
                <div className="md:hidden mt-2 bg-white rounded-lg ">
                    <ul className="flex flex-col p-4 gap-4">
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/academics">Academics</a></li>
                        <li><a href="/admission">Admission</a></li>
                        <li><a href="/student-life">Student Life</a></li>
                        <li><a href="/news-events">News & Events</a></li>
                        <li><a href="/contact">Contact Us</a></li>
                        <li><a href="/admin/dashboard" className="font-semibold text-amber-700">Admin Dashboard</a></li>
                    </ul>
                </div>
            )}
        </nav>
    );
}

export default BNavbar;