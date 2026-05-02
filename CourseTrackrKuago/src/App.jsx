import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUpStudent from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import RegistrationSuccess from './pages/RegistrationSuccess';
import DashBoard from './pages/DashBoard/Dashboard';
import Tracker from './pages/Tracker/Tracker';
import AcademicHistory  from './pages/AcademicHistory';
import Setup from './pages/Setup';
import AdminDashboard from './pages/Admin/AdminDashboard';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUpStudent />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/success" element={<RegistrationSuccess />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/history" element={<AcademicHistory />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;