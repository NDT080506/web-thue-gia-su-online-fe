import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ValueProps from './components/ValueProps';
import CourseTabs from './components/CourseTabs';
import TutorCard from './components/TutorCard';
import CategoriesGrid from './components/CategoriesGrid';
import ArticlesSection from './components/ArticlesSection';
import BecomeTutorBanner from './components/BecomeTutorBanner';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CourseDetailModal from './components/CourseDetailModal';
import ErrorBoundary from './components/ErrorBoundary';
import BookTutorModal from './components/BookTutorModal';
import TutorBookingsModal from './components/TutorBookingsModal';
import ChatModal from './components/ChatModal';
import CartModal from './components/CartModal';
import WishlistModal from './components/WishlistModal';
import ConversationsModal from './components/ConversationsModal';
import ArticlePostModal from './components/ArticlePostModal';
import AdminDashboardModal from './components/AdminDashboardModal';
import AdminPortal from './components/AdminPortal';
import TutorPortal from './components/TutorPortal';
import PaymentCheckoutModal from './components/PaymentCheckoutModal';
import WalletTopUpModal from './components/WalletTopUpModal';
import TutorApplicationModal from './components/TutorApplicationModal';
import {
  authApi,
  articleApi,
  courseApi,
  bookingApi,
  brokeragePackageApi,
  tutorApi,
  cartApi,
  wishlistApi,
  conversationApi,
  walletApi,
  tutorProfileApi,
  checkBackendHealth,
  getRoleFromToken,
  parseJwtPayload
} from './services/api';
import { formatCourseFromBackend } from './utils/courseAdapter';
import { GraduationCap, ArrowRight, Wifi, WifiOff, ShieldCheck } from 'lucide-react';
import './App.css';

function removeVietnameseTones(str) {
  if (!str) return '';
  str = String(str).toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  return str.trim();
}

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  const [courses, setCourses] = useState([]);
  const [coursesLoadError, setCoursesLoadError] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [tutorsLoadError, setTutorsLoadError] = useState(false);
  const [articles, setArticles] = useState([]);
  const [articlesLoadError, setArticlesLoadError] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);
  const [tutorBookingsModalOpen, setTutorBookingsModalOpen] = useState(false);
  const [adminDashboardModalOpen, setAdminDashboardModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.hash === '#admin';
  });
  const [isTutorView, setIsTutorView] = useState(() => {
    return window.location.hash === '#tutor';
  });

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === '#admin');
      setIsTutorView(window.location.hash === '#tutor');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [tutorApplicationModalOpen, setTutorApplicationModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Wallet & Payment Checkout State
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [userWallet, setUserWallet] = useState({ availableBalance: 0, holdingBalance: 0 });
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    type: 'course',
    item: null,
    enrollmentId: null,
    bookingId: null,
    amount: 0
  });
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [cartCheckoutQueue, setCartCheckoutQueue] = useState([]);
  const [cartCheckoutIndex, setCartCheckoutIndex] = useState(0);

  // Chat & Messenger Modal State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatTutor, setChatTutor] = useState(null);
  const [chatTargetStudent, setChatTargetStudent] = useState(null);
  const [chatTargetConversation, setChatTargetConversation] = useState(null);
  const [conversationsModalOpen, setConversationsModalOpen] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);

  // Cart & Wishlist State (Đồng bộ trực tiếp với CSDL PostgreSQL)
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Xử lý tìm kiếm môn học, khóa học, gia sư
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword || '');
    if (keyword) {
      setTimeout(() => {
        const clean = removeVietnameseTones(keyword);
        const hasTutorMatch = tutors.some(t =>
          removeVietnameseTones(t.name).includes(clean)
        );
        const hasCourseMatch = courses.some(c =>
          removeVietnameseTones(c.title).includes(clean)
        );
        if (hasTutorMatch && !hasCourseMatch) {
          document.getElementById('tutors')?.scrollIntoView({ behavior: 'smooth' });
        } else {
          document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  };

  // Lọc danh sách gia sư hiển thị theo từ khóa tìm kiếm (nếu có)
  const cleanSearchTerm = removeVietnameseTones(searchKeyword);
  const displayedTutors = cleanSearchTerm
    ? tutors.filter(t =>
      removeVietnameseTones(t.name).includes(cleanSearchTerm) ||
      removeVietnameseTones(t.title).includes(cleanSearchTerm) ||
      removeVietnameseTones(t.degree).includes(cleanSearchTerm) ||
      (t.subjects && t.subjects.some(s => removeVietnameseTones(s).includes(cleanSearchTerm))) ||
      (t.packages && t.packages.some(p => removeVietnameseTones(p.name).includes(cleanSearchTerm)))
    )
    : tutors;

  // Lấy số lượng cuộc trò chuyện Messenger từ CSDL
  const loadConversationsCount = async (user) => {
    if (!user || !['STUDENT', 'TUTOR'].includes(user.role)) {
      setConversationCount(0);
      return;
    }

    try {
      const convs = await conversationApi.getMyConversations();

      setConversationCount(
        Array.isArray(convs) ? convs.length : 0
      );
    } catch (e) {
      console.warn('Lỗi tải số lượng cuộc trò chuyện:', e);
      setConversationCount(0);
    }
  };

  // Lấy danh sách khóa học mà học sinh hiện tại đã đăng ký (chỉ khóa đã kích hoạt ACTIVE hoặc COMPLETED)
  const loadUserEnrollments = async (user) => {

    if (user?.role !== 'STUDENT') {
      setEnrolledCourseIds([]);
      return;
    }

    try {
      const enrollments = await courseApi.getMyEnrollments();
      if (enrollments && Array.isArray(enrollments)) {
        setEnrolledCourseIds(
          enrollments
            .filter((e) => e.status === 'ACTIVE' || e.status === 'COMPLETED')
            .map((e) => e.courseId)
        );
      }
    } catch (e) {
      console.log('Chưa thể lấy danh sách khóa học đã đăng ký:', e.message);
    }
  };

  // Lấy giỏ hàng & danh sách yêu thích từ CSDL
  const loadCartAndWishlist = async (user) => {
    if (user?.role !== 'STUDENT') {
      setCartItems([]);
      setWishlistItems([]);
      return;
    }
    try {
      const cart = await cartApi.getCart();
      if (cart && Array.isArray(cart)) setCartItems(cart);
    } catch (e) {
      console.warn('Lỗi tải giỏ hàng:', e.message);
    }
    try {
      const wish = await wishlistApi.getWishlist();
      if (wish && Array.isArray(wish)) setWishlistItems(wish);
    } catch (e) {
      console.warn('Lỗi tải danh sách yêu thích:', e.message);
    }
  };

  // Lấy danh sách thông báo & đơn đặt lịch cho người dùng hiện tại (Gia sư hoặc Học viên)
  const loadUserNotifications = async (user) => {
    if (!user) {
      setNotificationCount(0);
      return;
    }
    try {
      if (user.role === 'STUDENT') {
        const myBookings = await bookingApi.getMyBookings();
        if (myBookings && Array.isArray(myBookings)) {
          setNotificationCount(myBookings.length);
        }
      } else {
        // Backend chưa cung cấp endpoint liệt kê booking theo gia sư.
        setNotificationCount(0);
      }
    } catch (e) {
      console.log('Chưa thể lấy thông báo đặt lịch:', e.message);
    }
  };

  // Tải số dư ví của người dùng
  const loadUserWallet = async (user) => {
    if (!user?.id) return;
    try {
      const w = await walletApi.getWalletByUserId(user.id);
      setUserWallet(w || { availableBalance: 0, holdingBalance: 0 });
    } catch (err) {
      console.warn('Lỗi tải ví:', err);
    }
  };

  // Mở Checkout Modal
  const handleOpenCheckout = ({
      type,
      item,
      enrollmentId,
      bookingId,
      amount
  }) => {
      setCartCheckoutQueue([]);
      setCartCheckoutIndex(0);

      setCheckoutData({
          type,
          item,
          enrollmentId,
          bookingId,
          amount
      });

      setCheckoutModalOpen(true);
  };

  // Xử lý sau khi thanh toán thành công
  const handlePaymentSuccess = async (result) => {
      if (!result || result.status !== 'SUCCESS') {
          return;
      }

      if (currentUser) {
          await Promise.all([
              loadUserWallet(currentUser),
              loadUserNotifications(currentUser),
              loadCartAndWishlist(currentUser)
          ]);
      }

      if (checkoutData.type === 'course') {
          await loadUserEnrollments(currentUser);
      }
  };

  // Check Backend connection & load real data if online
  useEffect(() => {
    async function initData() {
      const online = await checkBackendHealth();

      setIsBackendOnline(online);
      if (!online) {
        setCoursesLoadError(true);
        setTutorsLoadError(true);
        setArticlesLoadError(true);
      }

      // Lưu user bên ngoài try để sử dụng ở cuối initData
      let savedUser = null;

      if (authApi.isAuthenticated()) {
        try {
          const user = await authApi.getMyInfo();

          const tokenRole = getRoleFromToken(
            authApi.getToken()
          );

          if (user && tokenRole) {
            user.role = tokenRole;
          }

          savedUser = user;

          setCurrentUser(user);

          await loadUserWallet(user);
          await loadUserEnrollments(user);
          await loadUserNotifications(user);
          await loadCartAndWishlist(user);
          await loadConversationsCount(user);

        } catch (e) {
          console.error(
              'Không thể khôi phục phiên đăng nhập:',
              e
          );

          const token = authApi.getToken();
          const payload = parseJwtPayload(token);

          const expiresAt = Number(payload?.exp);

          // Kiểm tra token có hợp lệ và còn hạn không
          const invalidToken =
              !payload ||
              !payload.sub ||
              !Number.isFinite(expiresAt) ||
              expiresAt * 1000 <= Date.now();

          // Chỉ xóa phiên khi token không hợp lệ,
          // token hết hạn hoặc backend trả về 401.
          if (e?.status === 401 || invalidToken) {
              authApi.clearSession();

              console.warn('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');

          } else {
              // Lỗi mạng, HTTP 500 hoặc 403:
              // Không tự tạo tài khoản giả và không xóa token.
              console.warn(
                  'Không thể xác minh tài khoản. Giữ token để thử lại sau.'
              );
          }

          // Không xác minh được thông tin người dùng thì không đăng nhập.
          savedUser = null;
          setCurrentUser(null);

          // Reset dữ liệu riêng của tài khoản.
          setUserWallet({
              availableBalance: 0,
              holdingBalance: 0
          });

          setEnrolledCourseIds([]);
          setNotificationCount(0);
          setConversationCount(0);
          setCartItems([]);
          setWishlistItems([]);
        }
        

      } else {
        setCurrentUser(null);
      }

      if (savedUser) {
        if (savedUser.role === 'ADMIN' && window.location.hash !== '#admin') {
          window.location.hash = '#admin';
          setIsAdminView(true);
          setIsTutorView(false);
        } else if (savedUser.role === 'TUTOR' && window.location.hash !== '#tutor') {
          window.location.hash = '#tutor';
          setIsTutorView(true);
          setIsAdminView(false);
        }
      }

      if (online) {
        try {
          const realArticles = await articleApi.getArticles();
          setArticles(Array.isArray(realArticles) ? realArticles : []);
          setArticlesLoadError(false);
        } catch (err) {
          console.warn('Lỗi lấy articles từ BE:', err);
          setArticles([]);
          setArticlesLoadError(true);
        }

        try {
          const realCourses = await courseApi.getCourses();

          const formatted = Array.isArray(realCourses)
            ? realCourses
                .map(course => formatCourseFromBackend(course))
                .filter(Boolean)
            : [];

          setCourses(formatted);
          setCoursesLoadError(false);
        } catch (err) {
          console.warn('Lỗi lấy courses từ BE:', err);
          setCoursesLoadError(true);
        }

        // Đã khai báo savedUser ở đầu hàm
        await fetchTutorsAndPackages(savedUser);
      }
    }

    initData().catch((err) => {
      console.error('Lỗi khởi tạo dữ liệu:', err);
    });

  }, []);

  // Đồng bộ danh sách gia sư và các gói dịch vụ trực tuyến từ Backend (hoàn toàn linh hoạt theo bất kỳ gia sư nào)
  const fetchTutorsAndPackages = async (viewer = currentUser) => {
    try {
      // 1. Lấy danh sách hồ sơ gia sư
      let realTutors = [];

      try {
        realTutors = await tutorApi.getTutors();
      } catch (err) {
        console.warn(
          'Lỗi lấy danh sách gia sư:',
          err.message
        );
        if (viewer?.role !== 'TUTOR') {
          setTutors([]);
          setTutorsLoadError(true);
          return;
        }
      }

      if (
        viewer?.role === 'TUTOR' &&
        viewer.id &&
        !realTutors.some((tutor) => String(tutor.id || tutor.userId) === String(viewer.id))
      ) {
        try {
          const profile = await tutorProfileApi.getMyProfile();
          if (!profile) {
            throw new Error('Không tìm thấy hồ sơ gia sư hiện tại.');
          }
          realTutors = [
            ...realTutors,
            {
              ...profile,
              id: profile.userId || viewer.id,
              userId: profile.userId || viewer.id,
              displayName:
                profile.displayName ||
                profile.userName ||
                profile.name ||
                viewer.displayName,
              avatarUrl: profile.avatarUrl || viewer.avatarUrl || ''
            }
          ];
        } catch (err) {
          console.warn('Lỗi lấy hồ sơ gia sư hiện tại:', err.message);
          if (realTutors.length === 0) {
            setTutors([]);
            setTutorsLoadError(true);
            return;
          }
        }
      }

      // 2. Lấy ID gia sư
      const tutorIds = [
        ...new Set(realTutors.map((t) => t.id || t.userId).filter(Boolean)),
      ];

      // 3. Lấy gói active của từng gia sư
      const packageResults = await Promise.all(
        tutorIds.map(async (tutorId) => {
          try {
            return await brokeragePackageApi.getPackagesByTutor(
              tutorId
            );
          } catch (err) {
            console.warn(
              `Lỗi lấy gói của gia sư ${tutorId}:`,
              err.message
            );

            return [];
          }
        })
      );

      const allPkgs = packageResults.flat();

      const formattedTutors = realTutors.flatMap((tutor) => {
        const tutorId = tutor.id || tutor.userId;
        const name =
          tutor.displayName ||
          tutor.name ||
          (String(viewer?.id) === String(tutorId) ? viewer?.displayName : '') ||
          'Gia sư';
        if (!tutorId) return [];

        const subjects = Array.isArray(tutor.subjectsCanTeach)
          ? tutor.subjectsCanTeach
          : (tutor.subjectsCanTeach || '')
              .split(/[,;\n]/)
              .map((item) => item.trim())
              .filter(Boolean);
        const tutorPackages = allPkgs.filter((pkg) => {
          const packageTutorId =
            pkg.tutorId || pkg.userId || pkg.tutor?.id || pkg.tutor?.userId;
          return String(packageTutorId) === String(tutorId);
        });

        return [{
          id: tutorId,
          name,
          title: tutor.title || tutor.headline || '',
          degree: tutor.degree || '',
          experience: tutor.experience || '',
          avatar: tutor.avatarUrl || tutor.avatar || '',
          rating: tutor.rating != null ? Number(tutor.rating) : null,
          reviews: tutor.reviews ?? tutor.reviewCount ?? null,
          students: tutor.students ?? tutor.studentCount ?? null,
          hourlyRate: tutor.hourlyRate ?? tutor.pricePerHour ?? null,
          subjects,
          isVerified: Boolean(tutor.isVerified),
          bio: tutor.bio || '',
          packages: tutorPackages
        }];
      });
      setTutors(formattedTutors);
      setTutorsLoadError(false);

    } catch (err) {
      console.warn(
        'Lỗi đồng bộ gia sư và gói dịch vụ:',
        err
      );
      setTutorsLoadError(true);
    }
  };

  // Handle Auth open
  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleRequireRole = (allowedRoles, deniedMessage) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return false;
    }

    if (!allowedRoles.includes(currentUser.role)) {
      alert(deniedMessage);
      return false;
    }

    return true;
  };

  const handleOpenProtectedService = (openService, allowedRoles, deniedMessage) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      alert(deniedMessage);
      return;
    }

    openService();
  };

  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    if (user?.role === 'ADMIN') {
      window.location.hash = '#admin';
      setIsAdminView(true);
      setIsTutorView(false);
    } else if (user?.role === 'TUTOR') {
      window.location.hash = '#tutor';
      setIsTutorView(true);
      setIsAdminView(false);
    } else {
      window.location.hash = '';
      setIsAdminView(false);
      setIsTutorView(false);
    }
    await loadUserWallet(user);
    await loadUserEnrollments(user);
    await loadUserNotifications(user);
    await loadCartAndWishlist(user);
    await loadConversationsCount(user);
    await fetchTutorsAndPackages(user);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();

      setCurrentUser(null);
      setUserWallet(null);
      setEnrolledCourseIds([]);
      setNotificationCount(0);
      setConversationCount(0);
      setCartItems([]);
      setWishlistItems([]);
      window.location.hash = '';
      setIsAdminView(false);
      setIsTutorView(false);

      alert('Đã đăng xuất thành công!');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Đăng xuất thất bại: ' + error.message);
    }
  };

  // ==================== CART ACTIONS (CSDL PostgreSQL) ====================
  const handleAddToCart = async (course) => {
    if (!handleRequireRole(['STUDENT'], 'Chỉ học viên mới có thể sử dụng giỏ hàng.')) return;
    try {
      await cartApi.addToCart(course.id);
      await loadCartAndWishlist(currentUser);
      alert(`🛒 Đã thêm khóa học "${course.title}" vào giỏ hàng (lưu vào CSDL)!`);
    } catch (err) {
      alert('Không thể thêm vào giỏ hàng: ' + (err.data?.message || err.message));
    }
  };

  const handleRemoveFromCart = async (courseId) => {
    if (!handleRequireRole(['STUDENT'], 'Chỉ học viên mới có thể sử dụng giỏ hàng.')) return;
    try {
      await cartApi.removeFromCart(courseId);
      await loadCartAndWishlist(currentUser);
    } catch (err) {
      console.error('Lỗi xóa khỏi giỏ hàng:', err);
    }
  };

  const handleClearCart = async () => {
    if (!handleRequireRole(['STUDENT'], 'Chỉ học viên mới có thể sử dụng giỏ hàng.')) return;
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ khóa học trong giỏ hàng?')) return;
    try {
      await cartApi.clearCart();
      await loadCartAndWishlist(currentUser);
    } catch (err) {
      console.error('Lỗi xóa sạch giỏ hàng:', err);
    }
  };

  const handleCheckoutCart = async () => {
      if (!handleRequireRole(['STUDENT'], 'Chỉ học viên mới có thể thanh toán khóa học trong giỏ hàng.')) return;
      try {
          // 1. Backend tạo hoặc lấy lại các enrollment PENDING
          const enrollments = await cartApi.checkout();

          const pendingEnrollments = (Array.isArray(enrollments) ? enrollments : [])
              .filter(e => e.status === 'PENDING');

          // 2. Không có enrollment cần thanh toán
          if (pendingEnrollments.length === 0) {
              await loadCartAndWishlist(currentUser);
              await loadUserEnrollments(currentUser);

              alert('Không có khóa học nào đang chờ thanh toán.');
              return;
          }

          // 3. Chuẩn bị danh sách thanh toán
          const queue = pendingEnrollments.map(enrollment => {
              const course = courses.find(
                  c => c.id === enrollment.courseId
              );

              const cartItem = cartItems.find(
                  c => c.courseId === enrollment.courseId
              );

              const amount = Number(
                  enrollment.pricePaid ??
                  cartItem?.price ??
                  course?.price ??
                  0
              );

              return {
                  type: 'course',
                  item: {
                      ...(course || {}),
                      id: enrollment.courseId,
                      title: course?.title || cartItem?.courseTitle || 'Khóa học',
                      price: amount,
                      thumbnail: course?.thumbnail || course?.image || null
                  },
                  enrollmentId: enrollment.id,
                  bookingId: null,
                  amount
              };
          });

          // 4. Khởi tạo hàng đợi thanh toán
          setCartCheckoutQueue(queue);
          setCartCheckoutIndex(0);

          // 5. Mở thanh toán khóa học đầu tiên
          setCheckoutData(queue[0]);
          setCheckoutModalOpen(true);

      } catch (err) {
          console.error('Lỗi checkout giỏ hàng:', err);

          alert(
              'Không thể tạo đơn thanh toán: ' +
              (err.data?.message || err.message)
          );

          throw err;
      }
  };

  
  const handleContinueCartCheckout = async () => {
      const nextIndex = cartCheckoutIndex + 1;

      // Nếu còn khóa học chưa thanh toán
      if (nextIndex < cartCheckoutQueue.length) {
          setCartCheckoutIndex(nextIndex);
          setCheckoutData(cartCheckoutQueue[nextIndex]);
          return;
      }

      // Đã thanh toán hết danh sách
      setCheckoutModalOpen(false);
      setCartCheckoutQueue([]);
      setCartCheckoutIndex(0);

      await Promise.all([
          loadCartAndWishlist(currentUser),
          loadUserEnrollments(currentUser),
          loadUserWallet(currentUser)
      ]);

      alert('Đã hoàn tất thanh toán tất cả khóa học!');
  };


  const handleCloseCheckout = () => {
      setCheckoutModalOpen(false);
      setCartCheckoutQueue([]);
      setCartCheckoutIndex(0);
  };



  // ==================== WISHLIST ACTIONS (CSDL PostgreSQL) ====================
  const handleToggleWishlist = async (courseId) => {
    if (!handleRequireRole(['STUDENT'], 'Chỉ học viên mới có thể sử dụng danh sách yêu thích.')) return;
    const isWishlisted = wishlistItems.some(w => w.courseId === courseId);
    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(courseId);
      } else {
        await wishlistApi.addToWishlist(courseId);
      }
      await loadCartAndWishlist(currentUser);
    } catch (err) {
      console.error('Lỗi cập nhật danh sách yêu thích:', err);
    }
  };

  const handleRemoveFromWishlist = async (courseId) => {
    if (!handleRequireRole(['STUDENT'], 'Chỉ học viên mới có thể sử dụng danh sách yêu thích.')) return;
    try {
      await wishlistApi.removeFromWishlist(courseId);
      await loadCartAndWishlist(currentUser);
    } catch (err) {
      console.error('Lỗi xóa khỏi danh sách yêu thích:', err);
    }
  };

  // Book Tutor (Đặt lịch gia sư 1-1 qua Modal thương lượng & chọn gói)
  const handleBookTutor = (tutor) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }

    if (currentUser.role !== 'STUDENT') {
      alert('Chỉ học viên mới có thể đặt lịch gia sư.');
      return;
    }

    setSelectedTutorForBooking(tutor);
  };

  // Chat Tutor (Học viên nhắn tin với Gia sư)
  const handleChatTutor = (tutor, conversation = null) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }

    if (currentUser.role !== 'STUDENT') {
      alert('Chỉ học viên mới có thể bắt đầu cuộc trò chuyện với gia sư.');
      return;
    }

    setChatTutor(tutor);
    setChatTargetStudent(null);
    setChatTargetConversation(conversation);
    setChatModalOpen(true);
  };

  // Gia sư mở chat với học viên từ đơn đặt lịch
  const handleOpenChatWithStudent = (student) => {
    setChatTutor(null);
    setChatTargetStudent(student);
    setChatTargetConversation(null);
    setChatModalOpen(true);
  };

  // Chọn cuộc trò chuyện từ Messenger Modal
  const handleSelectConversation = (conv, partnerInfo) => {
    setConversationsModalOpen(false);
    setChatTargetConversation(conv);
    if (partnerInfo?.tutorObject) {
      setChatTutor(partnerInfo.tutorObject);
      setChatTargetStudent(null);
    } else if (partnerInfo?.studentObject) {
      setChatTutor(null);
      setChatTargetStudent(partnerInfo.studentObject);
    } else {
      setChatTutor(null);
      setChatTargetStudent(null);
    }
    setChatModalOpen(true);
  };

  // Enroll Course & Payment Workflow
  const handleEnrollCourse = async (course) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return false;
    }

    if (currentUser.role !== 'STUDENT') {
      alert('Chỉ học viên mới có thể đăng ký khóa học.');
      return false;
    }

    if (!isBackendOnline) {
      alert('Không thể ghi danh khi máy chủ đang ngoại tuyến. Vui lòng thử lại sau.');
      return false;
    }
    if (course.price == null) {
      alert('Khóa học chưa có học phí để ghi danh. Vui lòng liên hệ gia sư.');
      return false;
    }

    try {
      if (course.price === 0) {
        await courseApi.enrollCourse(course.id);
        setEnrolledCourseIds(prev => [...new Set([...prev, course.id])]);
        alert(`🎉 Chúc mừng! Bạn đã đăng ký thành công khóa học miễn phí "${course.title}".`);
        return true;
      }

      const myEnrolls = await courseApi.getMyEnrollments();
      const enrollment = (myEnrolls || []).find(e => e.courseId === course.id);

      if (enrollment) {
        if (enrollment.status === 'ACTIVE' || enrollment.status === 'COMPLETED') {
          setEnrolledCourseIds(prev => [...new Set([...prev, course.id])]);
          alert(`Bạn đã đăng ký khóa học "${course.title}" rồi.`);
          return true;
        }

        handleOpenCheckout({
          type: 'course',
          item: course,
          enrollmentId: enrollment.id,
          amount: course.price
        });
        return false;
      }

      const res = await courseApi.enrollCourse(course.id);
      handleOpenCheckout({
        type: 'course',
        item: course,
        enrollmentId: res?.id,
        amount: course.price
      });
      return false;
    } catch (err) {
      const errMsg = String(err?.data?.message || err?.message || err || 'Có lỗi xảy ra');
      if (errMsg.includes('already enrolled') || errMsg.includes('đã đăng ký') || err?.status === 400) {
        // Thử mở checkout nếu có pending
        try {
          const myEnrolls = await courseApi.getMyEnrollments();
          const pending = (myEnrolls || []).find(e => e.courseId === course.id && e.status === 'PENDING');
          const active = (myEnrolls || []).find(e =>
            e.courseId === course.id && (e.status === 'ACTIVE' || e.status === 'COMPLETED')
          );
          if (pending) {
            handleOpenCheckout({
              type: 'course',
              item: course,
              enrollmentId: pending.id,
              amount: course.price
            });
            return false;
          }
          if (active) {
            setEnrolledCourseIds(prev => [...new Set([...prev, course.id])]);
            alert(`Bạn đã ghi danh khóa học "${course.title}" rồi.`);
            return true;
          }
        } catch (lookupError) {
          console.warn('Không thể xác minh trạng thái ghi danh:', lookupError);
        }
        alert(`Không thể xác minh trạng thái ghi danh: ${errMsg}`);
        return false;
      }
      alert(`Đăng ký khóa học không thành công: ${errMsg}`);
      throw err;
    }
  };

  // Create Article
  const handleCreateArticle = async () => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    if (!isBackendOnline) {
      alert('Không thể đăng bài khi máy chủ đang ngoại tuyến. Vui lòng thử lại sau.');
      return;
    }
    const title = prompt('Nhập tiêu đề bài viết:');
    if (!title) return;
    const content = prompt('Nhập nội dung bài viết:');
    if (!content) return;

    try {
      await articleApi.createArticle({
        title,
        content,
        minRoleLevel: 0
      });
      alert('Đã đăng bài viết mới lên Backend thành công!');
      const updated = await articleApi.getArticles();
      setArticles(Array.isArray(updated) ? updated : []);
      setArticlesLoadError(false);
    } catch (err) {
      alert('Không thể đăng bài: ' + err.message);
    }
  };

  // Delete Article (Chỉ người đăng bài viết hoặc Quản trị viên mới có quyền xóa)
  const handleDeleteArticle = async (articleId) => {
    if (!isBackendOnline) {
      alert('Không thể xóa bài viết khi máy chủ đang ngoại tuyến.');
      return;
    }

    try {
      await articleApi.deleteArticle(articleId);
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle(null);
      }
      alert('Đã xóa bài viết thành công khỏi diễn đàn!');
    } catch (err) {
      console.error('Lỗi khi xóa bài viết:', err);
      const msg = err.data?.message || err.message || 'Không có quyền xóa bài viết này';
      alert(`Không thể xóa bài viết: ${msg}`);
      throw err;
    }
  };

  const wishlistCourseIds = wishlistItems.map(w => w.courseId);

  // Tách riêng giao diện Admin Portal nếu đang ở chế độ Quản trị
  if (isAdminView) {
    if (currentUser?.role === 'ADMIN') {
      return (
        <AdminPortal
          currentUser={currentUser}
          onBackToClient={async () => {
            window.location.hash = '';
            setIsAdminView(false);
            await fetchTutorsAndPackages(currentUser);
          }}
          onLogout={handleLogout}
          onDeleteArticle={handleDeleteArticle}
        />
      );
    } else {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1e24 100%)',
          color: '#fff',
          flexDirection: 'column',
          gap: 16,
          padding: 24,
          textAlign: 'center'
        }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={36} color="#dc2626" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Khu Vực Quản Trị Hệ Thống EduTutor</h2>
          {currentUser ? (
            <p style={{ color: '#fca5a5', margin: 0, maxWidth: 500, fontSize: '0.95rem' }}>
              Bạn đang đăng nhập bằng tài khoản <strong>{currentUser.displayName || currentUser.email}</strong> (vai trò: {currentUser.role}). Để vào Bảng quản trị, vui lòng chuyển sang tài khoản <strong>ADMIN</strong>.
            </p>
          ) : (
            <p style={{ color: '#94a3b8', margin: 0, maxWidth: 460, fontSize: '0.95rem' }}>
              Bạn cần đăng nhập bằng tài khoản có vai trò Quản trị viên (ADMIN) để truy cập Bảng điều khiển quản trị.
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => {
                if (currentUser) {
                  handleLogout();
                }
                setAuthMode('login');
                setAuthModalOpen(true);
              }}
              style={{
                padding: '10px 22px',
                borderRadius: 6,
                fontWeight: 700,
                background: '#a435f0',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {currentUser ? 'Đăng xuất & Đăng nhập Admin' : 'Đăng nhập tài khoản Admin'}
            </button>
            <button
              onClick={() => {
                window.location.hash = '';
                setIsAdminView(false);
              }}
              style={{
                padding: '10px 22px',
                borderRadius: 6,
                fontWeight: 600,
                background: 'transparent',
                color: '#fff',
                border: '1px solid #475569',
                cursor: 'pointer'
              }}
            >
              Quay về trang chủ
            </button>
          </div>

          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            initialMode={authMode}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      );
    }
  }

  // Tách riêng giao diện Tutor Workspace nếu đang ở chế độ Gia sư
  if (isTutorView) {
    if (currentUser?.role === 'TUTOR') {
      return (
        <ErrorBoundary>
          <TutorPortal
            currentUser={currentUser}
            userWallet={userWallet}
            onWalletUpdated={() => loadUserWallet(currentUser)}
            onBackToClient={() => {
              window.location.hash = '';
              setIsTutorView(false);
            }}
            onLogout={handleLogout}
            onOpenChat={(student) => {
              handleOpenChatWithStudent(student);
            }}
          />

          {/* Modal Nhắn tin với học viên khi gọi từ TutorPortal */}
          <ChatModal
            isOpen={chatModalOpen}
            onClose={() => {
              setChatModalOpen(false);
              setChatTargetStudent(null);
            }}
            tutor={null}
            targetStudent={chatTargetStudent}
            targetConversation={chatTargetConversation}
            currentUser={currentUser}
          />

        </ErrorBoundary>
      );
    } else {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#fff',
          flexDirection: 'column',
          gap: 16,
          padding: 24,
          textAlign: 'center'
        }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={36} color="#7c3aed" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Không Gian Làm Việc Dành Cho Gia Sư</h2>
          {currentUser ? (
            <p style={{ color: '#c4b5fd', margin: 0, maxWidth: 500, fontSize: '0.95rem' }}>
              Bạn đang đăng nhập với tài khoản <strong>{currentUser.displayName || currentUser.email}</strong> (vai trò: {currentUser.role}). Bạn cần được cấp quyền <strong>TUTOR</strong> hoặc đăng ký ứng tuyển gia sư để truy cập khu vực này.
            </p>
          ) : (
            <p style={{ color: '#cbd5e1', margin: 0, maxWidth: 460, fontSize: '0.95rem' }}>
              Vui lòng đăng nhập bằng tài khoản Gia sư (TUTOR) hoặc đăng ký trở thành Gia sư để vào Bảng quản trị giảng dạy.
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => {
                if (currentUser) handleLogout();
                setAuthMode('login');
                setAuthModalOpen(true);
              }}
              style={{
                padding: '10px 22px',
                borderRadius: 6,
                fontWeight: 700,
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {currentUser ? 'Đăng xuất & Đăng nhập Gia sư' : 'Đăng nhập tài khoản Gia sư'}
            </button>
            <button
              onClick={() => {
                window.location.hash = '';
                setIsTutorView(false);
                setTutorApplicationModalOpen(true);
              }}
              style={{
                padding: '10px 22px',
                borderRadius: 6,
                fontWeight: 600,
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer'
              }}
            >
              Đăng ký trở thành Gia sư
            </button>
            <button
              onClick={() => {
                window.location.hash = '';
                setIsTutorView(false);
              }}
              style={{
                padding: '10px 22px',
                borderRadius: 6,
                fontWeight: 600,
                background: 'transparent',
                color: '#cbd5e1',
                border: '1px solid #64748b',
                cursor: 'pointer'
              }}
            >
              Quay về trang chủ Học viên
            </button>
          </div>

          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            initialMode={authMode}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      );
    }
  }

  return (
    <div className="ud-app">
      {/* Backend Status indicator banner */}
      <div className={`backend-status-pill ${isBackendOnline ? 'online' : 'offline'}`}>
        {isBackendOnline ? (
          <>
            <Wifi size={14} /> <span>Backend Spring Boot: <strong>Đã kết nối (Online)</strong></span>
          </>
        ) : (
          <>
            <WifiOff size={14} /> <span>Backend: <strong>Chế độ Mock (Offline)</strong></span>
          </>
        )}
      </div>

      {/* 1. Header / Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        cartCount={cartItems.length}
        wishlistCount={wishlistItems.length}
        notificationCount={notificationCount}
        conversationCount={conversationCount}
        onOpenBookings={() => handleOpenProtectedService(
          () => setTutorBookingsModalOpen(true),
          ['STUDENT', 'TUTOR'],
          'Chức năng này chỉ dành cho học viên và gia sư.'
        )}
        onOpenCart={() => handleOpenProtectedService(
          () => setCartModalOpen(true),
          ['STUDENT'],
          'Chỉ học viên mới có thể mở giỏ hàng.'
        )}
        onOpenWishlist={() => handleOpenProtectedService(
          () => setWishlistModalOpen(true),
          ['STUDENT'],
          'Chỉ học viên mới có thể mở danh sách yêu thích.'
        )}
        userWallet={userWallet}
        onOpenWallet={() => handleOpenProtectedService(() => setWalletModalOpen(true))}
        onOpenConversations={() => {
          if (!currentUser) {
            handleOpenAuth('login');
            return;
          }

          if (!['STUDENT', 'TUTOR'].includes(currentUser.role)) {
            alert('Chức năng dành cho học viên và gia sư.');
            return;
          }

          setConversationsModalOpen(true);
        }}
        onOpenAdmin={() => {
          setIsAdminView(true);
          window.location.hash = 'admin';
        }}
        onOpenTutorPortal={() => {
          setIsTutorView(true);
          window.location.hash = 'tutor';
        }}
        courses={courses}
        tutors={tutors}
        onSearch={handleSearch}
        onSelectCourse={(course) => setSelectedCourse(course)}
        onSelectTutor={(tutor) => handleBookTutor(tutor)}
        onOpenTutorApplication={() => setTutorApplicationModalOpen(true)}
      />

      <main>
        {/* 2. Hero Udemy Banner */}
        <HeroBanner
          onExploreCourses={() => {
            document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onFindTutor={() => {
            document.getElementById('tutors')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onSearchTag={handleSearch}
        />

        {/* 3. Value Props (Why choose EduTutor) */}
        <ValueProps />

        {/* 4. Filterable Courses Section (Connected to Backend Courses) */}
        <CourseTabs
          courses={courses}
          loadError={coursesLoadError}
          onSelectCourse={(course) => setSelectedCourse(course)}
          onAddToCart={handleAddToCart}
          wishlist={wishlistCourseIds}
          onToggleWishlist={handleToggleWishlist}
          searchKeyword={searchKeyword}
          onClearSearch={() => setSearchKeyword('')}
        />

        {/* 5. Featured 1-on-1 Tutors Section */}
        <section className="ud-tutors-section" id="tutors">
          <div className="container">
            <div className="ud-section-header">
              <div className="ud-header-left">
                <span className="ud-section-tag">
                  <GraduationCap size={14} /> Gia sư dạy kèm 1-1
                </span>
                <h2 className="ud-section-title">Gia sư chất lượng cao hàng đầu</h2>
                <p className="ud-section-desc">
                  Đội ngũ thủ khoa, thạc sĩ và chuyên gia sư phạm hàng đầu đã được xác thực hồ sơ và bằng cấp nghiêm ngặt.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="ud-view-all-btn">
                  Xem tất cả gia sư <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="ud-tutors-grid">
              {displayedTutors.length > 0 ? (
                displayedTutors.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    onBookTutor={handleBookTutor}
                    onChatTutor={handleChatTutor}
                  />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: 8, color: '#64748b' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {tutorsLoadError
                      ? 'Không thể tải danh sách gia sư. Vui lòng thử lại sau.'
                      : searchKeyword
                        ? `Không tìm thấy gia sư nào phù hợp với từ khóa "${searchKeyword}"`
                        : 'Chưa có gia sư nào.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 6. Top Categories Grid */}
        <CategoriesGrid onSelectCategory={(catId) => alert(`Lọc theo danh mục: ${catId}`)} />

        {/* 7. Community Articles & Forum (Connected to Backend Articles) */}
        <ArticlesSection
          articles={articles}
          loadError={articlesLoadError}
          onOpenArticle={(art) => setSelectedArticle(art)}
          onCreateArticle={handleCreateArticle}
          onDeleteArticle={handleDeleteArticle}
          currentUser={currentUser}
        />

        {/* 8. Become Instructor Banner */}
        <BecomeTutorBanner onApplyTutor={() => setTutorApplicationModalOpen(true)} />

      </main>

      {/* 10. Udemy Footer */}
      <Footer />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
      />

      <ErrorBoundary onReset={() => setSelectedCourse(null)}>
        <CourseDetailModal
          course={selectedCourse}
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEnroll={handleEnrollCourse}
          onAddToCart={handleAddToCart}
          isEnrolled={selectedCourse ? enrolledCourseIds.includes(selectedCourse.id) : false}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
        />
      </ErrorBoundary>

      <BookTutorModal
        tutor={selectedTutorForBooking}
        isOpen={!!selectedTutorForBooking}
        onClose={() => {
          setSelectedTutorForBooking(null);
          loadUserNotifications(currentUser);
        }}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenChat={handleChatTutor}
        onOpenCheckout={handleOpenCheckout}
      />

      <TutorBookingsModal
        isOpen={tutorBookingsModalOpen}
        onClose={() => setTutorBookingsModalOpen(false)}
        currentUser={currentUser}
        onOpenChat={handleOpenChatWithStudent}
        onOpenCheckout={handleOpenCheckout}
        onWalletUpdated={() => loadUserWallet(currentUser)}
      />

      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => {
          setChatModalOpen(false);
          setChatTargetConversation(null);
          if (currentUser) loadConversationsCount(currentUser);
        }}
        tutor={chatTutor}
        targetStudent={chatTargetStudent}
        targetConversation={chatTargetConversation}
        currentUser={currentUser}
        onOpenBook={(t) => {
          setChatModalOpen(false);
          handleBookTutor(t);
        }}
      />

      <ConversationsModal
        isOpen={conversationsModalOpen}
        onClose={() => setConversationsModalOpen(false)}
        currentUser={currentUser}
        onSelectConversation={handleSelectConversation}
        onNavigateToTutors={() => {
          document.getElementById('tutors')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <CartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCheckout={handleCheckoutCart}
        onSelectCourse={(course) => setSelectedCourse(course)}
        courses={courses}
      />

      <WishlistModal
        isOpen={wishlistModalOpen}
        onClose={() => setWishlistModalOpen(false)}
        wishlistItems={wishlistItems}
        onRemoveItem={handleRemoveFromWishlist}
        onAddToCart={handleAddToCart}
        onSelectCourse={(course) => setSelectedCourse(course)}
        courses={courses}
      />

      <ArticlePostModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onDeleteArticle={handleDeleteArticle}
      />

      <AdminDashboardModal
        isOpen={adminDashboardModalOpen}
        onClose={() => setAdminDashboardModalOpen(false)}
        currentUser={currentUser}
        onDeleteArticle={handleDeleteArticle}
      />

      <PaymentCheckoutModal
          isOpen={checkoutModalOpen}
          onClose={handleCloseCheckout}
          type={checkoutData.type}
          item={checkoutData.item}
          enrollmentId={checkoutData.enrollmentId}
          bookingId={checkoutData.bookingId}
          amount={checkoutData.amount}
          currentUser={currentUser}
          onSuccess={handlePaymentSuccess}
          onContinue={
              cartCheckoutQueue.length > 0
                  ? handleContinueCartCheckout
                  : null
          }
          hasNextPayment={
              cartCheckoutIndex < cartCheckoutQueue.length - 1
          }
          onOpenTopUp={() => setWalletModalOpen(true)}
      />

      <WalletTopUpModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        currentUser={currentUser}
        onWalletUpdated={(w) => setUserWallet(w)}
      />

      <TutorApplicationModal
        isOpen={tutorApplicationModalOpen}
        onClose={() => setTutorApplicationModalOpen(false)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenAdmin={() => {
          setIsAdminView(true);
          window.location.hash = 'admin';
        }}
      />

    </div>
  );
}
