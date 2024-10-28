import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import Login from './login/Login';
import Dashboard from './dashboard/UserDashboard/Dashboard';
import AdminDashboard from './dashboard/AdminDashboard/AdminDashboard';

function App() {
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} /> {/* Страница логина */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        /> {/* Страница после авторизации для пользователя */}
        <Route
          path="/admin-dashboard"
          element={token ? <AdminDashboard /> : <Navigate to="/login" />}
        /> {/* Страница после авторизации для админа */}
        <Route path="*" element={<Navigate to="/login" />} /> {/* Редирект на логин по умолчанию */}
      </Routes>
    </Router>
  );
}

export default App;
