import React, { useState } from 'react';
import { X, GraduationCap, Lock, Mail, User, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authApi, getRoleFromToken } from '../services/api';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' | 'TUTOR'
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (mode === 'login') {
      const inputName = (displayName || email || '').trim();

      try {
          const loginRes = await authApi.login(inputName, password);

          const token = loginRes?.accessToken || loginRes?.token;

          if (!token) {
              throw new Error('Backend không trả về access token.');
          }

          const userInfo = await authApi.getMyInfo();

          if (!userInfo?.id) {
              throw new Error('Không thể xác thực thông tin tài khoản.');
          }

          const tokenRole = getRoleFromToken(token);

          if (tokenRole) {
              userInfo.role = tokenRole;
          }

          setSuccessMessage('Đăng nhập thành công!');

          if (onLoginSuccess) {
              await onLoginSuccess(userInfo);
          }

          setTimeout(() => onClose(), 800);

      } catch (err) {
          authApi.clearSession();

          if (err.status === 401 || err.status === 403) {
              setErrorMessage('Tên đăng nhập hoặc mật khẩu không chính xác.');
          } else {
              setErrorMessage(
                  err.message || 'Không thể kết nối đến máy chủ.'
              );
          }
      }

      return;
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose}>
      <div className="ud-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="ud-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="ud-modal-header">
          <div className="modal-logo">
            <GraduationCap size={32} />
          </div>
          <h3>{mode === 'login' ? 'Đăng nhập tài khoản EduTutor' : 'Tạo tài khoản mới'}</h3>
          <p className="modal-sub">
            {mode === 'login' 
              ? 'Đăng nhập để kết nối với Gia sư và Khóa học' 
              : 'Gia nhập cộng đồng học viên & gia sư chuyên nghiệp'}
          </p>
        </div>

        {/* Thông báo lỗi hoặc thành công */}
        {errorMessage && (
          <div className="auth-alert error">
            <AlertCircle size={16} /> <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="auth-alert success">
            <CheckCircle2 size={16} /> <span>{successMessage}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="ud-auth-tabs">
          <button 
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
          >
            Đăng nhập
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
          >
            Đăng ký
          </button>
        </div>

        {mode === 'register' && (
          <div className="ud-role-selector">
            <label className="role-label">Bạn tham gia với vai trò:</label>
            <div className="role-options">
              <button 
                type="button" 
                className={`role-option-btn ${role === 'STUDENT' ? 'selected' : ''}`}
                onClick={() => setRole('STUDENT')}
              >
                🎓 Học viên
              </button>
              <button 
                type="button" 
                className={`role-option-btn ${role === 'TUTOR' ? 'selected' : ''}`}
                onClick={() => setRole('TUTOR')}
              >
                👨‍🏫 Gia sư
              </button>
            </div>
          </div>
        )}

        <form className="ud-auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{mode === 'login' ? 'Tên hiển thị hoặc Email' : 'Họ và tên hiển thị'}</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Ví dụ: admin@gmail.com hoặc user001" 
                required 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Địa chỉ Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="Tối thiểu 8 ký tự" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Đang gửi Backend...' : (mode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản')}
          </button>
        </form>
      </div>
    </div>
  );
}
