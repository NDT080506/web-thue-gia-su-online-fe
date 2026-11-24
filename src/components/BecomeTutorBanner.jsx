import React from 'react';
import { ArrowRight, Award, DollarSign, Calendar } from 'lucide-react';

export default function BecomeTutorBanner({ onApplyTutor }) {
  return (
    <section className="ud-become-tutor-section" id="become-tutor">
      <div className="container">
        <div className="ud-instructor-banner">
          <div className="instructor-img-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=700&q=80" 
              alt="Giảng dạy trên EduTutor" 
              className="instructor-banner-img"
            />
          </div>

          <div className="instructor-content">
            <span className="badge badge-toprated">Dành cho Giáo viên & Gia sư</span>
            <h2 className="instructor-title">Trở thành Gia sư & Giảng viên trên EduTutor</h2>
            <p className="instructor-desc">
              Tạo hồ sơ gia sư, đăng khóa học hoặc gói dịch vụ và quản lý thông tin giảng dạy trên nền tảng.
            </p>

            <div className="instructor-benefits">
              <div className="benefit-item">
                <DollarSign size={18} className="benefit-icon" />
                <span>Xem mức phí áp dụng trước khi xuất bản khóa học hoặc gói dịch vụ</span>
              </div>
              <div className="benefit-item">
                <Calendar size={18} className="benefit-icon" />
                <span>Chủ động hoàn toàn về thời gian và địa điểm dạy</span>
              </div>
              <div className="benefit-item">
                <Award size={18} className="benefit-icon" />
                <span>Hỗ trợ xây dựng thương hiệu cá nhân uy tín</span>
              </div>
            </div>

            <button className="btn btn-dark btn-lg" onClick={onApplyTutor}>
              Đăng ký nộp hồ sơ gia sư <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
