import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomePage from "../pages/home/HomePage";
import TutorApplicationPage from "../pages/tutors/TutorApplicationPage";
import TutorDetailPage from "../pages/tutors/TutorDetailPage";
import TutorListPage from "../pages/tutors/TutorListPage";
import AdminTutorApplicationsPage from "../pages/admin/AdminTutorApplicationsPage";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tutors" element={<TutorListPage />} />
        <Route path="/tutors/:id" element={<TutorDetailPage />} />
        <Route path="/become-tutor" element={<TutorApplicationPage />} />
        <Route
          path="/admin/tutor-applications"
          element={<AdminTutorApplicationsPage />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}
