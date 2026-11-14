import React from 'react';
import { Star, CheckCircle, Calendar, MessageCircle, Award, Users, Package } from 'lucide-react';

export default function TutorCard({ tutor, onBookTutor, onChatTutor }) {
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="ud-tutor-card">
      <div className="ud-tutor-header">
        <div className="ud-tutor-avatar-wrapper">
          <img src={tutor.avatar} alt={tutor.name} className="ud-tutor-avatar" />
          {tutor.isVerified && (
            <span className="ud-verified-badge" title="Gia sư đã được xác minh bằng cấp">
              <CheckCircle size={16} />
            </span>
          )}
        </div>

        <div className="ud-tutor-meta">
          <h3 className="ud-tutor-name">{tutor.name}</h3>
          <p className="ud-tutor-title">{tutor.title}</p>
          <p className="ud-tutor-degree">
            <Award size={13} className="inline-icon" /> {tutor.degree}
          </p>

          <div className="ud-tutor-stats">
            <div className="tutor-stat-item">
              <Star size={13} fill="#b4690e" stroke="#b4690e" />
              <strong>{Number(tutor.rating || 5.0).toFixed(1)}</strong>
              <span className="stat-sub">({tutor.reviews} đánh giá)</span>
            </div>
            <span className="stat-divider">•</span>
            <div className="tutor-stat-item">
              <Users size={13} />
              <span>{tutor.students} học sinh</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ud-tutor-body">
        <p className="ud-tutor-bio">{tutor.bio}</p>

        <div className="ud-tutor-subjects">
          {tutor.subjects.map((sub, i) => (
            <span key={i} className="subject-pill">{sub}</span>
          ))}
        </div>

        {/* Các gói dịch vụ / khóa kèm của gia sư */}
        {tutor.packages && tutor.packages.length > 0 && (
          <div style={{ marginTop: 12, background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7e22ce', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Package size={14} /> Gói dịch vụ đã mở ({tutor.packages.length}):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {tutor.packages.slice(0, 3).map((pkg, idx) => (
                <div
                  key={pkg.id || idx}
                  onClick={() => onBookTutor && onBookTutor(tutor)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#fff',
                    border: '1px solid #d8b4fe',
                    borderRadius: 6,
                    padding: '5px 9px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Bấm để đăng ký gói này"
                >
                  <span style={{ fontWeight: 600, color: '#4c1d95', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%' }}>
                    ⚡ {pkg.name}
                  </span>
                  <strong style={{ color: '#7e22ce', fontSize: '0.82rem' }}>
                    {formatVND(pkg.price)}
                  </strong>
                </div>
              ))}
              {tutor.packages.length > 3 && (
                <span
                  onClick={() => onBookTutor && onBookTutor(tutor)}
                  style={{ fontSize: '0.75rem', color: '#9333ea', fontWeight: 600, cursor: 'pointer', textAlign: 'right', marginTop: 2 }}
                >
                  +{tutor.packages.length - 3} gói khác (Bấm để xem)...
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="ud-tutor-footer">
        <div className="ud-tutor-price">
          <span className="price-label">Học phí:</span>
          <span className="price-val">{formatVND(tutor.hourlyRate)}</span>
          <span className="price-unit">/ giờ</span>
        </div>

        <div className="ud-tutor-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => onChatTutor && onChatTutor(tutor)}
            title="Nhắn tin trao đổi"
          >
            <MessageCircle size={16} /> Nhắn tin
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onBookTutor && onBookTutor(tutor)}
          >
            <Calendar size={16} /> Đặt lịch học
          </button>
        </div>
      </div>
    </div>
  );
}
