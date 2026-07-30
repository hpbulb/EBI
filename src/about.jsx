import BNavbar from "./BNavbar";

function About() {
  return (
<>
<BNavbar/>
    <main>
      <section className="relative isolate overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-emerald-950 px-6 py-20 text-white sm:px-10 lg:px-16 lg:py-28">
        <div className="absolute -left-24 top-10 -z-10 h-72 w-72 rounded-ful blur-3xl" />
        <div className="absolute -right-20 bottom-0 -z-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-5 text-sm font-bold tracking-[0.22em] text-amber-300 uppercase">
              Eden Bulb International School
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Inspiring learners to grow, lead, and make a difference.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              We provide a caring, stimulating learning community where every
              child is supported to discover their strengths and build a bright
              future.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <button
                type="button"
                className="rounded-xl bg-linear-to-bl from-blue-900 to-green-500 px-6 py-3 font-bold  shadow-lg shadow-amber-500/20 transition hover:bg-green-300 focus:outline-2 focus:outline-offset-2 focus:outline-green-300 text-white"
              >
                Register Now
              </button>
              <a
                href="#our-story"
                className="rounded-xl border border-white/40 px-6 py-3 font-bold text-white transition hover:border-white hover:bg-white/10 focus:outline-2 focus:outline-offset-2 focus:outline-white"
              >
                Discover Our Story
              </a>
            </div>
          </div>

          <aside className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1" aria-label="Our values">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-bold text-amber-300">Our mission</p>
              <p className="mt-2 font-semibold text-justify">To provide a rigorous and supportive learning environment that empowers students to achieve
                academic excellence, develop a love of learning, and become compassionate, responsible, and
                global citizens...</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-bold text-amber-300">Our community</p>
              <p className="mt-2 font-semibold">Every learner is known, valued, and encouraged...</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-bold text-amber-300">Our vision</p>
              <p className="mt-2 font-semibold"> To be a leading Christian mission school that raises a new generation of leaders in all fields
                of human endeavor...</p>
            </div>
          </aside>
        </div>
      </section>

      <section id="our-story" className="bg-slate-50 px-2 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold tracking-[0.18em] text-emerald-700 uppercase">Who we are</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">A place where potential takes root.</h2>
        </div>
      </section>

      {/*Card1*/}
      <section className="bg-slate-50 px-6 py-16 sm:px-10 lg:px-16 grid lg:grid-cols-2 gap-2">
        <div className="">
          <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=822&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="w-full h-90 rounded-2xl" />
        </div>
        <div className="bg-white shadow px-6 py-4 rounded-2xl flex justify-center items-center">
          <p className="text-gray-700 font-mono text-lg text-justify it">
            Eden Bulb International School is a prestigious educstional institution dedicated to nurturing young minds anf forstering academic execellence. Established with the vision pf providing quality education, the school offers a comprehensive curriculum that combines rigorous academics with extracurriculum to ensure holistic development of its students.
          </p>
        </div>
      </section>

      {/*Card2*/}
      <section className="bg-slate-50 px-6 py-16 sm:px-10 lg:px-16 grid lg:grid-cols-2 gap-2">
        <div className="sm:order-2 lg:order-1">
          <img src="https://images.unsplash.com/photo-1708852519717-55b7fffd2893?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="w-full h-90 rounded-2xl" />
        </div>
        <div className="bg-white shadow px-6 py-4 rounded-2xl flex justify-center items-center ">
          <p className="text-gray-700 font-mono text-lg text-justify it">
            At Eden Bulb International School, we believe in creating a supportive and inclusive learning environment where students are encouraged to explore their interests and talents. Our experienced faculty members are committed to delivering engaging lessons that inspire critical thinking, creativity, and a lifelong love for learning.
          </p>
        </div>
      </section>

      {/*Card3*/}
      <section className="bg-slate-50 px-6 py-16 sm:px-10 lg:px-16 grid lg:grid-cols-2 gap-2">
        <div className="">
          <img src="https://images.unsplash.com/photo-1596522354195-e84ae3c98731?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXVkaXRvcml1bXxlbnwwfHwwfHx8MA%3D%3D" alt="" className="w-full h-90 rounded-2xl" />
        </div>
        <div className="bg-white shadow px-6 py-4 rounded-2xl flex justify-center items-center">
          <p className="text-gray-700 font-mono text-lg text-justify it">
            The school boasts numerous facilities, including modern classrooms, science and computer labs, a well-stocked library, and sports amenities that promote physical fitness and teamwork. We also emphasize the importance of character building and social responsibility through various community service initiatives and leadership programs.
          </p>
        </div>
      </section>

      {/*Card4*/}
      <section className="bg-slate-50 px-6 py-16 sm:px-10 lg:px-16 grid lg:grid-cols-2 gap-2">
        <div className="sm:order-2 lg:order-1">
          <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGlnaCUyMHNjaG9vbHxlbnwwfHwwfHx8MA%3D%3D" alt="" className="w-full h-90 rounded-2xl" />
        </div>
        <div className="bg-white shadow px-6 py-4 rounded-2xl flex justify-center items-center ">
          <p className="text-gray-700 font-mono text-lg text-justify it">
            With a focus on preparing students for the challenges of the future, Eden Bulb International School integrates technology into the learning process and encourages global awareness through cultural exchange programs. Our goal is to equip students with the skills and knowledge they need to succeed in an ever-evolving world.
          </p>
        </div>
      </section>

      {/*Core Values */}
      <section className="bg-slate-50 px-6 py-16 sm:px-10 lg:px-16">
        <span className="text-3xl font-bold tracking-[0.18em] text-emerald-700 uppercase ">Our Core Values</span>
        <div className="bg-slate-50 mt-10  grid lg:grid-cols-3 gap-2">

          <div className="bg-[url(https://hpbulb.github.io/EBI/assets/1d.jpg)] relative bg-cover bg-center bg-no-repeat text-white px-2 py-4 rounded-lg shadow-lg texr-justify">
            <div className="bg-black/30 absolute inset-0 rounded-lg "></div>
            <div className="z-10 relative">
              <span className="text-xl font-black">Excellence in Education</span> <br />
              We are committed to providing the highest quality education, fostering a love for learning, and empowering students to achieve their full academic potential.
            </div>
          </div>

          <div className="bg-[url(https://hpbulb.github.io/EBI/assets/2d.jpg)] relative bg-cover bg-center bg-no-repeat text-white px-2 py-4 rounded-lg shadow-lg texr-justify">
            <div className="bg-black/30 absolute inset-0 rounded-lg "></div>
            <div className="z-10 relative">
              <span className="text-xl font-black z-10  ">Integrity and Honesty</span> <br />
              We uphold the strongest ethical standards, promoting a culture of trust, honesty, and transparency among students, staff, and our entire school community.
            </div>
          </div>

          <div className="bg-[url(https://hpbulb.github.io/EBI/assets/d3.jpg)] relative bg-cover bg-center bg-no-repeat text-white px-2 py-4 rounded-lg shadow-lg texr-justify">
            <div className="bg-black/30 absolute inset-0 rounded-lg "></div>
            <div className="z-10 relative">
              <span className="text-xl font-black">Innovation and Creativity</span> <br />
              We encourage curiosity and forward-thinking, integrating innovative teaching methods and creative problem-solving to prepare students for a rapidly changing world.
            </div>
          </div>

        </div>
      </section>

    </main>
</>
  );
}

export default About;