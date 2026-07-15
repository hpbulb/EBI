

function Hero() {
    return (
        <div className="bg-gradient-to-b from-amber-500 to-amber-600 text-white py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to Eden Bulb International School</h1>
                <p className="text-lg mb-8">Providing quality education in a nurturing environment</p>
            </div>

            <div className="sm:flex-1 lg:flex justify-center gap-4 items-center max-w-7xl mx-auto text-center">
                <div className="bg-gray-700 px-3 py-4 rounded-lg text-amber-50 hover:bg-gray-600">
                    Learn More
                </div>
                <div className="bg-transparent px-4 py-3 border border-white rounded-lg text-white mt-2 hover:bg-white transition-all cursor-pointer duration-300 hover:text-gray-700">
                    Apply Now
                </div>
            </div>
        </div>
    );
}

export default Hero;