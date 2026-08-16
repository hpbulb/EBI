import Admissions from "./centers/Admissions.jsx";
import Academics from "./centers/Academics.jsx";
import StudentAffairs from "./centers/StudentAffairs.jsx";
import Finance from "./centers/Finance.jsx";
import Administration from "./centers/Administration.jsx";
import Examinations from "./centers/Examinations.jsx";
import ICT from "./centers/ICT.jsx";
import Library from "./centers/Library.jsx";

export const adminCenters = [
  { name: "Admissions", path: "admissions", Component: Admissions },
  { name: "Academics", path: "academics", Component: Academics },
  { name: "Student Affairs", path: "student-affairs", Component: StudentAffairs },
  { name: "Finance", path: "finance", Component: Finance },
  { name: "Administration", path: "administration", Component: Administration },
  { name: "Examinations", path: "examinations", Component: Examinations },
  { name: "ICT", path: "ict", Component: ICT },
  { name: "Library", path: "library", Component: Library },
];

export const centerFor = (name) => adminCenters.find((center) => center.name === name);
