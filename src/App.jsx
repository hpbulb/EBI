import Navbar from "./TNavbar.jsx";
import BNavbar from "./BNavbar.jsx";
import Hero from "./Hero.jsx";
import Content from "./Content.jsx";
import Footer from "./Footer.jsx";
import { Routes, Route } from "react-router-dom";
import About from "./about.jsx";
import NewsEvents from "./NewsEvents.jsx";
import Academics from "./Academics.jsx";
import Admissions from "./Admissions.jsx";
import StudentLife from "./StudentLife.jsx";
import Contact from "./Contact.jsx";
import Registration from "./Registration.jsx";
import RegistrationAdminDashboard from "./RegistrationAdminDashboard.jsx";

function App() {
  return (
    <>
      <Navbar />
      <BNavbar />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Content />
            </>
          }
        />

        <Route path="/about" element={<About />} />
        <Route path="/news-events" element={<NewsEvents />} />
        <Route path="/academics" element={<Academics />} />
        <Route path="/admission" element={<Admissions />} />
        <Route path="/student-life" element={<StudentLife />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/admin/dashboard" element={<RegistrationAdminDashboard />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
