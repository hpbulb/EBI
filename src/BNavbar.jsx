import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

function BNavbar() {
    const [open, setOpen] = useState(false);

    return (
        <nav className="p-4 bg-white shadow">
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
                <ul className="hidden md:flex gap-6 items-center">
                    <li>Home</li>
                    <li>About Us</li>
                    <li>Academics</li>
                    <li>Admission</li>
                    <li>Student Life</li>
                    <li>News & Events</li>
                    <li>Contact Us</li>
                </ul>

                {/* Mobile Button */}
                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden px-3 py-2 bg-gray-900 rounded-full text-white hover:scale-105 cursor-pointer transition duration-400 hover:shadow font-semibold"
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>
            </div>

            {/* Mobile Menu */}
            {open && (
                <div className="md:hidden mt-2 bg-white rounded-lg ">
                    <ul className="flex flex-col p-4 gap-4">
                        <li>Home</li>
                        <li>About Us</li>
                        <li>Academics</li>
                        <li>Admission</li>
                        <li>Student Life</li>
                        <li>News & Events</li>
                        <li>Contact Us</li>
                    </ul>
                </div>
            )}
        </nav>
    );
}

export default BNavbar;