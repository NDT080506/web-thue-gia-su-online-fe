import React, { useState } from 'react';
import {
  X,
  Package,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  Percent,
  ShieldCheck,
  Sparkles,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { brokeragePackageApi, courseApi } from '../services/api';

export default function CreatePackageModal({
  isOpen,
  onClose,
  currentUser,
  initialTab = 'package', // 'package' | 'course'
  onPackageCreated,
  onCourseCreated
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'package' | 'course'

  // Package Form State
  const [packageName, setPackageName] = useState('');
  const [packagePrice, setPackagePrice] = useState(450000);
  const [packageFeePercent, setPackageFeePercent] = useState(10);

  // Course Form State
  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(399000);
  const [courseFeePercent, setCourseFeePercent] = useState(10);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Calculations for Package
  const numPkgPrice = Number(packagePrice) || 0;
  const numPkgFeePercent = Number(packageFeePercent) || 0;
  const pkgPlatformFee = Math.round((numPkgPrice * numPkgFeePercent) / 100);
  const pkgTutorIncome = Math.max(0, numPkgPrice - pkgPlatformFee);

  // Calculations for Course
  const numCoursePrice = Number(coursePrice) || 0;
  const numCourseFeePercent = Number(courseFeePercent) || 0;
  const coursePlatformFee = Math.round((numCoursePrice * numCourseFeePercent) / 100);
  const courseTutorIncome = Math.max(0, numCoursePrice - coursePlatformFee);

  const handleApplyPackagePreset = (presetName, presetPrice, presetFee) => {
    setPackageName(presetName);
    setPackagePrice(presetPrice);
    setPackageFeePercent(presetFee);
    setErrorMsg('');
  };

  const handleApplyCoursePreset = (presetTitle, presetPrice) => {
    setCourseTitle(presetTitle);
    setCoursePrice(presetPrice);
    setCourseFeePercent(10);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (activeTab === 'package') {
      if (!packageName.trim()) {
        setErrorMsg('Vui lòng nhập tên gói dịch vụ môi giới.');
        return;
      }
      if (numPkgPrice <= 0) {
        setErrorMsg('Giá gói dịch vụ phải lớn hơn 0 VNĐ.');
        return;
      }
      if (numPkgFeePercent < 0 || numPkgFeePercent > 100) {
        setErrorMsg('Phí sàn nền tảng phải từ 0% đến 100%.');
        return;
      }

      setIsSubmitting(true);
      try {
        const payload = {
          name: packageName.trim(),
          price: numPkgPrice,
          platformFeePercent: numPkgFeePercent
        };

        const res = await brokeragePackageApi.createPackage(payload);
        setSuccessMsg('🎉 Tạo gói dịch vụ môi giới thành công! Học viên đã có thể chọn gói này khi thuê gia sư.');

        if (onPackageCreated) {
          onPackageCreated(res);
        }

        setTimeout(() => {
          onClose();
          setPackageName('');
          setPackagePrice(450000);
          setPackageFeePercent(10);
          setSuccessMsg('');
        }, 1500);
      } catch (err) {
        console.error('Lỗi tạo gói dịch vụ:', err);
        const msg = err.data?.message || err.message || 'Không thể tạo gói dịch vụ.';
        setErrorMsg(`Lỗi: ${msg}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Course
      if (!courseTitle.trim()) {
        setErrorMsg('Vui lòng nhập tiêu đề khóa học.');
        return;
      }
      if (numCoursePrice < 0) {
        setErrorMsg('Học phí khóa học không được âm.');
        return;
      }

      setIsSubmitting(true);
      try {
        const payload = {
          title: courseTitle.trim(),
          price: numCoursePrice,
          platformFeePercent: numCourseFeePercent
        };

        const res = await courseApi.createCourse(payload);
        setSuccessMsg(`🎉 Đã xuất bản thành công khóa học: "${courseTitle.trim()}"! Học sinh đã có thể tìm thấy và ghi danh.`);

        if (onCourseCreated) {
          onCourseCreated(res);
        }

        setTimeout(() => {
          onClose();
          setCourseTitle('');
          setCoursePrice(399000);
          setSuccessMsg('');
        }, 1500);
      } catch (err) {
        console.error('Lỗi tạo khóa học:', err);
        const msg = err.data?.message || err.message || 'Không thể tạo khóa học.';
        setErrorMsg(`Lỗi: ${msg}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1250 }}>
      <div
        className="ud-detail-modal-card animate-fade-in"
        style={{ maxWidth: 640, padding: 0, overflow: 'hidden', borderRadius: 12 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '22px 28px', background: 'linear-gradient(135deg, #7e22ce 0%, #a435f0 100%)', color: '#fff', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeTab === 'package' ? <Package size={26} color="#fff" /> : <GraduationCap size={26} color="#fff" />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                {activeTab === 'package' ? 'Tạo Gói Dịch Vụ Môi Giới Mới' : 'Tạo Khóa Học Online Mới'}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#f3e8ff' }}>
                Dành cho Gia sư & Quản trị viên khởi tạo dịch vụ trên hệ thống EduTutor.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#faf5ff' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('package'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '13px 16px',
              border: 'none',
              borderBottom: activeTab === 'package' ? '3px solid #7e22ce' : '3px solid transparent',
              background: activeTab === 'package' ? '#fff' : 'transparent',
              color: activeTab === 'package' ? '#7e22ce' : '#64748b',
              fontWeight: activeTab === 'package' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
          >
            <Package size={17} /> Gói Dịch Vụ Môi Giới (1-1)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('course'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '13px 16px',
              border: 'none',
              borderBottom: activeTab === 'course' ? '3px solid #7e22ce' : '3px solid transparent',
              background: activeTab === 'course' ? '#fff' : 'transparent',
              color: activeTab === 'course' ? '#7e22ce' : '#64748b',
              fontWeight: activeTab === 'course' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
          >
            <BookOpen size={17} /> Khóa Học Online (Video Bài Giảng)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 6, fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} /> <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: 6, fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={16} /> <span>{successMsg}</span>
            </div>
          )}

          {/* ================= TAB 1: BROKERAGE PACKAGE ================= */}
          {activeTab === 'package' && (
            <>
              {/* Quick Presets */}
              <div style={{ marginBottom: 18 }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  ⚡ Gợi ý mẫu gói dịch vụ nhanh:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 20, borderColor: '#d8b4fe', color: '#7e22ce', background: '#faf5ff' }}
                    onClick={() => handleApplyPackagePreset('[Gói Dạy Kèm 1-1] 3 Buổi Kèm Riêng & Ký Quỹ Escrow', 450000, 10)}
                  >
                    3 Buổi Kèm 1-1 (450k • Sàn 10%)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 20, borderColor: '#d8b4fe', color: '#7e22ce', background: '#faf5ff' }}
                    onClick={() => handleApplyPackagePreset('[Gói Dạy Kèm 1-1] 10 Buổi Kèm Chuyên Sâu & Ký Quỹ Escrow', 1400000, 10)}
                  >
                    10 Buổi Kèm 1-1 (1.4Tr • Sàn 10%)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 20, borderColor: '#cbd5e1', color: '#475569', background: '#f8fafc' }}
                    onClick={() => handleApplyPackagePreset('[Gói Môi Giới Ngoài] Phí Kết Nối Tiêu Chuẩn (Tự dạy ngoài)', 150000, 100)}
                  >
                    Gói Thuần Môi Giới (150k • Sàn 100%)
                  </button>
                </div>
              </div>

              {/* Name Field */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Tên gói dịch vụ (*):
                </label>
                <input
                  type="text"
                  placeholder="VD: [Gói Dạy Kèm 1-1] 5 Buổi Luyện Thi Cấp Tốc..."
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                {/* Price Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Học phí gói (VNĐ) (*):
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="10000"
                    placeholder="450000"
                    value={packagePrice}
                    onChange={(e) => setPackagePrice(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#7e22ce', fontWeight: 700, marginTop: 4, display: 'block' }}>
                    ≈ {formatVND(numPkgPrice)}
                  </span>
                </div>

                {/* Platform Fee Percent Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Phí sàn nền tảng (%) (*):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="10"
                    value={packageFeePercent}
                    onChange={(e) => setPackageFeePercent(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4, display: 'block' }}>
                    {numPkgFeePercent === 100 ? 'Thuần môi giới (Sàn thu 100%)' : `Gia sư nhận ${100 - numPkgFeePercent}% sau khi dạy`}
                  </span>
                </div>
              </div>

              {/* Financial Breakdown Preview */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 18px', marginBottom: 20 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} color="#16a34a" /> Dự toán tài chính khi học viên thanh toán & hoàn tất:
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Học viên thanh toán:</span>
                  <strong style={{ color: '#1e293b' }}>{formatVND(numPkgPrice)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Phí nền tảng ({numPkgFeePercent}%):</span>
                  <span style={{ color: '#dc2626' }}>- {formatVND(pkgPlatformFee)}</span>
                </div>
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 6, marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: 700, color: '#166534' }}>Thu nhập gia sư thực nhận:</span>
                  <strong style={{ color: '#16a34a', fontSize: '1.05rem' }}>{formatVND(pkgTutorIncome)}</strong>
                </div>
              </div>
            </>
          )}

          {/* ================= TAB 2: ONLINE COURSE ================= */}
          {activeTab === 'course' && (
            <>
              {/* Quick Presets */}
              <div style={{ marginBottom: 18 }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  ⚡ Gợi ý mẫu khóa học nhanh:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 20, borderColor: '#d8b4fe', color: '#7e22ce', background: '#faf5ff' }}
                    onClick={() => handleApplyCoursePreset('Khóa Học Toán 12: Đột Phá Điểm 9+ THPT Quốc Gia 2026', 399000)}
                  >
                    Toán 12 Đột Phá (399k)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 20, borderColor: '#d8b4fe', color: '#7e22ce', background: '#faf5ff' }}
                    onClick={() => handleApplyCoursePreset('Chiến Lược Chinh Phục IELTS 7.0+ Cho Người Bận Rộn', 599000)}
                  >
                    IELTS 7.0+ (599k)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 20, borderColor: '#cbd5e1', color: '#475569', background: '#f8fafc' }}
                    onClick={() => handleApplyCoursePreset('Khóa Học Nhập Môn Lập Trình Web React & Java Spring Boot', 450000)}
                  >
                    Lập Trình Web (450k)
                  </button>
                </div>
              </div>

              {/* Title Field */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Tiêu đề khóa học (*):
                </label>
                <input
                  type="text"
                  placeholder="VD: Khóa Học Luyện Thi Toán Cấp Tốc - Thầy Nguyễn..."
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                {/* Price Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Học phí niêm yết (VNĐ) (*):
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="0"
                    placeholder="399000"
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#7e22ce', fontWeight: 700, marginTop: 4, display: 'block' }}>
                    ≈ {formatVND(numCoursePrice)} {numCoursePrice === 0 && '(Miễn phí)'}
                  </span>
                </div>

                {/* Platform Fee Percent Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Phí sàn nền tảng:
                  </label>
                  <input
                    type="text"
                    disabled
                    value="10% (Cố định chuẩn sàn)"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '0.9rem' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, marginTop: 4, display: 'block' }}>
                    Gia sư nhận 90% khi học viên ghi danh
                  </span>
                </div>
              </div>

              {/* Financial Breakdown Preview */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 18px', marginBottom: 20 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} color="#16a34a" /> Doanh thu ước tính trên mỗi lượt học viên ghi danh:
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Giá bán khóa học:</span>
                  <strong style={{ color: '#1e293b' }}>{formatVND(numCoursePrice)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Phí nền tảng (10%):</span>
                  <span style={{ color: '#dc2626' }}>- {formatVND(coursePlatformFee)}</span>
                </div>
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 6, marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: 700, color: '#166534' }}>Thu nhập gia sư nhận về:</span>
                  <strong style={{ color: '#16a34a', fontSize: '1.05rem' }}>{formatVND(courseTutorIncome)}</strong>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ padding: '9px 18px', fontSize: '0.88rem' }}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                padding: '9px 24px',
                fontSize: '0.88rem',
                backgroundColor: '#7e22ce',
                borderColor: '#7e22ce',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Đang tạo...
                </>
              ) : (
                <>
                  <PlusCircle size={16} /> {activeTab === 'package' ? 'Tạo Gói Dịch Vụ' : 'Xuất Bản Khóa Học'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
