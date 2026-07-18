function Content() {
    return (
        <div className="bg-white p-6">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-10 flex flex-col items-center">
                A World-Class Education
                <div className="bg-amber-600 w-13 h-[6px] inline-block rounded-full mt-2"></div>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4">
                    <div className="flex flex-col items-center gap-3">
                        <span className="bg-gray-700 w-10 h-10 rounded-full"></span>
                        <h2 className="font-semibold">Academic Excellence</h2>
                        <p className="text-gray-600">
                            Rigorous curriculum designed to challenge and inspire every student.
                        </p>
                    </div>
                </div>

                <div className="text-center p-4">
                    <div className="flex flex-col items-center gap-3">
                        <span className="bg-gray-700 w-10 h-10 rounded-full"></span>
                        <h2 className="font-semibold">Global Perspective</h2>
                        <p className="text-gray-600">
                            Preparing students to be responsible citizens in an interconnected world.
                        </p>
                    </div>
                </div>

                <div className="text-center p-4">
                    <div className="flex flex-col items-center gap-3">
                        <span className="bg-gray-700 w-10 h-10 rounded-full"></span>
                        <h2 className="font-semibold">Holistic Development</h2>
                        <p className="text-gray-600">
                            Encouraging growth in academics, arts, sports, and leadership.
                        </p>
                    </div>
                </div>

                <div className="text-center p-4">
                    <div className="flex flex-col items-center gap-3">
                        <span className="bg-gray-700 w-10 h-10 rounded-full"></span>
                        <h2 className="font-semibold">Extracurricular Activities</h2>
                        <p className="text-gray-600">
                            Offering a wide range of clubs, teams, and organizations for students to explore their interests.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Content;