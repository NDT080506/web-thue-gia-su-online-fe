import React, { useState, useEffect } from 'react';
import {
  Scale,
  Trash2,
  X,
  GraduationCap,
  User,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Check,
  Video,
  Sparkles
} from 'lucide-react';
import { bookingApi, disputeApi } from '../services/api';

export default function TutorBookingsModal({
  isOpen,
  onClose,
  currentUser,
  onOpenChat,
  onOpenCheckout,
  onWalletUpdated
}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Format currency VND
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const fetchBookings = async () => {
    if (!currentUser) return;
    setLoading(true);
    setErrorMsg('');
    try {
      if (currentUser.role === 'TUTOR') {
        const res = await bookingApi.getTutorBookings();
        setBookings(res || []);
      } else {
        const res = await bookingApi.getMyBookings();
        setBookings(res || []);
      }
    } catch (err) {
      console.warn('Lỗi lấy danh sách booking:', err);
      setErrorMsg('Không thể tải danh sách đơn đặt lịch: ' + (err.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      setSuccessMsg('');
      fetchBookings();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const isTutor = currentUser?.role === 'TUTOR';
  const totalRevenue = bookings.reduce((sum, b) => sum + (isTutor ? (b.tutorIncome || 0) : (b.totalPrice || 0)), 0);

  // Hủy đơn đặt lịch (Cancel booking)
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn HỦY đơn đặt lịch thuê gia sư này không?')) {
      return;
    }

    setCompletingId(bookingId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await bookingApi.cancelBooking(bookingId);
      setSuccessMsg('Đã hủy đơn đặt lịch thành công!');
      await fetchBookings();
    } catch (err) {
      alert('Không thể hủy đơn đặt lịch: ' + (err.data?.message || err.message));
    } finally {
      setCompletingId(null);
    }
  };

  // Xóa đơn đã hủy khỏi giao diện hiển thị
  const handleDeleteFromView = (bookingId) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  // Gửi khiếu nại đơn booking cho Admin
  const handleSubmitDispute = async () => {
    if (!selectedBookingForDispute || !disputeReason.trim()) {
      alert('Vui lòng nhập lý do khiếu nại cụ thể!');
      return;
    }

    setSubmittingDispute(true);
    try {
      await disputeApi.createDispute({
        bookingId: selectedBookingForDispute.id,
        reason: disputeReason.trim(),
        evidenceUrl: disputeEvidence.trim() || 'https://drive.google.com/file/evidence-sample.png'
      });
      setSuccessMsg('Đã gửi khiếu nại thành công! Vụ việc đang chờ Quản trị viên phân xử.');
      setDisputeModalOpen(false);
    } catch (err) {
      const msg = err.data?.message || err.message || '';
      if (msg.includes('Payment') || msg.includes('PAYMENT')) {
        alert('Thông báo: Đơn này chưa thanh toán ký quỹ nên không cần khiếu nại hoàn tiền. Bạn hãy bấm nút "Hủy đơn" màu đỏ để hủy bỏ đơn này trực tiếp nhé!');
      } else {
        alert('Lỗi gửi khiếu nại: ' + msg);
      }
    } finally {
      setSubmittingDispute(false);
    }
  };

  // Student completes booking and releases escrow
  const handleCompleteBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xác nhận hoàn thành dịch vụ gia sư và giải ngân học phí ký quỹ cho gia sư?')) {
      return;
    }

    setCompletingId(bookingId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await bookingApi.completeBooking(bookingId);
      setSuccessMsg('Đã hoàn tất lịch học & giải ngân học phí thành công cho gia sư!');
      await fetchBookings();
      if (onWalletUpdated) onWalletUpdated();
    } catch (err) {
      console.error('Lỗi khi hoàn thành booking:', err);
      setErrorMsg('Không thể hoàn thành đơn: ' + (err.data?.message || err.message));
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="ud-detail-modal-card animate-fade-in"
        style={{ maxWidth: 880, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ud-modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div className="detail-modal-hero" style={{ padding: '24px 32px' }}>
          <div className="detail-hero-left">
            <span className="badge badge-bestseller">
              {isTutor ? 'Trung tâm Quản lý Gia sư' : 'Lịch học 1-1 Cá nhân'}
            </span>
            <h2 className="detail-title" style={{ fontSize: '1.6rem', marginTop: 8 }}>
              {isTutor
                ? '📋 Yêu cầu đặt lịch thuê Gia sư 1-1'
                : '📅 Đơn thuê Gia sư 1-1 của tôi'}
            </h2>
            <p className="detail-sub">
              {isTutor
                ? `Danh sách các học viên đã đặt lịch kèm với bạn. Tiền ký quỹ được giữ an toàn trên hệ thống.`
                : `Theo dõi tiến độ, thanh toán ký quỹ và giải ngân học phí cho gia sư sau khi hoàn tất.`}
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px 32px' }}>
          {errorMsg && (
            <div className="auth-alert error" style={{ marginBottom: 16 }}>
              <AlertCircle size={16} /> <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert success" style={{ marginBottom: 16, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} color="#16a34a" /> <span>{successMsg}</span>
            </div>
          )}

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: '14px 18px' }}>
              <span style={{ fontSize: '0.82rem', color: '#6a6f73', fontWeight: 600 }}>TỔNG SỐ ĐƠN ĐẶT</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1d1f', marginTop: 4 }}>
                {bookings.length}
              </div>
            </div>

            <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: '14px 18px' }}>
              <span style={{ fontSize: '0.82rem', color: '#6a6f73', fontWeight: 600 }}>CHỜ THANH TOÁN / KÝ QUỸ</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b4690e', marginTop: 4 }}>
                {bookings.filter(b => b.status === 'PENDING_PAYMENT').length}
              </div>
            </div>

            <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: '14px 18px' }}>
              <span style={{ fontSize: '0.82rem', color: '#6a6f73', fontWeight: 600 }}>
                {isTutor ? 'THU NHẬP DỰ KIẾN' : 'TỔNG HỌC PHÍ'}
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0d6832', marginTop: 4 }}>
                {formatVND(totalRevenue)}
              </div>
            </div>
          </div>

          {/* List of bookings */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6a6f73' }}>
              <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p>Đang tải danh sách đặt lịch từ hệ thống...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f7f9fa', borderRadius: 8 }}>
              <GraduationCap size={48} color="#8c8c8c" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1.1rem', color: '#1c1d1f', marginBottom: 6 }}>Chưa có yêu cầu đặt lịch nào</h4>
              <p style={{ color: '#6a6f73', fontSize: '0.9rem', maxWidth: 450, margin: '0 auto' }}>
                {isTutor
                  ? 'Hiện tại chưa có học viên nào gửi yêu cầu thuê gia sư. Khi có học viên đăng ký, thông báo sẽ xuất hiện tại đây.'
                  : 'Bạn chưa đặt lịch với gia sư nào. Hãy tìm gia sư phù hợp và nhắn tin thỏa thuận lịch học.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {bookings.map((booking) => {
                const isPendingPayment = booking.status === 'PENDING_PAYMENT';
                const isEscrowHeld = booking.status === 'PENDING_CONFIRMATION' || booking.status === 'CONFIRMED';
                const isCompleted = booking.status === 'COMPLETED';
                const isOption1 = booking.packageName?.includes('Môi Giới') ||
                  booking.platformFeePercent === 100 ||
                  (booking.totalPrice <= 300000 && booking.platformFee === booking.totalPrice);

                return (
                  <div
                    key={booking.id}
                    style={{
                      border: '1px solid #e4e8eb',
                      borderRadius: 8,
                      padding: 20,
                      background: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Top Bar of Card */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', background: '#f2f3f5', padding: '3px 8px', borderRadius: 4, color: '#444' }}>
                          #{booking.id.substring(0, 8)}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: '#6a6f73' }}>
                          {new Date(booking.createdAt).toLocaleString('vi-VN')}
                        </span>
                        {isOption1 ? (
                          <span style={{ background: '#fdf4ff', color: '#86198f', border: '1px solid #f0abfc', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                            🎯 OPTION 1: MÔI GIỚI NGOÀI
                          </span>
                        ) : (
                          <span style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #93c5fd', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                            💻 OPTION 2: TRỰC TUYẾN 1-1
                          </span>
                        )}
                      </div>

                      <div>
                        {isPendingPayment && (
                          <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            {isOption1 ? '⏳ Chờ thanh toán phí môi giới' : '⏳ Chờ thanh toán ký quỹ'}
                          </span>
                        )}
                        {isEscrowHeld && (
                            <span style={{ background: isOption1 ? '#f0fdf4' : '#dbeafe', color: isOption1 ? '#15803d' : '#1e40af', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              {isOption1 ? '✅ Đã mở khóa liên hệ' : '🔒 Đã ký quỹ (Đang học)'}
                            </span>
                        )}
                            {isCompleted && (
                              <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                ✅ Hoàn tất & Đã giải ngân
                              </span>
                            )}
                            {booking.status === 'CANCELLED' && (
                              <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700 }}>
                                🚫 Đã hủy đơn
                              </span>
                            )}
                            {!isPendingPayment && !isEscrowHeld && !isCompleted && booking.status !== 'CANCELLED' && (
                              <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700 }}>
                                {booking.status}
                              </span>
                            )}
                          </div>
                    </div>

                      {/* Body Info */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#6a6f73', display: 'block', marginBottom: 2 }}>
                            {isTutor ? 'Học viên liên hệ:' : 'Gia sư hướng dẫn:'}
                          </span>
                          <strong style={{ fontSize: '1rem', color: '#1c1d1f', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <User size={16} color="#a435f0" />
                            {isTutor
                              ? (booking.studentName || 'Học viên #' + booking.studentId.substring(0, 6))
                              : (booking.tutorName || 'Gia sư chuyên môn')}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#6a6f73', display: 'block', marginBottom: 2 }}>
                            {isOption1 ? 'Gói môi giới kết nối:' : 'Gói dạy kèm trực tuyến:'}
                          </span>
                          <strong style={{ fontSize: '0.95rem', color: '#1c1d1f', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <BookOpen size={16} color="#0d6832" />
                            {booking.packageName || 'Gói dịch vụ gia sư'}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#6a6f73', display: 'block', marginBottom: 2 }}>
                            {isOption1 ? 'Phí dịch vụ môi giới:' : (isTutor ? 'Thu nhập gia sư:' : 'Học phí ký quỹ:')}
                          </span>
                          <strong style={{ fontSize: '1.15rem', color: '#a435f0', fontFamily: 'Outfit, sans-serif' }}>
                            {formatVND(isOption1 ? booking.totalPrice : (isTutor ? booking.tutorIncome : booking.totalPrice))}
                          </strong>
                            { isTutor && !isOption1 && (
                              <div style={{ fontSize: '0.75rem', color: '#6a6f73' }}>
                                (Học phí: {formatVND(booking.totalPrice)} - Phí sàn: {formatVND(booking.platformFee)})
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Unlocked Contact Box for Option 1 */}
                      {isOption1 && !isPendingPayment && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 700, marginBottom: 4 }}>
                            <Phone size={14} /> Thông tin liên hệ trực tiếp gia sư đã mở khóa:
                          </div>
                          <div style={{ color: '#14532d' }}>
                            SĐT / Zalo: <strong>0987.654.321</strong> • Email: <strong>{booking.tutorName?.toLowerCase().replace(/\s+/g, '') || 'giasu'}@gmail.com</strong>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: 4 }}>
                            💡 Hai bên tự do sắp xếp lịch dạy trực tiếp và tự thỏa thuận học phí ngoài theo mô hình thuần môi giới.
                          </div>
                        </div>
                      )}

                      {/* Actions / Escrow Bar */}
                      <div style={{ borderTop: '1px solid #f2f3f5', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#0d6832' }}>
                          <ShieldCheck size={16} />
                          <span>
                            {isOption1 ? (
                              isPendingPayment
                                ? 'Cần hoàn tất phí môi giới để mở khóa thông tin liên hệ'
                                : 'Đã hoàn tất kết nối môi giới thành công'
                            ) : (
                              isPendingPayment
                                ? 'Cần hoàn tất thanh toán để ký quỹ và giữ lịch gia sư'
                                : (isEscrowHeld
                                  ? 'Học phí được giữ an toàn trong ví Ký quỹ EduTutor'
                                  : 'Giao dịch hoàn tất thành công')
                            )}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {/* Student action to pay if PENDING_PAYMENT */}
                          {!isTutor && isPendingPayment && onOpenCheckout && (
                            <button
                              className="btn btn-primary"
                              style={{ fontSize: '0.85rem', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                              onClick={() => {
                                onClose();
                                onOpenCheckout({
                                  type: 'booking',
                                  item: { ...booking, isOption1 },
                                  bookingId: booking.id,
                                  amount: booking.totalPrice
                                });
                              }}
                            >
                              <CreditCard size={15} /> {isOption1 ? 'Thanh toán Phí Môi Giới' : 'Thanh toán Ký quỹ ngay'}
                            </button>
                          )}

                            {/* Option 2: Enter Google Meet */ }
                        {!isOption1 && isEscrowHeld && (
                            <a
                              href="https://meet.google.com/edututor-1on1-booking"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline"
                              style={{
                                fontSize: '0.85rem',
                                padding: '7px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                color: '#1a73e8',
                                borderColor: '#1a73e8'
                              }}
                            >
                              <Video size={15} /> Vào Google Meet 1-1
                            </a>
                          )}

                          {/* Student action to complete & release escrow (Option 2 only) */}
                          {!isTutor && !isOption1 && isEscrowHeld && (
                            <button
                              className="btn btn-primary"
                              style={{
                                fontSize: '0.85rem',
                                padding: '7px 16px',
                                backgroundColor: '#16a34a',
                                borderColor: '#16a34a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                              onClick={() => handleCompleteBooking(booking.id)}
                              disabled={completingId === booking.id}
                            >
                              {completingId === booking.id ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" /> Đang giải ngân...
                                </>
                              ) : (
                                <>
                                  <Check size={15} /> Xác nhận hoàn tất & Giải ngân
                                </>
                              )}
                            </button>
                          )}

                          {/* Nút Hủy đơn nếu chưa thanh toán */}
                          {!isTutor && isPendingPayment && (
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{
                                fontSize: '0.82rem',
                                padding: '6px 12px',
                                color: '#dc2626',
                                borderColor: '#fca5a5',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                background: '#fff1f2'
                              }}
                              disabled={completingId === booking.id}
                              onClick={() => handleCancelBooking(booking.id)}
                              title="Hủy đơn đặt lịch này"
                            >
                              <Trash2 size={14} /> Hủy đơn
                            </button>
                          )}

                          {/* Nút Xóa đơn khỏi danh sách nếu đơn đã bị Hủy */}
                          {!isTutor && booking.status === 'CANCELLED' && (
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{
                                fontSize: '0.82rem',
                                padding: '6px 12px',
                                color: '#64748b',
                                borderColor: '#cbd5e1',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                background: '#f8fafc'
                              }}
                              onClick={() => handleDeleteFromView(booking.id)}
                              title="Xóa đơn này khỏi màn hình xem"
                            >
                              <Trash2 size={14} /> Xóa khỏi danh sách
                            </button>
                          )}

                          {/* Nút Khiếu nại */}
                          {!isTutor && booking.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{
                                fontSize: '0.82rem',
                                padding: '6px 12px',
                                color: '#b45309',
                                borderColor: '#fcd34d',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                background: '#fffbeb'
                              }}
                              onClick={() => {
                                setSelectedBookingForDispute(booking);
                                setDisputeReason('');
                                setDisputeEvidence('');
                                setDisputeModalOpen(true);
                              }}
                              title="Gửi khiếu nại nếu gia sư không đến dạy hoặc vi phạm thỏa thuận"
                            >
                              <Scale size={14} /> Khiếu nại
                            </button>
                          )}

                          {isTutor && (
                            <button
                              className="btn btn-outline"
                              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                              onClick={() => {
                                onClose();
                                if (onOpenChat) onOpenChat({ id: booking.studentId, displayName: booking.studentName });
                              }}
                            >
                              💬 Nhắn tin học viên
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    );
              })}
                  </div>
                )
              }
        </div>
      </div>

      {/* Cửa sổ Popup Gửi Khiếu Nại (Dispute Modal) */}
      {disputeModalOpen && selectedBookingForDispute && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 16
          }}
          onClick={() => setDisputeModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              width: '100%',
              maxWidth: 500,
              padding: 24,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-in-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Scale size={22} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Gửi Khiếu Nại Đơn Thuê Gia Sư
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDisputeModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
              Nếu gia sư vắng mặt, không đúng giờ hoặc vi phạm cam kết, bạn hãy gửi khiếu nại để Ban quản trị đối chiếu và phân xử hoàn tiền ký quỹ an toàn.
            </p>

            <div style={{ marginBottom: 12, background: '#f8fafc', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Đơn đặt lịch: <strong style={{ color: '#0f172a' }}>#{selectedBookingForDispute.id?.substring(0, 8)}...</strong></div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                Gia sư: <strong>{selectedBookingForDispute.tutorName || 'Gia sư chuyên môn'}</strong> • Học phí: <strong style={{ color: '#b45309' }}>{formatVND(selectedBookingForDispute.totalPrice)}</strong>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Lý do khiếu nại (*):
              </label>
              <textarea
                rows={3}
                required
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Ví dụ: Gia sư không vào phòng học Meet ngày 03/11, đã gọi điện và nhắn tin Zalo nhưng không nhận được phản hồi..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Link chứng cứ đối chứng (Ảnh chụp Zalo, Drive, v.v.):
              </label>
              <input
                type="url"
                value={disputeEvidence}
                onChange={(e) => setDisputeEvidence(e.target.value)}
                placeholder="https://drive.google.com/file/... hoặc link ảnh"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setDisputeModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                Đóng lại
              </button>
              <button
                type="button"
                disabled={submittingDispute || !disputeReason.trim()}
                onClick={handleSubmitDispute}
                style={{
                  padding: '8px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  cursor: (submittingDispute || !disputeReason.trim()) ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {submittingDispute ? <Loader2 size={14} className="animate-spin" /> : <Scale size={14} />}
                Gửi khiếu nại cho Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
