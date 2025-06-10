import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">Campeonato</Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/equipos" onClick={() => setIsOpen(false)}>
                Equipos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/calendario" onClick={() => setIsOpen(false)}>
                Calendario
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/posiciones" onClick={() => setIsOpen(false)}>
                Posiciones
              </Link>
            </li>
            {user?.role === 'ADMIN' && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin" onClick={() => setIsOpen(false)}>
                  Administración
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center mt-3 mt-lg-0">
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  className="btn btn-outline-primary me-0 me-lg-2 mb-2 mb-lg-0 w-100 w-lg-auto"
                  onClick={() => setIsOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/registro" 
                  className="btn btn-primary w-100 w-lg-auto"
                  onClick={() => setIsOpen(false)}
                >
                  Registro
                </Link>
              </>
            ) : (
              <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center w-100">
                <span className="me-lg-3 mb-2 mb-lg-0">
                  ¡Hola, {user.nombre}!
                </span>
                <button 
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }} 
                  className="btn btn-outline-danger w-100 w-lg-auto"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;