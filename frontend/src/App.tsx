import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login/Login';
import Dashboard from './dashboard/Dashboard';
import AdminDashboard from './dashboard/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} /> {/* Страница логина */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* Страница после авторизации для пользователя */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* Страница после авторизации для админа */}
      </Routes>
    </Router>
  );
}

export default App;
