import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import Login from './login/Login';
import Dashboard from './dashboard/UserDashboard/Dashboard';
import AdminDashboard from './dashboard/AdminDashboard/AdminDashboard';
import ForgotPassword from './resetpass/ForgotPassword';
import ResetPassword from './resetpass/ResetPassword';

function App() {
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <Router>
     <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Страница ввода email */}
        <Route path="/reset-password" element={<ResetPassword />} /> {/* Страница ввода нового пароля */}
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/admin-dashboard" element={token ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
