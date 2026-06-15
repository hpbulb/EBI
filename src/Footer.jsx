 function Footer() {
    return(
        <footer>
            <div className="bg-indigo-800 flex justify-between items-center h-40">
                <div className="flex flex-col p-2">
                     <p className="lg:text-2xl sm:text-lg md:text-xl text-blue-100 font-bold font-[sans-serif]">EDEN BULB INTERNATIONAL SCHOOL - OFFICIAL WEBSITE.</p>
                     <span className="text-md text-blue-100 font-semibold font-[neogen black]">&#169; {new Date().getFullYear()} All right reserved.</span>
                </div>
            </div>
        </footer>
    )
 }

 export default Footer