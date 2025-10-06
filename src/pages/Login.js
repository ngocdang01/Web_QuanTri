import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../config/api'; // vẫn dùng file api giống bản đầy đủ
import logo_shop from '../assets/logo_shop.png';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gọi API đăng nhập
      const response = await authAPI.login({ email, password });

      if (response.token) {
        // Lưu token và role vào localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);

        // Chuyển hướng tùy theo role
        if (response.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError('Email hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box simple">
        <div className="logo-container">
          <img src={logo_shop} alt="FShop" className="logo small" />
        </div>
        <h2>Đăng nhập</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
