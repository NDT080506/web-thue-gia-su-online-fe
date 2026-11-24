import React, { useState } from 'react';
import { Star, Check, Heart, ShoppingCart, PlayCircle } from 'lucide-react';

export default function CourseCard({ course, onSelectCourse, onAddToCart, isLiked, onToggleWishlist }) {
  const [isHovered, setIsHovered] = useState(false);

  // Format currency VND
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const getBadgeClass = (badgeType) => {
    switch (badgeType) {
      case 'bestseller': return 'badge-bestseller';
      case 'toprated': return 'badge-toprated';
      case 'hot': return 'badge-hot';
      default: return '';
    }
  };

  return (
    <div 
      className="ud-course-card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="ud-course-card" onClick={() => onSelectCourse && onSelectCourse(course)}>
        {/* Thumbnail */}
        <div className="ud-card-thumbnail-wrapper">
          {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="ud-card-img" />}
          <div className="ud-card-overlay">
            <span className="ud-play-icon"><PlayCircle size={36} /></span>
          </div>
        </div>

        {/* Content */}
        <div className="ud-card-body">
          <h3 className="ud-card-title" title={course.title}>
            {course.title}
          </h3>
          {course.instructor && <p className="ud-card-instructor">{course.instructor}</p>}

          {/* Rating */}
          {course.rating != null && (
            <div className="ud-card-rating">
              <span className="rating-score">{Number(course.rating).toFixed(1)}</span>
              <div className="rating-stars">
                {[...Array(Math.max(0, Math.min(5, Math.round(Number(course.rating)))))].map((_, i) => (
                  <Star key={i} size={13} fill="#b4690e" stroke="#b4690e" />
                ))}
              </div>
              {course.ratingCount != null && (
                <span className="rating-count">({Number(course.ratingCount).toLocaleString()})</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="ud-card-price-row">
            <span className="current-price">{course.price != null ? formatVND(course.price) : 'Chưa cập nhật học phí'}</span>
            {course.originalPrice && (
              <span className="original-price">{formatVND(course.originalPrice)}</span>
            )}
          </div>

          {/* Badge */}
          {course.badge && (
            <div className="ud-card-badge-row">
              <span className={`badge ${getBadgeClass(course.badgeType)}`}>
                {course.badge}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Hover Preview (Udemy Characteristic feature) */}
      {isHovered && (
        <div className="ud-hover-preview animate-fade-in">
          <h4 className="preview-title">{course.title}</h4>
          <div className="preview-meta">
            {course.level && <span className="preview-badge">{course.level}</span>}
            {course.updatedDate && <span>Cập nhật {course.updatedDate}</span>}
            {course.hours && <span>• {course.hours}</span>}
          </div>
          {course.instructorRole && <p className="preview-instructor-bio">{course.instructorRole}</p>}

          <div className="preview-highlights">
            <div className="highlights-header">Những gì bạn sẽ học:</div>
            {(course.highlights || []).map((h, i) => (
              <div key={i} className="highlight-item">
                <Check size={14} className="check-icon" />
                <span>{h}</span>
              </div>
            ))}
          </div>

          <div className="preview-actions">
            <button 
              className="btn btn-primary preview-cta-btn"
              onClick={() => onSelectCourse && onSelectCourse(course)}
              style={{ flex: 1 }}
            >
              Xem chi tiết
            </button>
            <button
              className="btn btn-outline"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart && onAddToCart(course);
              }}
              title="Thêm vào giỏ hàng"
              style={{ padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ShoppingCart size={18} />
            </button>
            <button 
              className={`preview-wishlist-btn ${isLiked ? 'liked' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist && onToggleWishlist(course.id);
              }}
              title={isLiked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            >
              <Heart size={18} fill={isLiked ? '#db2777' : 'none'} stroke={isLiked ? '#db2777' : '#2d2f31'} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
