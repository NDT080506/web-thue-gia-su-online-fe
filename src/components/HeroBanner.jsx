import React from 'react';
import { Star, ArrowRight } from 'lucide-react';

export default function HeroBanner({ onSearchTag }) {
  const popularTags = ['Toán 12', 'IELTS 7.5+', 'Java Spring Boot', 'Python AI', 'Hóa Học THPT'];

  return (
    <section className="ud-hero-section">
      <div className="container">
        <div className="ud-hero-card">
          {/* Left Text Card (Udemy Billboard Card) */}
          <div className="ud-hero-content animate-fade-in">
            <div className="ud-hero-pill">
              <Star size={14} className="star-icon" /> Nền tảng học tập & kết nối gia sư
            </div>
            
            <h1 className="ud-hero-title">
              Nâng tầm tương lai cùng các <span className="highlight">Gia sư giỏi</span> & Khóa học thực chiến
            </h1>
            
            <p className="ud-hero-desc">
              Khám phá khóa học, xem hồ sơ gia sư và lựa chọn gói học phù hợp với nhu cầu của bạn.
            </p>

            {/* Quick action buttons */}
            <div className="ud-hero-actions">
              <a href="#courses" className="btn btn-primary btn-hero">
                Khám phá khóa học <ArrowRight size={18} />
              </a>
              <a href="#tutors" className="btn btn-outline btn-hero-secondary">
                Tìm gia sư 1-1
              </a>
            </div>

            {/* Popular search tags */}
            <div className="ud-popular-tags">
              <span className="tags-label">Từ khóa gợi ý:</span>
              <div className="tags-list">
                {popularTags.map((tag) => (
                  <button 
                    key={tag} 
                    className="tag-btn"
                    onClick={() => onSearchTag && onSearchTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Visual Image */}
          <div className="ud-hero-media">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" 
              alt="Học tập trực tuyến" 
              className="ud-hero-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
