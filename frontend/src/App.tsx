import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login/Login'; // Подключаем страницу логина

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} /> {/* Страница логина */}
      </Routes>
    </Router>
  );
}

export default App;
