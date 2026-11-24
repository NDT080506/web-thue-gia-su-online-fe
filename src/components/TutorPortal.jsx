import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  BookOpen,
  Users,
  Wallet,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowLeft,
  LogOut,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  Star,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  Check,
  Briefcase,
  User,
  LayoutDashboard,
  Shield,
  Send,
  Loader2,
  Calendar,
  X,
  CreditCard,
  Building,
  Eye,
  Sliders,
  ChevronRight
} from 'lucide-react';
import {
  courseApi,
  brokeragePackageApi,
  bookingApi,
  withdrawalApi,
  reviewApi,
  tutorProfileApi,
  walletApi,
  conversationApi,
  lessonApi
} from '../services/api';

const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const toIsoDateTime = (value) => value ? new Date(value).toISOString() : null;

export default function TutorPortal({
  currentUser,
  userWallet,
  onWalletUpdated,
  onBackToClient,
  onLogout,
  onOpenChat,
  onOpenCreatePackage
}) {
  const [activeTab, setActiveTab] = useState('overview');

  // Dữ liệu quản lý của Gia sư
  const [bookings, setBookings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [packages, setPackages] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [profile, setProfile] = useState({ bio: '', subjectsCanTeach: '' });
  const [conversations, setConversations] = useState([]);
  const [enrollments, setEnrollments] = useState({});

  // Trạng thái tải & xử lý
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Bộ lọc
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');

  // State cho Form tạo/sửa Khóa học nhanh
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    price: 399000,
    platformFeePercent: 10,
    active: true
  });
  const [courseLessons, setCourseLessons] = useState([]);
  const [deletedLessonIds, setDeletedLessonIds] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsLoadError, setLessonsLoadError] = useState(false);
  const [draftCourseId, setDraftCourseId] = useState(null);

  // State cho Form tạo/sửa Gói môi giới nhanh
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageForm, setPackageForm] = useState({
    name: '',
    price: 450000,
    platformFeePercent: 10,
    active: true
  });

  // State cho Form rút tiền
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    bankName: 'Vietcombank',
    accountNumber: '',
    accountHolder: ''
  });
  const [withdrawalSubmitting, setWithdrawalSubmitting] = useState(false);

  // State xem học viên của khóa học
  const [viewingEnrollmentsCourse, setViewingEnrollmentsCourse] = useState(null);

  // Profile edit form state
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Helper định dạng tiền tệ VND
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Thông báo tạm thời
  const showNotice = (msg, isErr = false) => {
    if (isErr) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setNotification(msg);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  // ==================== TẢI DỮ LIỆU TỔNG THỂ CỦA GIA SƯ ====================
  const loadAllTutorData = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const [
        bookingsRes,
        coursesRes,
        packagesRes,
        withdrawalsRes,
        reviewsRes,
        profileRes,
        convRes
      ] = await Promise.allSettled([
        bookingApi.getTutorBookings(),
        courseApi.getCoursesByTutor(currentUser.id),
        brokeragePackageApi.getPackagesByTutor(currentUser.id),
        withdrawalApi.getMyWithdrawals(),
        reviewApi.getTutorReviews(),
        tutorProfileApi.getMyProfile(),
        conversationApi.getMyConversations()
      ]);

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value) {
        setBookings(bookingsRes.value || []);
      }
      if (coursesRes.status === 'fulfilled' && coursesRes.value) {
        const loadedCourses = coursesRes.value || [];
        setCourses(loadedCourses);

        // Tải enrollments cho các khóa học
        loadedCourses.forEach(async (c) => {
          try {
            const enrolls = await courseApi.getEnrollmentsByCourse(c.id);
            setEnrollments(prev => ({ ...prev, [c.id]: enrolls || [] }));
          } catch (e) {
            // Không chặn tiến trình nếu lỗi 1 khóa học
          }
        });
      }
      if (packagesRes.status === 'fulfilled' && packagesRes.value) {
        setPackages(packagesRes.value || []);
      }
      if (withdrawalsRes.status === 'fulfilled' && withdrawalsRes.value) {
        setWithdrawals(withdrawalsRes.value || []);
      }
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value) {
        setReviews(reviewsRes.value || []);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setProfile({
          bio: profileRes.value.bio || '',
          subjectsCanTeach: profileRes.value.subjectsCanTeach || ''
        });
      }
      if (convRes.status === 'fulfilled' && convRes.value) {
        setConversations(convRes.value || []);
      }

    } catch (err) {
      console.warn('Lỗi khi tải dữ liệu Gia sư:', err);
      setErrorMsg('Không thể đồng bộ toàn bộ dữ liệu từ máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadAllTutorData();
  }, [loadAllTutorData]);

  // ==================== CÁC HÀM XỬ LÝ KHÓA HỌC ====================
  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    setDraftCourseId(null);
    setCourseLessons([]);
    setDeletedLessonIds([]);
    setLessonsLoadError(false);
    setCourseForm({
      title: '',
      price: 399000,
      platformFeePercent: 10,
      active: true
    });
    setCourseModalOpen(true);
  };

  const loadCourseLessons = async (courseId) => {
    setLessonsLoading(true);
    setLessonsLoadError(false);
    try {
      const lessons = await lessonApi.getLessons(courseId, 0, 100);
      setCourseLessons((lessons || []).map((lesson) => ({
          ...lesson,
          title: lesson.title || '',
          mediaUrl: lesson.mediaUrl || '',
          meetingUrl: lesson.meetingUrl || '',
          startsAt: toDateTimeLocal(lesson.startsAt)
      })));
    } catch (err) {
      setLessonsLoadError(true);
      showNotice(err.data?.message || err.message || 'Không thể tải danh sách bài học', true);
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setDraftCourseId(null);
    setCourseLessons([]);
    setDeletedLessonIds([]);
    setLessonsLoadError(false);
    setCourseForm({
      title: course.title || '',
      price: course.price || 0,
      platformFeePercent: course.platformFeePercent ?? 10,
      active: course.active ?? true
    });
    setCourseModalOpen(true);
    loadCourseLessons(course.id);
  };

  const handleAddCourseLesson = () => {
    setCourseLessons((prev) => [
      ...prev,
      { title: '', mediaUrl: '', meetingUrl: '', startsAt: '', lessonOrder: prev.length + 1 }
    ]);
  };

  const handleRemoveCourseLesson = (index) => {
    const lesson = courseLessons[index];
    if (lesson?.id) {
      setDeletedLessonIds((prev) => prev.includes(lesson.id) ? prev : [...prev, lesson.id]);
    }
    setCourseLessons((prev) => prev.filter((_, lessonIndex) => lessonIndex !== index));
  };

  const handleChangeCourseLesson = (index, field, value) => {
    setCourseLessons((prev) => prev.map((lesson, lessonIndex) =>
      lessonIndex === index ? { ...lesson, [field]: value } : lesson
    ));
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      showNotice('Vui lòng nhập tiêu đề khóa học', true);
      return;
    }
    if (lessonsLoading || lessonsLoadError) {
      showNotice('Vui lòng tải được danh sách bài học trước khi lưu khóa học', true);
      return;
    }
    if (courseLessons.some((lesson) => !lesson.title.trim())) {
      showNotice('Vui lòng nhập tiêu đề cho tất cả bài học', true);
      return;
    }

    setProcessingId('course-save');
    try {
      let courseId = editingCourse?.id || draftCourseId;
      if (editingCourse) {
        await courseApi.updateCourse(editingCourse.id, {
          title: courseForm.title.trim(),
          price: Number(courseForm.price),
          platformFeePercent: Number(courseForm.platformFeePercent),
          active: courseForm.active
        });
      } else if (draftCourseId) {
        await courseApi.updateCourse(draftCourseId, {
          title: courseForm.title.trim(),
          price: Number(courseForm.price),
          platformFeePercent: Number(courseForm.platformFeePercent),
          active: courseForm.active
        });
      } else {
        const createdCourse = await courseApi.createCourse({
          title: courseForm.title.trim(),
          price: Number(courseForm.price),
          platformFeePercent: Number(courseForm.platformFeePercent),
          active: courseForm.active
        });
        courseId = createdCourse?.id || createdCourse?.courseId || null;
        if (courseId) setDraftCourseId(courseId);
      }

      if (courseLessons.length && !courseId) {
        throw new Error('Khóa học đã được tạo nhưng không nhận được mã khóa học để lưu bài học. Vui lòng tải lại trang và thử lại.');
      }

      if (courseId) {
        for (const lessonId of deletedLessonIds) {
          await lessonApi.deleteLesson(lessonId);
          setDeletedLessonIds((prev) => prev.filter((id) => id !== lessonId));
        }

        let lessonsToSave = [...courseLessons];
        for (let index = 0; index < lessonsToSave.length; index += 1) {
          const lesson = lessonsToSave[index];
          const lessonData = {
            title: lesson.title.trim(),
            mediaUrl: lesson.mediaUrl.trim() || null,
            meetingUrl: lesson.meetingUrl.trim() || null,
            startsAt: toIsoDateTime(lesson.startsAt),
            lessonOrder: index + 1
          };

          if (lesson.id) {
            await lessonApi.updateLesson(lesson.id, lessonData);
          } else {
            const createdLesson = await lessonApi.createLesson(courseId, lessonData);
            let lessonId = createdLesson?.id || createdLesson?.lessonId;
            if (!lessonId) {
              const savedLessons = await lessonApi.getLessons(courseId, 0, 100);
              lessonId = savedLessons.find((saved) =>
                Number(saved.lessonOrder) === index + 1 && saved.title === lessonData.title
              )?.id;
            }
            if (lessonId) {
              lessonsToSave[index] = { ...lesson, id: lessonId };
              setCourseLessons([...lessonsToSave]);
            }
          }
        }
      }

      showNotice(editingCourse || draftCourseId ? 'Đã cập nhật khóa học và bài học thành công!' : 'Đã xuất bản khóa học mới thành công!');
      setCourseModalOpen(false);
      const res = await courseApi.getCoursesByTutor(currentUser.id);
      setCourses(res || []);
    } catch (err) {
      showNotice(err.data?.message || err.message || 'Lỗi khi lưu khóa học', true);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${courseTitle}"?`)) return;
    setProcessingId(courseId);
    try {
      await courseApi.deleteCourse(courseId);
      showNotice(`Đã xóa khóa học "${courseTitle}"`);
      setCourses(prev => prev.filter(c => c.id !== courseId));
    } catch (err) {
      showNotice(err.data?.message || err.message || 'Không thể xóa khóa học', true);
    } finally {
      setProcessingId(null);
    }
  };


  // Gia sư xác nhận hoàn thành khóa học và giải ngân tiền
  const handleCompleteEnrollment = async (enrollment) => {
    const courseId = viewingEnrollmentsCourse?.id;

    if (!courseId || !enrollment?.id || enrollment.status !== 'ACTIVE') {
      return;
    }

    if (!window.confirm(
      'Xác nhận khóa học đã hoàn thành? Tiền sẽ được giải ngân vào ví gia sư.'
    )) {
      return;
    }

    setProcessingId(enrollment.id);

    try {
      await courseApi.completeEnrollment(enrollment.id);

      const updatedEnrollments =
        await courseApi.getEnrollmentsByCourse(courseId, 0, 10);

      const updated = updatedEnrollments || [];

      setEnrollments(prev => ({
        ...prev,
        [courseId]: updated
      }));

      setViewingEnrollmentsCourse(prev =>
        prev?.id === courseId
          ? { ...prev, students: updated }
          : prev
      );

      showNotice(
        'Khóa học đã hoàn thành. Thu nhập đã được giải ngân vào ví!'
      );

      if (onWalletUpdated) {
        await onWalletUpdated();
      }

    } catch (err) {
      showNotice(
        err.data?.message ||
        err.message ||
        'Không thể hoàn thành khóa học và giải ngân.',
        true
      );
    } finally {
      setProcessingId(null);
    }
  };


  // ==================== CÁC HÀM XỬ LÝ GÓI MÔI GIỚI ====================
  const handleOpenCreatePackage = () => {
    setEditingPackage(null);
    setPackageForm({
      name: '',
      price: 450000,
      platformFeePercent: 10,
      active: true
    });
    setPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name || '',
      price: pkg.price || 0,
      platformFeePercent: pkg.platformFeePercent ?? 10,
      active: pkg.active ?? true
    });
    setPackageModalOpen(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (!packageForm.name.trim()) {
      showNotice('Vui lòng nhập tên gói dịch vụ', true);
      return;
    }

    setProcessingId('package-save');
    try {
      if (editingPackage) {
        await brokeragePackageApi.updatePackage(editingPackage.id, {
          name: packageForm.name.trim(),
          price: Number(packageForm.price),
          platformFeePercent: Number(packageForm.platformFeePercent),
          active: packageForm.active
        });
        showNotice('Đã cập nhật gói dịch vụ môi giới thành công!');
      } else {
        await brokeragePackageApi.createPackage({
          name: packageForm.name.trim(),
          price: Number(packageForm.price),
          platformFeePercent: Number(packageForm.platformFeePercent),
          active: packageForm.active
        });
        showNotice('Đã tạo gói dịch vụ môi giới mới thành công!');
      }
      setPackageModalOpen(false);
      const res = await brokeragePackageApi.getPackagesByTutor(currentUser.id);
      setPackages(res || []);
    } catch (err) {
      showNotice(err.data?.message || err.message || 'Lỗi khi lưu gói dịch vụ', true);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeletePackage = async (packageId, packageName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa gói dịch vụ "${packageName}"?`)) return;
    setProcessingId(packageId);
    try {
      await brokeragePackageApi.deletePackage(packageId);
      showNotice(`Đã xóa gói dịch vụ "${packageName}"`);
      setPackages(prev => prev.filter(p => p.id !== packageId));
    } catch (err) {
      showNotice(err.data?.message || err.message || 'Không thể xóa gói dịch vụ', true);
    } finally {
      setProcessingId(null);
    }
  };

  // ==================== CÁC HÀM XỬ LÝ RÚT TIỀN ====================
  const handleOpenWithdrawal = () => {
    setWithdrawalForm({
      amount: '',
      bankName: 'Vietcombank',
      accountNumber: '',
      accountHolder: (currentUser?.displayName || '').toUpperCase()
    });
    setWithdrawalModalOpen(true);
  };

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    const withdrawAmount = Number(withdrawalForm.amount);
    const available = userWallet?.availableBalance || 0;

    if (!withdrawAmount || withdrawAmount < 50000) {
      showNotice('Số tiền rút tối thiểu là 50.000 ₫', true);
      return;
    }
    if (withdrawAmount > available) {
      showNotice(`Số dư khả dụng không đủ (Hiện có: ${formatVND(available)})`, true);
      return;
    }
    if (!withdrawalForm.accountNumber.trim()) {
      showNotice('Vui lòng nhập số tài khoản ngân hàng', true);
      return;
    }
    if (!withdrawalForm.accountHolder.trim()) {
      showNotice('Vui lòng nhập tên chủ tài khoản', true);
      return;
    }

    setWithdrawalSubmitting(true);
    try {
      await withdrawalApi.createWithdrawal({
        amount: withdrawAmount,
        bankName: withdrawalForm.bankName,
        accountNumber: withdrawalForm.accountNumber.trim(),
        accountHolder: withdrawalForm.accountHolder.trim().toUpperCase()
      });
      showNotice('🎉 Đã gửi yêu cầu rút tiền thành công! Admin sẽ duyệt và giải ngân trong 24h.');
      setWithdrawalModalOpen(false);
      const res = await withdrawalApi.getMyWithdrawals();
      setWithdrawals(res || []);
      if (onWalletUpdated) onWalletUpdated();
    } catch (err) {
      showNotice(err.data?.message || err.message || 'Lỗi khi gửi yêu cầu rút tiền', true);
    } finally {
      setWithdrawalSubmitting(false);
    }
  };

  // ==================== CẬP NHẬT PROFILE ====================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);
    try {
      await tutorProfileApi.updateMyProfile({
        bio: profile.bio.trim(),
        subjectsCanTeach: profile.subjectsCanTeach.trim()
      });
      showNotice('Đã cập nhật hồ sơ năng lực gia sư thành công!');
    } catch (err) {
      showNotice(err.data?.message || err.message || 'Không thể cập nhật hồ sơ', true);
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Thống kê nhanh
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const pendingConfirmationBookings = bookings.filter(b => b.status === 'PENDING_CONFIRMATION');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalStudentsEnrolled = Object.values(enrollments).reduce((sum, list) => sum + (list?.length || 0), 0);

  // Lọc danh sách đơn học viên
  const filteredBookings = bookings.filter(b => {
    if (bookingStatusFilter !== 'ALL' && b.status !== bookingStatusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (b.studentName || '').toLowerCase().includes(term);
      const matchSubject = (b.subject || '').toLowerCase().includes(term);
      const matchPackage = (b.packageName || '').toLowerCase().includes(term);
      return matchName || matchSubject || matchPackage;
    }
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* 1. TOP HEADER BAR */}
      <header style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: '#ffffff',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Brand & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            width: 40,
            height: 40,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(139, 92, 246, 0.4)'
          }}>
            <GraduationCap size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>EduTutor</span>
              <span style={{
                background: 'rgba(139, 92, 246, 0.3)',
                color: '#c4b5fd',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 20,
                border: '1px solid rgba(196, 181, 253, 0.3)',
                textTransform: 'uppercase'
              }}>
                Gia Sư Workspace
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#a5b4fc' }}>Cổng quản trị giảng dạy & thu nhập</span>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Nút quay lại trang Marketplace / Học viên */}
          <button
            onClick={onBackToClient}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            title="Mở giao diện Học viên để tìm kiếm, mua khóa học và xem trang chủ"
          >
            <ArrowLeft size={16} />
            <span>Xem trang Web Học viên</span>
          </button>

          {/* Quick Wallet Button */}
          <button
            onClick={() => setActiveTab('finance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 20,
              background: '#4338ca',
              border: '1px solid #6366f1',
              color: '#e0e7ff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Bấm để xem chi tiết ví & gửi yêu cầu rút tiền"
          >
            <Wallet size={15} color="#a5b4fc" />
            <span>Ví: {formatVND(userWallet?.availableBalance || 0)}</span>
          </button>

          {/* Profile User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, borderLeft: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: 700
            }}>
              {(currentUser?.displayName || currentUser?.username || 'G')[0].toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff' }}>
                {currentUser?.displayName || currentUser?.username || 'Gia sư'}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#c4b5fd' }}>
                Gia sư chuyên nghiệp
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#f87171'}
            onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e1'}
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT AREA */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* SIDEBAR NAVIGATION */}
        <aside style={{
          width: 260,
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 0',
          flexShrink: 0
        }}>
          {/* Nhóm 1: Tổng quan */}
          <div style={{ padding: '0 20px 8px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Bảng điều khiển
          </div>
          <button
            onClick={() => { setActiveTab('overview'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'overview' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'overview' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'overview' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderLeft: activeTab === 'overview' ? '4px solid #7c3aed' : '4px solid transparent',
              textAlign: 'left',
              transition: 'all 0.15s'
            }}
          >
            <LayoutDashboard size={18} />
            <span>Tổng quan (Overview)</span>
          </button>

          {/* Nhóm 2: Dạy học & Học viên */}
          <div style={{ padding: '20px 20px 8px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Học viên & Lịch dạy
          </div>
          <button
            onClick={() => { setActiveTab('bookings'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'bookings' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'bookings' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'bookings' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderLeft: activeTab === 'bookings' ? '4px solid #7c3aed' : '4px solid transparent',
              textAlign: 'left',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Calendar size={18} />
              <span>Đơn học viên đặt lịch</span>
            </div>
            {bookings.length > 0 && (
              <span style={{
                background: activeTab === 'bookings' ? '#7c3aed' : '#e2e8f0',
                color: activeTab === 'bookings' ? '#ffffff' : '#475569',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12
              }}>
                {bookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('messages'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'messages' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'messages' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'messages' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderLeft: activeTab === 'messages' ? '4px solid #7c3aed' : '4px solid transparent',
              textAlign: 'left',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MessageCircle size={18} />
              <span>Tin nhắn học viên</span>
            </div>
            {conversations.length > 0 && (
              <span style={{
                background: '#a435f0',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12
              }}>
                {conversations.length}
              </span>
            )}
          </button>

          {/* Nhóm 3: Quản lý Nội dung */}
          <div style={{ padding: '20px 20px 8px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Nội dung & Dịch vụ
          </div>
          <button
            onClick={() => { setActiveTab('courses'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'courses' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'courses' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'courses' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderLeft: activeTab === 'courses' ? '4px solid #7c3aed' : '4px solid transparent',
              textAlign: 'left',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <BookOpen size={18} />
              <span>Khóa học trực tuyến</span>
            </div>
            <span style={{
              background: activeTab === 'courses' ? '#7c3aed' : '#e2e8f0',
              color: activeTab === 'courses' ? '#ffffff' : '#475569',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 12
            }}>
              {courses.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('packages'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'packages' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'packages' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'packages' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderLeft: activeTab === 'packages' ? '4px solid #7c3aed' : '4px solid transparent',
              textAlign: 'left',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Briefcase size={18} />
              <span>Gói dịch vụ môi giới 1-1</span>
            </div>
            <span style={{
              background: activeTab === 'packages' ? '#7c3aed' : '#e2e8f0',
              color: activeTab === 'packages' ? '#ffffff' : '#475569',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 12
            }}>
              {packages.length}
            </span>
          </button>

          {/* Nhóm 4: Tài chính & Hồ sơ */}
          <div style={{ padding: '20px 20px 8px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tài chính & Hồ sơ
          </div>
          <button
            onClick={() => { setActiveTab('finance'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'finance' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'finance' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'finance' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderLeft: activeTab === 'finance' ? '4px solid #7c3aed' : '4px solid transparent',
              textAlign: 'left',
              transition: 'all 0.15s'
            }}
          >
            <Wallet size={18} />
            <span>Ví & Rút tiền ngân hàng</span>
          </button>

          <button
            onClick={() => { setActiveTab('profile'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'profile' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'profile' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'profile' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderLeft: activeTab === 'profile' ? '4px solid #7c3aed' : '4px solid transparent',
              textAlign: 'left',
              transition: 'all 0.15s'
            }}
          >
            <User size={18} />
            <span>Hồ sơ chuyên môn</span>
          </button>

          <button
            onClick={() => { setActiveTab('reviews'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'reviews' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'reviews' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'reviews' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderLeft: activeTab === 'reviews' ? '4px solid #7c3aed' : '4px solid transparent',
              textAlign: 'left',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Star size={18} />
              <span>Đánh giá từ học viên</span>
            </div>
            {reviews.length > 0 && (
              <span style={{
                background: '#fef3c7',
                color: '#b45309',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12
              }}>
                {reviews.length}
              </span>
            )}
          </button>
        </aside>

        {/* MAIN CONTENT WORKSPACE */}
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          {/* Notifications banner */}
          {notification && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '12px 18px',
              borderRadius: 8,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span>{notification}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 18px',
              borderRadius: 8,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              <AlertCircle size={18} color="#ef4444" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: TỔNG QUAN (OVERVIEW) */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div>
              {/* Header Tab */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0' }}>
                    Chào mừng trở lại, {currentUser?.displayName || 'Gia sư'}! 👋
                  </h1>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem' }}>
                    Dưới đây là thống kê thu nhập, học viên và các hoạt động giảng dạy mới nhất của bạn.
                  </p>
                </div>
                <button
                  onClick={loadAllTutorData}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                  <span>Làm mới dữ liệu</span>
                </button>
              </div>

              {/* 4 Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20, marginBottom: 28 }}>
                {/* Card 1: Số dư ví khả dụng */}
                <div style={{ background: '#ffffff', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Số dư khả dụng</span>
                    <div style={{ background: '#f5f3ff', padding: 8, borderRadius: 8 }}>
                      <Wallet size={20} color="#7c3aed" />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#7c3aed', marginBottom: 8 }}>
                    {formatVND(userWallet?.availableBalance || 0)}
                  </div>
                  <button
                    onClick={handleOpenWithdrawal}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6d28d9',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      padding: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>Yêu cầu rút tiền ngay</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Card 2: Số dư đang ký quỹ */}
                <div style={{ background: '#ffffff', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Đang ký quỹ (Holding)</span>
                    <div style={{ background: '#fffbeb', padding: 8, borderRadius: 8 }}>
                      <Clock size={20} color="#d97706" />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#d97706', marginBottom: 8 }}>
                    {formatVND(userWallet?.holdingBalance || 0)}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Chờ học viên xác nhận hoàn thành
                  </span>
                </div>

                {/* Card 3: Tổng đơn học viên */}
                <div style={{ background: '#ffffff', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Học viên kết nối</span>
                    <div style={{ background: '#eff6ff', padding: 8, borderRadius: 8 }}>
                      <Users size={20} color="#2563eb" />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                    {bookings.length} đơn
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                    {pendingConfirmationBookings.length} đơn đang chờ dạy
                  </span>
                </div>

                {/* Card 4: Tổng khóa học & gói */}
                <div style={{ background: '#ffffff', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Nội dung mở bán</span>
                    <div style={{ background: '#f0fdf4', padding: 8, borderRadius: 8 }}>
                      <BookOpen size={20} color="#16a34a" />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                    {courses.length} Khóa • {packages.length} Gói
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {totalStudentsEnrolled} lượt học viên đăng ký
                  </span>
                </div>
              </div>

              {/* Quick Action Shortcuts */}
              <div style={{ background: '#ffffff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0', marginBottom: 28 }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                  ⚡ Thao tác nhanh
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <button
                    onClick={handleOpenCreatePackage}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 18px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#7c3aed',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <PlusCircle size={16} />
                    <span>Tạo gói dịch vụ 1-1 mới</span>
                  </button>

                  <button
                    onClick={handleOpenCreateCourse}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 18px',
                      borderRadius: 8,
                      border: '1px solid #ddd6fe',
                      background: '#f5f3ff',
                      color: '#6d28d9',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <BookOpen size={16} />
                    <span>Xuất bản khóa học online mới</span>
                  </button>

                  <button
                    onClick={handleOpenWithdrawal}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 18px',
                      borderRadius: 8,
                      border: '1px solid #bbf7d0',
                      background: '#f0fdf4',
                      color: '#166534',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <DollarSign size={16} />
                    <span>Yêu cầu rút tiền về ngân hàng</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('messages')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 18px',
                      borderRadius: 8,
                      border: '1px solid #bfdbfe',
                      background: '#eff6ff',
                      color: '#1e40af',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>Mở tin nhắn học viên</span>
                  </button>
                </div>
              </div>

              {/* Đơn đặt lịch gần đây */}
              <div style={{ background: '#ffffff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                    📋 Đơn kết nối học viên gần đây
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Xem tất cả ({bookings.length}) →
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                    <Calendar size={36} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>Chưa có học viên nào đặt lịch với bạn.</p>
                    <span style={{ fontSize: '0.82rem' }}>Hãy hoàn thiện hồ sơ và tạo thêm gói dịch vụ để thu hút học viên!</span>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '10px 12px' }}>Học viên</th>
                          <th style={{ padding: '10px 12px' }}>Gói dịch vụ</th>
                          <th style={{ padding: '10px 12px' }}>Học phí</th>
                          <th style={{ padding: '10px 12px' }}>Trạng thái</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 12px' }}>
                              <strong style={{ color: '#1e293b', display: 'block' }}>
                                {b.studentName || 'Học viên #' + (b.studentId ? b.studentId.substring(0, 6) : 'HV')}
                              </strong>
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{b.studentPhone || 'SĐT: Đã ẩn'}</span>
                            </td>
                            <td style={{ padding: '14px 12px', color: '#334155' }}>
                              {b.packageName || b.subject || 'Dạy kèm 1-1'}
                            </td>
                            <td style={{ padding: '14px 12px', fontWeight: 700, color: '#16a34a' }}>
                              {formatVND(b.totalPrice)}
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              {b.status === 'PENDING_PAYMENT' && (
                                <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
                                  ⏳ Chờ học viên thanh toán
                                </span>
                              )}
                              {b.status === 'PENDING_CONFIRMATION' && (
                                <span style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
                                  🛡️ Đã ký quỹ / Chờ hoàn thành
                                </span>
                              )}
                              {b.status === 'COMPLETED' && (
                                <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
                                  ✅ Hoàn tất & Đã giải ngân
                                </span>
                              )}
                              {b.status === 'CANCELLED' && (
                                <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
                                  🚫 Đã hủy
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                              <button
                                onClick={() => {
                                  if (onOpenChat) onOpenChat({ id: b.studentId, displayName: b.studentName });
                                }}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 6,
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  color: '#334155',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                💬 Nhắn tin
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: ĐƠN HỌC VIÊN ĐẶT LỊCH (BOOKINGS) */}
          {/* ========================================================= */}
          {activeTab === 'bookings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
                    📅 Quản Lý Đơn Học Viên Đặt Lịch
                  </h1>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                    Theo dõi danh sách học viên đăng ký học 1-1, kiểm tra trạng thái ký quỹ và liên hệ học viên.
                  </p>
                </div>
                <button
                  onClick={loadAllTutorData}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>Làm mới</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Tìm theo tên học viên, môn học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { id: 'ALL', label: 'Tất cả đơn' },
                    { id: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
                    { id: 'PENDING_CONFIRMATION', label: 'Đã ký quỹ' },
                    { id: 'COMPLETED', label: 'Đã hoàn thành' },
                    { id: 'CANCELLED', label: 'Đã hủy' }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setBookingStatusFilter(filter.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        border: '1px solid',
                        borderColor: bookingStatusFilter === filter.id ? '#7c3aed' : '#cbd5e1',
                        background: bookingStatusFilter === filter.id ? '#f5f3ff' : '#ffffff',
                        color: bookingStatusFilter === filter.id ? '#7c3aed' : '#475569',
                        fontSize: '0.82rem',
                        fontWeight: bookingStatusFilter === filter.id ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking List Cards */}
              {filteredBookings.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center', color: '#64748b' }}>
                  <Calendar size={42} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>Không tìm thấy đơn đặt lịch nào</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        padding: 20,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                              Học viên: {b.studentName || 'Học viên #' + (b.studentId ? b.studentId.substring(0, 8) : '')}
                            </h3>
                            {b.status === 'PENDING_PAYMENT' && (
                              <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 20, fontSize: '0.74rem', fontWeight: 700 }}>
                                ⏳ Chờ học viên thanh toán
                              </span>
                            )}
                            {b.status === 'PENDING_CONFIRMATION' && (
                              <span style={{ background: '#eff6ff', color: '#1e40af', padding: '3px 10px', borderRadius: 20, fontSize: '0.74rem', fontWeight: 700 }}>
                                🛡️ Đã ký quỹ / Chờ học hoàn tất
                              </span>
                            )}
                            {b.status === 'COMPLETED' && (
                              <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 20, fontSize: '0.74rem', fontWeight: 700 }}>
                                ✅ Hoàn tất & Đã giải ngân
                              </span>
                            )}
                            {b.status === 'CANCELLED' && (
                              <span style={{ background: '#fee2e2', color: '#991b1b', padding: '3px 10px', borderRadius: 20, fontSize: '0.74rem', fontWeight: 700 }}>
                                🚫 Đã hủy đơn
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2, display: 'block' }}>
                            Mã đơn: #{b.id?.substring(0, 10)} • Đặt lúc: {b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>HỌC PHÍ DỊCH VỤ</span>
                          <strong style={{ fontSize: '1.3rem', color: '#16a34a' }}>{formatVND(b.totalPrice)}</strong>
                        </div>
                      </div>

                      {/* Detail Info Grid */}
                      <div style={{ background: '#f8fafc', borderRadius: 8, padding: 14, marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: '0.85rem' }}>
                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.76rem' }}>Gói dịch vụ / Môn học:</span>
                          <strong style={{ color: '#1e293b' }}>{b.packageName || b.subject || 'Dạy kèm môn học theo yêu cầu'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.76rem' }}>Số điện thoại liên hệ:</span>
                          <strong style={{ color: '#1e293b' }}>{b.studentPhone || 'Chưa cung cấp'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.76rem' }}>Lịch học dự kiến:</span>
                          <strong style={{ color: '#1e293b' }}>{b.scheduledTime || 'Thỏa thuận trực tiếp với học sinh'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.76rem' }}>Ghi chú từ học viên:</span>
                          <span style={{ color: '#334155', fontStyle: 'italic' }}>{b.notes || 'Không có ghi chú thêm.'}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button
                          onClick={() => {
                            if (onOpenChat) onOpenChat({ id: b.studentId, displayName: b.studentName });
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 16px',
                            borderRadius: 6,
                            border: '1px solid #7c3aed',
                            background: '#f5f3ff',
                            color: '#7c3aed',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <MessageCircle size={15} />
                          <span>Nhắn tin với học viên</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: KHÓA HỌC TRỰC TUYẾN (COURSES) */}
          {/* ========================================================= */}
          {activeTab === 'courses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
                    📚 Khóa Học Trực Tuyến Đã Xuất Bản
                  </h1>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                    Quản lý các khóa học video, học phí, phần trăm phí sàn và danh sách học viên đăng ký.
                  </p>
                </div>
                <button
                  onClick={handleOpenCreateCourse}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#7c3aed',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <PlusCircle size={16} />
                  <span>Xuất bản khóa học mới</span>
                </button>
              </div>

              {courses.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center', color: '#64748b' }}>
                  <BookOpen size={42} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>Bạn chưa xuất bản khóa học online nào</h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem' }}>Đăng tải các bài giảng video để tạo nguồn thu nhập thụ động ngay hôm nay.</p>
                  <button
                    onClick={handleOpenCreateCourse}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 6,
                      background: '#7c3aed',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Tạo khóa học đầu tiên
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                  {courses.map((course) => {
                    const price = course.price || 0;
                    const feePercent = course.platformFeePercent ?? 10;
                    const fee = Math.round((price * feePercent) / 100);
                    const netIncome = Math.max(0, price - fee);
                    const enrolledStudents = enrollments[course.id] || [];

                    return (
                      <div
                        key={course.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                          padding: 20,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <span style={{
                              background: course.active ? '#dcfce7' : '#f1f5f9',
                              color: course.active ? '#166534' : '#64748b',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4
                            }}>
                              {course.active ? 'Đang mở bán' : 'Tạm dừng'}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                              Phí sàn: {feePercent}%
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                            {course.title}
                          </h3>

                          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                              <span style={{ color: '#64748b' }}>Giá bán niêm yết:</span>
                              <strong style={{ color: '#1e293b' }}>{formatVND(price)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                              <span style={{ color: '#64748b' }}>Phí nền tảng ({feePercent}%):</span>
                              <span style={{ color: '#ef4444' }}>-{formatVND(fee)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', paddingTop: 6, borderTop: '1px dashed #e2e8f0' }}>
                              <span style={{ fontWeight: 600, color: '#166534' }}>Thực nhận/lượt bán:</span>
                              <strong style={{ color: '#16a34a' }}>{formatVND(netIncome)}</strong>
                            </div>
                          </div>

                          {/* Enrollment Counter */}
                          <button
                            onClick={() => setViewingEnrollmentsCourse({ ...course, students: enrolledStudents })}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: '1px solid #bfdbfe',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              marginBottom: 14
                            }}
                          >
                            <Users size={14} />
                            <span>{enrolledStudents.length} học viên đã đăng ký học</span>
                          </button>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                          <button
                            onClick={() => handleOpenEditCourse(course)}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              padding: '8px 0',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#334155',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={14} />
                            <span>Chỉnh sửa</span>
                          </button>

                          <button
                            onClick={() => handleDeleteCourse(course.id, course.title)}
                            disabled={processingId === course.id}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: '1px solid #fecaca',
                              background: '#fef2f2',
                              color: '#dc2626',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Xóa khóa học này"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: GÓI MÔI GIỚI DỊCH VỤ 1-1 (PACKAGES) */}
          {/* ========================================================= */}
          {activeTab === 'packages' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
                    🤝 Gói Dịch Vụ Môi Giới Dạy Kèm 1-1
                  </h1>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                    Tạo và tùy biến các gói giờ dạy kèm để học viên có thể lựa chọn đăng ký khi tìm kiếm gia sư.
                  </p>
                </div>
                <button
                  onClick={handleOpenCreatePackage}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#7c3aed',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <PlusCircle size={16} />
                  <span>Tạo gói dịch vụ mới</span>
                </button>
              </div>

              {packages.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center', color: '#64748b' }}>
                  <Briefcase size={42} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>Bạn chưa tạo gói dịch vụ dạy kèm nào</h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem' }}>Hãy tạo các gói như "Gói kèm 10 buổi", "Gói Luyện đề cấp tốc"... để học viên dễ lựa chọn.</p>
                  <button
                    onClick={handleOpenCreatePackage}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 6,
                      background: '#7c3aed',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Tạo gói đầu tiên
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                  {packages.map((pkg) => {
                    const price = pkg.price || 0;
                    const feePercent = pkg.platformFeePercent ?? 10;
                    const fee = Math.round((price * feePercent) / 100);
                    const netIncome = Math.max(0, price - fee);

                    return (
                      <div
                        key={pkg.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                          padding: 20,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <span style={{
                              background: pkg.active ? '#f5f3ff' : '#f1f5f9',
                              color: pkg.active ? '#7c3aed' : '#64748b',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4
                            }}>
                              {pkg.active ? 'Đang hoạt động' : 'Tạm ẩn'}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                              Phí môi giới sàn: {feePercent}%
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                            {pkg.name}
                          </h3>

                          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                              <span style={{ color: '#64748b' }}>Giá gói dịch vụ:</span>
                              <strong style={{ color: '#1e293b' }}>{formatVND(price)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                              <span style={{ color: '#64748b' }}>Phí hoa hồng sàn ({feePercent}%):</span>
                              <span style={{ color: '#ef4444' }}>-{formatVND(fee)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', paddingTop: 6, borderTop: '1px dashed #e2e8f0' }}>
                              <span style={{ fontWeight: 600, color: '#166534' }}>Gia sư thực nhận:</span>
                              <strong style={{ color: '#16a34a' }}>{formatVND(netIncome)}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                          <button
                            onClick={() => handleOpenEditPackage(pkg)}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              padding: '8px 0',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#334155',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={14} />
                            <span>Chỉnh sửa</span>
                          </button>

                          <button
                            onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                            disabled={processingId === pkg.id}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: '1px solid #fecaca',
                              background: '#fef2f2',
                              color: '#dc2626',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Xóa gói dịch vụ này"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: VÍ & RÚT TIỀN (FINANCE & WITHDRAWALS) */}
          {/* ========================================================= */}
          {activeTab === 'finance' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
                    💰 Ví Giảng Viên & Yêu Cầu Rút Tiền
                  </h1>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                    Theo dõi số dư thu nhập, tạo lệnh rút tiền về tài khoản ngân hàng và tra cứu lịch sử giải ngân.
                  </p>
                </div>
                <button
                  onClick={handleOpenWithdrawal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <DollarSign size={16} />
                  <span>Rút tiền về ngân hàng</span>
                </button>
              </div>

              {/* Balance Summary Box */}
              <div style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                color: '#ffffff',
                borderRadius: 14,
                padding: 28,
                marginBottom: 28,
                boxShadow: '0 4px 20px rgba(49, 46, 129, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', color: '#c7d2fe', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Số Dư Thu Nhập Khả Dụng (Có thể rút ngay)
                    </span>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '8px 0 12px 0', color: '#ffffff' }}>
                      {formatVND(userWallet?.availableBalance || 0)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.85rem', color: '#e0e7ff' }}>
                      <span>
                        🔒 Đang ký quỹ (Holding): <strong>{formatVND(userWallet?.holdingBalance || 0)}</strong>
                      </span>
                      <span>•</span>
                      <span>Chủ tài khoản: <strong>{currentUser?.displayName || currentUser?.username}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={handleOpenWithdrawal}
                      style={{
                        padding: '12px 24px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#ffffff',
                        color: '#312e81',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                    >
                      Rút tiền ngay
                    </button>
                  </div>
                </div>
              </div>

              {/* Withdrawals History Table */}
              <div style={{ background: '#ffffff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                  📜 Lịch sử các yêu cầu rút tiền
                </h3>

                {withdrawals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                    <Building size={36} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>Bạn chưa có yêu cầu rút tiền nào.</p>
                    <span style={{ fontSize: '0.82rem' }}>Khi có số dư khả dụng, bạn có thể gửi lệnh rút tiền về ngân hàng bất kỳ lúc nào.</span>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '10px 12px' }}>Thời gian</th>
                          <th style={{ padding: '10px 12px' }}>Số tiền rút</th>
                          <th style={{ padding: '10px 12px' }}>Ngân hàng thụ hưởng</th>
                          <th style={{ padding: '10px 12px' }}>Số tài khoản</th>
                          <th style={{ padding: '10px 12px' }}>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawals.map((w) => (
                          <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 12px', color: '#64748b' }}>
                              {w.createdAt ? new Date(w.createdAt).toLocaleString('vi-VN') : 'Mới đây'}
                            </td>
                            <td style={{ padding: '14px 12px', fontWeight: 700, color: '#16a34a', fontSize: '0.95rem' }}>
                              {formatVND(w.amount)}
                            </td>
                            <td style={{ padding: '14px 12px', fontWeight: 600, color: '#1e293b' }}>
                              {w.bankName}
                            </td>
                            <td style={{ padding: '14px 12px', color: '#334155' }}>
                              {w.accountNumber} ({w.accountHolder})
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              {w.status === 'PENDING' && (
                                <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
                                  ⏳ Chờ Admin duyệt
                                </span>
                              )}
                              {(w.status === 'APPROVED' || w.status === 'COMPLETED') && (
                                <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
                                  ✅ Đã chuyển tiền thành công
                                </span>
                              )}
                              {w.status === 'REJECTED' && (
                                <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
                                  ❌ Bị từ chối
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: HỒ SƠ CHUYÊN MÔN (PROFILE) */}
          {/* ========================================================= */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
                  👤 Hồ Sơ Chuyên Môn & Năng Lực Gia Sư
                </h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                  Thông tin này sẽ được hiển thị công khai trên thẻ gia sư để học sinh tìm hiểu và đặt lịch học.
                </p>
              </div>

              <div style={{ background: '#ffffff', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0', maxWidth: 800 }}>
                <form onSubmit={handleSaveProfile}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                      Họ và Tên hiển thị
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.displayName || currentUser?.username || ''}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', fontSize: '0.9rem' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4, display: 'block' }}>Tên tài khoản cố định theo thông tin xác thực</span>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                      Các môn học có thể nhận dạy (Phân cách bằng dấu phẩy) *
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Toán 12, Luyện thi ĐH, Tiếng Anh IELTS, Lập trình Java..."
                      value={profile.subjectsCanTeach}
                      onChange={(e) => setProfile(prev => ({ ...prev, subjectsCanTeach: e.target.value }))}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                      Giới thiệu bản thân & Năng lực sư phạm (Bio) *
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Chia sẻ về kinh nghiệm giảng dạy, phương pháp sư phạm, thành tích học sinh trước đây..."
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      required
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', lineHeight: 1.5 }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={profileSubmitting}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 24px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#7c3aed',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {profileSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      <span>Lưu thông tin hồ sơ</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: ĐÁNH GIÁ TỪ HỌC VIÊN (REVIEWS) */}
          {/* ========================================================= */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
                  ⭐ Đánh Giá & Phản Hồi Từ Học Viên
                </h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                  Xem tất cả nhận xét và điểm số sao do học viên chấm sau các buổi học hoặc khóa học.
                </p>
              </div>

              {reviews.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center', color: '#64748b' }}>
                  <Star size={42} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>Chưa có đánh giá nào</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Sau khi học viên hoàn thành khóa học hoặc buổi dạy kèm, đánh giá của họ sẽ xuất hiện tại đây.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {reviews.map((rev) => (
                    <div
                      key={rev.id || Math.random()}
                      style={{
                        background: '#ffffff',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        padding: 20,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={16}
                              color="#f59e0b"
                              fill={s <= (rev.rating || 5) ? '#f59e0b' : 'none'}
                            />
                          ))}
                          <strong style={{ fontSize: '0.95rem', color: '#b45309', marginLeft: 4 }}>
                            {rev.rating || 5.0} / 5
                          </strong>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                        </span>
                      </div>

                      <p style={{ margin: '0 0 10px 0', fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                        "{rev.comment || 'Học viên không để lại lời bình.'}"
                      </p>

                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Học viên: <strong>{rev.studentName || 'Học viên ẩn danh'}</strong>
                        {rev.courseTitle && ` • Khóa học: ${rev.courseTitle}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: TIN NHẮN HỌC VIÊN (MESSAGES) */}
          {/* ========================================================= */}
          {activeTab === 'messages' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
                  💬 Hộp Thư Tin Nhắn Với Học Viên
                </h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                  Trao đổi trực tiếp, tư vấn lộ trình học và hỗ trợ học viên giải đáp thắc mắc.
                </p>
              </div>

              {conversations.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center', color: '#64748b' }}>
                  <MessageCircle size={42} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>Chưa có cuộc trò chuyện nào</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Khi học sinh bấm "Nhắn tin" với bạn trên trang hồ sơ hoặc đơn đặt lịch, cuộc trò chuyện sẽ hiện ở đây.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        if (onOpenChat) {
                          onOpenChat({
                            id: conv.studentId,
                            displayName: conv.studentName || conv.otherUserName || 'Học viên'
                          });
                        }
                      }}
                      style={{
                        background: '#ffffff',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        padding: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: '#eff6ff',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          fontWeight: 700
                        }}>
                          {(conv.studentName || conv.otherUserName || 'H')[0].toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: '#1e293b', display: 'block' }}>
                            {conv.studentName || conv.otherUserName || 'Học viên kết nối'}
                          </strong>
                          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            {conv.lastMessage || 'Bấm để mở cuộc trò chuyện trực tiếp'}
                          </span>
                        </div>
                      </div>

                      <button
                        style={{
                          padding: '6px 14px',
                          borderRadius: 6,
                          border: '1px solid #7c3aed',
                          background: '#f5f3ff',
                          color: '#7c3aed',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Mở chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* POPUP: MODAL TẠO / SỬA KHÓA HỌC */}
      {/* ========================================================= */}
      {courseModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            width: '100%',
            maxWidth: 720,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 24,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                {editingCourse ? 'Chỉnh sửa Khóa học' : 'Xuất bản Khóa học mới'}
              </h3>
              <button
                onClick={() => setCourseModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                  Tiêu đề khóa học *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Khóa Học Lập Trình React 19 Từ Cơ Bản Đến Nâng Cao"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                    Giá bán (VND) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={courseForm.price}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#16a34a', marginTop: 4, display: 'block' }}>
                    ≈ {formatVND(courseForm.price)}
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                    Phí sàn hệ thống (%) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={courseForm.platformFeePercent}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, platformFeePercent: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 4, display: 'block' }}>
                    Mặc định: 10%
                  </span>
                </div>
              </div>

              {/* Tính toán thu nhập thực nhận */}
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Phí sàn thu:</span>
                  <span style={{ color: '#ef4444' }}>
                    -{formatVND(Math.round(((Number(courseForm.price) || 0) * (Number(courseForm.platformFeePercent) || 0)) / 100))}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span style={{ color: '#166534' }}>Gia sư thực nhận / lượt bán:</span>
                  <span style={{ color: '#16a34a', fontSize: '0.95rem' }}>
                    {formatVND(Math.max(0, (Number(courseForm.price) || 0) - Math.round(((Number(courseForm.price) || 0) * (Number(courseForm.platformFeePercent) || 0)) / 100)))}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '0.95rem' }}>Danh sách bài học</h4>
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Thêm video, lịch học trực tiếp và sắp xếp thứ tự bài học.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCourseLesson}
                    disabled={lessonsLoading || lessonsLoadError}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 6, border: '1px solid #7c3aed', background: '#ffffff', color: '#7c3aed', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <PlusCircle size={16} />
                    Thêm bài học
                  </button>
                </div>

                {lessonsLoading ? (
                  <p style={{ margin: 0, padding: 14, color: '#64748b', textAlign: 'center' }}>Đang tải bài học...</p>
                ) : lessonsLoadError ? (
                  <div style={{ padding: 14, background: '#fff7ed', borderRadius: 8, color: '#9a3412', fontSize: '0.84rem', textAlign: 'center' }}>
                    Không tải được bài học hiện có. Hãy thử lại trước khi chỉnh sửa khóa học.
                    <button
                      type="button"
                      onClick={() => loadCourseLessons(editingCourse.id)}
                      style={{ display: 'block', margin: '8px auto 0', padding: '6px 10px', border: '1px solid #c2410c', borderRadius: 5, background: '#ffffff', color: '#9a3412', cursor: 'pointer' }}
                    >
                      Thử tải lại
                    </button>
                  </div>
                ) : courseLessons.length === 0 ? (
                  <p style={{ margin: 0, padding: 14, background: '#f8fafc', borderRadius: 8, color: '#64748b', fontSize: '0.84rem', textAlign: 'center' }}>
                    Chưa có bài học. Bạn có thể thêm bài học ngay tại đây.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {courseLessons.map((lesson, index) => (
                      <div key={lesson.id || `new-lesson-${index}`} style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <strong style={{ color: '#475569', fontSize: '0.82rem' }}>Bài học {index + 1}</strong>
                          <button
                            type="button"
                            onClick={() => handleRemoveCourseLesson(index)}
                            aria-label={`Xóa bài học ${index + 1}`}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 7px', border: 'none', borderRadius: 5, background: '#fff1f2', color: '#e11d48', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                            Xóa
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Tiêu đề bài học *"
                          value={lesson.title}
                          onChange={(e) => handleChangeCourseLesson(index, 'title', e.target.value)}
                          required
                          style={{ width: '100%', boxSizing: 'border-box', marginBottom: 8, padding: '9px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                        <input
                          type="url"
                          placeholder="Đường dẫn video (không bắt buộc)"
                          value={lesson.mediaUrl}
                          onChange={(e) => handleChangeCourseLesson(index, 'mediaUrl', e.target.value)}
                          style={{ width: '100%', boxSizing: 'border-box', marginBottom: 8, padding: '9px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <input
                            type="url"
                            placeholder="Đường dẫn buổi học trực tiếp"
                            value={lesson.meetingUrl}
                            onChange={(e) => handleChangeCourseLesson(index, 'meetingUrl', e.target.value)}
                            style={{ minWidth: 0, padding: '9px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          />
                          <input
                            type="datetime-local"
                            aria-label={`Thời gian bài học ${index + 1}`}
                            value={lesson.startsAt}
                            onChange={(e) => handleChangeCourseLesson(index, 'startsAt', e.target.value)}
                            style={{ minWidth: 0, padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={processingId === 'course-save' || lessonsLoading || lessonsLoadError}
                  style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: '#7c3aed', color: '#ffffff', fontWeight: 700, cursor: processingId === 'course-save' || lessonsLoading || lessonsLoadError ? 'not-allowed' : 'pointer', opacity: processingId === 'course-save' || lessonsLoading || lessonsLoadError ? 0.65 : 1 }}
                >
                  {processingId === 'course-save' ? 'Đang lưu...' : (editingCourse ? 'Cập nhật' : 'Xuất bản ngay')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POPUP: MODAL TẠO / SỬA GÓI DỊCH VỤ MÔI GIỚI */}
      {/* ========================================================= */}
      {packageModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            width: '100%',
            maxWidth: 520,
            padding: 24,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                {editingPackage ? 'Chỉnh sửa Gói Dịch Vụ Môi Giới' : 'Tạo Gói Dịch Vụ Môi Giới Mới'}
              </h3>
              <button
                onClick={() => setPackageModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePackage}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                  Tên gói dịch vụ dạy kèm *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Gói Kèm 1-1 Luyện Thi Đại Học Cấp Tốc (10 Buổi)"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                    Học phí gói (VND) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={packageForm.price}
                    onChange={(e) => setPackageForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#16a34a', marginTop: 4, display: 'block' }}>
                    ≈ {formatVND(packageForm.price)}
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                    Phí hoa hồng sàn (%) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={packageForm.platformFeePercent}
                    onChange={(e) => setPackageForm(prev => ({ ...prev, platformFeePercent: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              {/* Tính toán thu nhập thực nhận */}
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Phí hoa hồng môi giới sàn:</span>
                  <span style={{ color: '#ef4444' }}>
                    -{formatVND(Math.round(((Number(packageForm.price) || 0) * (Number(packageForm.platformFeePercent) || 0)) / 100))}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span style={{ color: '#166534' }}>Gia sư thực nhận:</span>
                  <span style={{ color: '#16a34a', fontSize: '0.95rem' }}>
                    {formatVND(Math.max(0, (Number(packageForm.price) || 0) - Math.round(((Number(packageForm.price) || 0) * (Number(packageForm.platformFeePercent) || 0)) / 100)))}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setPackageModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={processingId === 'package-save'}
                  style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: '#7c3aed', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {processingId === 'package-save' ? 'Đang lưu...' : (editingPackage ? 'Cập nhật' : 'Tạo gói ngay')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POPUP: MODAL YÊU CẦU RÚT TIỀN */}
      {/* ========================================================= */}
      {withdrawalModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            width: '100%',
            maxWidth: 500,
            padding: 26,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#dcfce7', padding: 8, borderRadius: 8 }}>
                  <Building size={20} color="#16a34a" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                  Yêu Cầu Rút Tiền Về Ngân Hàng
                </h3>
              </div>
              <button
                onClick={() => setWithdrawalModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Balance Notice */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 12, marginBottom: 18, fontSize: '0.88rem' }}>
              <span style={{ color: '#1e40af' }}>Số dư khả dụng hiện tại: </span>
              <strong style={{ color: '#1d4ed8', fontSize: '1.05rem' }}>
                {formatVND(userWallet?.availableBalance || 0)}
              </strong>
            </div>

            <form onSubmit={handleSubmitWithdrawal}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                  Số tiền muốn rút (VND) *
                </label>
                <input
                  type="number"
                  min={50000}
                  step={10000}
                  placeholder="Tối thiểu 50.000 ₫"
                  value={withdrawalForm.amount}
                  onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {[100000, 200000, 500000, 1000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawalForm(prev => ({ ...prev, amount: String(amt) }))}
                      style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.74rem', cursor: 'pointer' }}
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWithdrawalForm(prev => ({ ...prev, amount: String(userWallet?.availableBalance || 0) }))}
                    style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #7c3aed', background: '#f5f3ff', color: '#7c3aed', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Rút hết
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                  Ngân hàng thụ hưởng *
                </label>
                <select
                  value={withdrawalForm.bankName}
                  onChange={(e) => setWithdrawalForm(prev => ({ ...prev, bankName: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                >
                  <option value="Vietcombank">Vietcombank (Ngoại Thương Việt Nam)</option>
                  <option value="MBBank">MB Bank (Quân Đội)</option>
                  <option value="Techcombank">Techcombank (Kỹ Thương)</option>
                  <option value="BIDV">BIDV (Đầu tư & Phát triển Việt Nam)</option>
                  <option value="VietinBank">VietinBank (Công Thương)</option>
                  <option value="VPBank">VPBank (Việt Nam Thịnh Vượng)</option>
                  <option value="ACB">ACB (Á Châu)</option>
                  <option value="TPBank">TPBank (Tiên Phong)</option>
                  <option value="HDBank">HDBank (Phát triển TP.HCM)</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                  Số tài khoản ngân hàng *
                </label>
                <input
                  type="text"
                  placeholder="Nhập số tài khoản ngân hàng của bạn"
                  value={withdrawalForm.accountNumber}
                  onChange={(e) => setWithdrawalForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                  Tên chủ tài khoản (Viết hoa không dấu) *
                </label>
                <input
                  type="text"
                  placeholder="VÍ DỤ: NGUYEN VAN A"
                  value={withdrawalForm.accountHolder}
                  onChange={(e) => setWithdrawalForm(prev => ({ ...prev, accountHolder: e.target.value.toUpperCase() }))}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem', textTransform: 'uppercase' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setWithdrawalModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={withdrawalSubmitting}
                  style={{ padding: '8px 22px', borderRadius: 6, border: 'none', background: '#16a34a', color: '#ffffff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {withdrawalSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>Gửi yêu cầu rút</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POPUP: MODAL XEM HỌC VIÊN CỦA KHÓA HỌC */}
      {/* ========================================================= */}
      {viewingEnrollmentsCourse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            width: '100%',
            maxWidth: 600,
            padding: 24,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                  Học Viên Đã Đăng Ký Khóa Học
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {viewingEnrollmentsCourse.title}
                </span>
              </div>
              <button
                onClick={() => setViewingEnrollmentsCourse(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {(!viewingEnrollmentsCourse.students || viewingEnrollmentsCourse.students.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                <Users size={36} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                <p style={{ margin: 0, fontWeight: 600 }}>Chưa có học viên nào đăng ký khóa học này.</p>
              </div>
            ) : (
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 10px' }}>Học viên</th>
                      <th style={{ padding: '8px 10px' }}>Ngày đăng ký</th>
                      <th style={{ padding: '8px 10px' }}>Trạng thái</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {viewingEnrollmentsCourse.students.map((e, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>

                        <td style={{ padding: '12px 10px' }}>
                          <strong style={{ color: '#1e293b' }}>
                            {e.studentName || 'Học viên #' + (e.studentId?.substring(0, 6) || idx + 1)}
                          </strong>

                          <span style={{
                            fontSize: '0.76rem',
                            color: '#64748b',
                            display: 'block'
                          }}>
                            {e.studentEmail}
                          </span>
                        </td>

                        <td style={{ padding: '12px 10px', color: '#64748b' }}>
                          {e.createdAt
                            ? new Date(e.createdAt).toLocaleDateString('vi-VN')
                            : 'Gần đây'}
                        </td>

                        <td style={{ padding: '12px 10px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            background:
                              e.status === 'COMPLETED' ? '#dcfce7' :
                              e.status === 'ACTIVE' ? '#dbeafe' : '#f1f5f9',
                            color:
                              e.status === 'COMPLETED' ? '#166534' :
                              e.status === 'ACTIVE' ? '#1d4ed8' : '#475569'
                          }}>
                            {e.status === 'COMPLETED'
                              ? 'Đã hoàn thành / Đã giải ngân'
                              : e.status === 'ACTIVE'
                                ? 'Đã thanh toán / Đang giữ tiền'
                                : e.status === 'PENDING'
                                  ? 'Chờ thanh toán'
                                  : e.status || 'Không xác định'}
                          </span>
                        </td>

                        <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 6
                          }}>

                            {e.status === 'ACTIVE' &&
                              Number(viewingEnrollmentsCourse.price) > 0 && (
                                <button
                                  onClick={() => handleCompleteEnrollment(e)}
                                  disabled={processingId === e.id}
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: 6,
                                    border: '1px solid #15803d',
                                    background: '#16a34a',
                                    color: '#ffffff',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {processingId === e.id
                                    ? 'Đang xử lý...'
                                    : 'Hoàn thành & giải ngân'}
                                </button>
                            )}

                            <button
                              onClick={() => {
                                setViewingEnrollmentsCourse(null);

                                if (onOpenChat) {
                                  onOpenChat({
                                    id: e.studentId,
                                    displayName: e.studentName
                                  });
                                }
                              }}
                              style={{
                                padding: '5px 12px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#334155',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              💬 Nhắn tin
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
              <button
                onClick={() => setViewingEnrollmentsCourse(null)}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#334155', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
