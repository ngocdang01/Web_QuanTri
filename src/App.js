import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import LogoutButton from './components/LogoutButton';
import './App.css';


function App() {
  return (
   <Router>
    <LogoutButton />
    <Routes>
      <Route path="/" element={
        localStorage.getItem('token') ? <Navigate to="/home" /> : <Navigate to="/login" />
      } />

      <Route path="/login" element={
        localStorage.getItem('token') ? <Navigate to="/home" /> : <Login />
      } />

        <Route
        path='/home' 
        element={
          <ProtectedRoute>
            <Home/>
          </ProtectedRoute>
        }
        />

        <Route 
          path="/admin*"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Home/>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
   </Router>
  );
}

export default App;
