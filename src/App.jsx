import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Equipos from './pages/Equipos';
import Posiciones from './pages/Posiciones';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/equipos" element={<Equipos />} />
            <Route path="/posiciones" element={<Posiciones />} />
            {/* ...otras rutas */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;