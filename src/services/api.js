const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper giải mã JWT payload và trích xuất vai trò (Role)
 */
export function parseJwtPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function getRoleFromToken(token) {
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  const scope = payload.scope || '';
  if (scope.includes('ADMIN')) return 'ADMIN';
  if (scope.includes('TUTOR')) return 'TUTOR';
  if (scope.includes('STUDENT')) return 'STUDENT';
  return null;
}

/**
 * Helper to make HTTP requests with JWT token attachment
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || `Lỗi HTTP: ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    // Spring Boot ApiResponse format: { code: 1000, message: "...", result: ... }
    return data?.result !== undefined ? data.result : data;
  } catch (error) {
    console.warn(`[API] Gọi ${endpoint} thất bại:`, error.message);
    throw error;
  }
}

/**
 * Helper trích xuất mảng phần tử từ Spring Data Page<T> (hoặc trả nguyên mảng nếu BE trả List)
 */
function extractPageContent(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.content)) return res.content;
  return [];
}

/**
 * Helper gắn tham số phân trang mặc định cho các API dùng Pageable trên BE Optimize01
 */
function withPagination(endpoint, page = 0, size = 100) {
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}page=${page}&size=${size}`;
}

/* ==================== 1. AUTHENTICATION & USERS ==================== */
export const authApi = {
  // POST /auth/login (Backend requires displayName & password)
  login: async (displayName, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ displayName, password }),
    });
    // Backend Spring Boot returns result.accessToken
    const token = res?.accessToken || res?.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    if (res?.refreshToken) {
      localStorage.setItem('refreshToken', res.refreshToken);
    }
    return res;
  },

  // POST /users (Register requires email, password, displayName, role)
  register: async (userData) => {
    return await request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // GET /users (Get current user)
  getMyInfo: async () => {
    const res = await request('/users');
    const token = localStorage.getItem('token');
    const tokenRole = getRoleFromToken(token);
    if (res && tokenRole) {
      res.role = tokenRole;
    }
    return res;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  getToken: () => localStorage.getItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token'),
};

/* ==================== 2. ARTICLES & COMMENTS ==================== */
export const articleApi = {
  // GET /articles (Public, trả về Page<ArticleResponse>)
  getArticles: async (page = 0, size = 100) => {
    const res = await request(withPagination('/articles', page, size));
    return extractPageContent(res);
  },

  // GET /articles/:id
  getArticle: async (id) => {
    return await request(`/articles/${id}`);
  },

  // GET /articles/my-articles (trả về Page<ArticleResponse>)
  getMyArticles: async (page = 0, size = 100) => {
    const res = await request(withPagination('/articles/my-articles', page, size));
    return extractPageContent(res);
  },

  // POST /articles (Create new article)
  createArticle: async (articleData) => {
    return await request('/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
    });
  },

  // DELETE /articles/:id (Chỉ tác giả hoặc Admin mới có quyền xóa)
  deleteArticle: async (id) => {
    return await request(`/articles/${id}`, {
      method: 'DELETE',
    });
  },

  // GET /article-comments/article/:articleId (trả về Page<ArticleCommentResponse>)
  getComments: async (articleId, page = 0, size = 100) => {
    const res = await request(withPagination(`/article-comments/article/${articleId}`, page, size));
    return extractPageContent(res);
  },

  // POST /article-comments/:articleId
  createComment: async (articleId, content, parentId = null) => {
    return await request(`/article-comments/${articleId}`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    });
  },
};

/* ==================== 3. COURSES & ENROLLMENT ==================== */
export const courseApi = {
  // GET /courses (trả về Page<CourseResponse>)
  getCourses: async (page = 0, size = 100) => {
    const res = await request(withPagination('/courses', page, size));
    return extractPageContent(res);
  },

  // GET /courses/:id
  getCourse: async (id) => {
    return await request(`/courses/${id}`);
  },

  // GET /lessons/course/:courseId (Lấy danh sách bài học của khóa học - Page<LessonResponse>)
  getLessons: async (courseId, page = 0, size = 100) => {
    const res = await request(withPagination(`/lessons/course/${courseId}`, page, size));
    return extractPageContent(res);
  },

  // POST /course-enrollments (Đăng ký ghi danh khóa học)
  enrollCourse: async (courseId) => {
    return await request('/course-enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  },

  // GET /course-enrollments/me (Lấy danh sách khóa học của học sinh hiện tại - Page<CourseEnrollmentResponse>)
  getMyEnrollments: async (page = 0, size = 100) => {
    const res = await request(withPagination('/course-enrollments/me', page, size));
    return extractPageContent(res);
  },

  // GET /course-enrollments/me/course/:courseId (Lấy thông tin ghi danh khóa học của học sinh hiện tại)
  getMyEnrollmentByCourse: async (courseId) => {
    try {
      const enrollments = await courseApi.getMyEnrollments(0, 100);
      return (enrollments || []).find((e) => e.courseId === courseId) || null;
    } catch {
      return null;
    }
  },

  // PATCH /course-enrollments/:id/progress (Cập nhật tiến độ theo enrollmentId)
  updateProgress: async (enrollmentId, progressPercent) => {
    return await request(`/course-enrollments/${enrollmentId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progressPercent }),
    });
  },

  // PATCH /course-enrollments/course/:courseId/progress (Cập nhật tiến độ theo courseId)
  updateProgressByCourse: async (courseId, progressPercent) => {
    return await request(`/course-enrollments/course/${courseId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progressPercent }),
    });
  },

  // PATCH /course-enrollments/tutor/:enrollmentId/complete (Gia sư xác nhận hoàn tất khóa học)
  completeEnrollment: async (enrollmentId) => {
    return await request(`/course-enrollments/tutor/${enrollmentId}/complete`, {
      method: 'PATCH',
    });
  },
};

/* ==================== 4. CONVERSATION & AGREEMENT ==================== */
export const conversationApi = {
  // POST /conversations/direct (Tạo hoặc lấy hội thoại trực tiếp với gia sư)
  createDirect: async (tutorId) => {
    return await request('/conversations/direct', {
      method: 'POST',
      body: JSON.stringify({ tutorId }),
    });
  },

  // GET /conversations/me (Lấy danh sách cuộc trò chuyện của tôi - Page<ConversationResponse>)
  getMyConversations: async (page = 0, size = 100) => {
    const res = await request(withPagination('/conversations/me', page, size));
    return extractPageContent(res);
  },

  // GET /conversations/:id
  getConversation: async (id) => {
    return await request(`/conversations/${id}`);
  },

  // PATCH /conversations/:id/agreement/student (Xác nhận đồng ý điều kiện thương lượng)
  agreeAsStudent: async (id) => {
    return await request(`/conversations/${id}/agreement/student`, {
      method: 'PATCH',
    });
  },

  // PATCH /conversations/:id/decline/student (Từ chối điều kiện)
  declineAsStudent: async (id) => {
    return await request(`/conversations/${id}/decline/student`, {
      method: 'PATCH',
    });
  },
};

/* ==================== 4.1. MESSAGES & REALTIME ==================== */
export const messageApi = {
  // GET /messages/conversation/:conversationId (trả về Page<MessageResponse>)
  getMessages: async (conversationId, page = 0, size = 200) => {
    const res = await request(withPagination(`/messages/conversation/${conversationId}`, page, size));
    return extractPageContent(res);
  },

  // POST /messages
  sendMessage: async (conversationId, content) => {
    return await request('/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, content }),
    });
  },
};

/* ==================== 5. BROKERAGE PACKAGES ==================== */
export const brokeragePackageApi = {
  // GET /brokerage-packages/tutor/:tutorId (trả về Page<BrokeragePackageResponse>)
  getPackagesByTutor: async (tutorId, page = 0, size = 100) => {
    const res = await request(withPagination(`/brokerage-packages/tutor/${tutorId}`, page, size));
    return extractPageContent(res);
  },

  // GET /brokerage-packages/:id
  getPackage: async (id) => {
    return await request(`/brokerage-packages/${id}`);
  },
};

/* ==================== 6. BOOKING & TUTORING ==================== */
export const bookingApi = {
  // POST /bookings/me (Tạo đơn thuê gia sư)
  createBooking: async (packageId) => {
    return await request('/bookings/me', {
      method: 'POST',
      body: JSON.stringify({ packageId }),
    });
  },

  // GET /bookings/me (Lấy các đơn đặt lịch của học sinh hiện tại - Page<BookingResponse>)
  getMyBookings: async (page = 0, size = 100) => {
    const res = await request(withPagination('/bookings/me', page, size));
    return extractPageContent(res);
  },

  // GET /bookings/tutor (Lấy các đơn học viên đặt lịch với gia sư hiện tại)
  getTutorBookings: async (page = 0, size = 100) => {
    const res = await request(withPagination('/bookings/tutor', page, size));
    return extractPageContent(res);
  },

  // PATCH /bookings/:id/cancel
  cancelBooking: async (id) => {
    return await request(`/bookings/${id}/cancel`, {
      method: 'PATCH',
    });
  },

  // PATCH /bookings/:id/complete (Học viên hoàn thành & giải ngân ký quỹ cho gia sư)
  completeBooking: async (id) => {
    return await request(`/bookings/${id}/complete`, {
      method: 'PATCH',
    });
  },

  // GET /bookings/:id (Chi tiết đơn booking)
  getBooking: async (id) => {
    return await request(`/bookings/${id}`);
  },
};

/* ==================== 7. HEALTH CHECK ==================== */
export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${BASE_URL}/articles?page=0&size=1`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
};

/* ==================== 8. CART ==================== */
export const cartApi = {
  // GET /cart (Lấy danh sách khóa học trong giỏ hàng - Page<CartItemResponse>)
  getCart: async (page = 0, size = 100) => {
    const res = await request(withPagination('/cart', page, size));
    return extractPageContent(res);
  },

  // POST /cart (Thêm khóa học vào giỏ hàng)
  addToCart: async (courseId) => {
    return await request('/cart', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  },

  // DELETE /cart/:courseId (Xóa khóa học khỏi giỏ hàng)
  removeFromCart: async (courseId) => {
    return await request(`/cart/${courseId}`, {
      method: 'DELETE',
    });
  },

  // DELETE /cart (Xóa sạch giỏ hàng)
  clearCart: async () => {
    return await request('/cart', {
      method: 'DELETE',
    });
  },

  // POST /cart/checkout (Thanh toán & Đăng ký tất cả khóa học trong giỏ)
  checkout: async () => {
    return await request('/cart/checkout', {
      method: 'POST',
    });
  },
};

/* ==================== 9. WISHLIST ==================== */
export const wishlistApi = {
  // GET /wishlist (Lấy danh sách yêu thích - Page<WishlistItemResponse>)
  getWishlist: async (page = 0, size = 100) => {
    const res = await request(withPagination('/wishlist', page, size));
    return extractPageContent(res);
  },

  // POST /wishlist/:courseId (Thêm vào yêu thích)
  addToWishlist: async (courseId) => {
    return await request(`/wishlist/${courseId}`, {
      method: 'POST',
    });
  },

  // DELETE /wishlist/:courseId (Xóa khỏi yêu thích)
  removeFromWishlist: async (courseId) => {
    return await request(`/wishlist/${courseId}`, {
      method: 'DELETE',
    });
  },
};

/* ==================== 10. ADMIN MANAGEMENT ==================== */
export const adminApi = {
  // GET /users/admin (Lấy danh sách tất cả người dùng - Page<UserResponse>)
  getAllUsers: async (page = 0, size = 100) => {
    const res = await request(withPagination('/users/admin', page, size));
    return extractPageContent(res);
  },

  // PUT /users/admin/:userId/status (Khóa hoặc Mở khóa tài khoản)
  updateUserStatus: async (userId, status) => {
    return await request(`/users/admin/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // GET /tutor-applications/admin (Lấy danh sách đơn đăng ký gia sư - Page<TutorApplicationResponse>)
  getTutorApplications: async (page = 0, size = 100) => {
    const res = await request(withPagination('/tutor-applications/admin', page, size));
    return extractPageContent(res);
  },

  // PATCH /tutor-applications/admin/:applicationId/approve (Duyệt đơn gia sư)
  approveTutorApplication: async (applicationId) => {
    return await request(`/tutor-applications/admin/${applicationId}/approve`, {
      method: 'PATCH',
    });
  },

  // PATCH /tutor-applications/admin/:applicationId/reject (Từ chối đơn gia sư)
  rejectTutorApplication: async (applicationId, adminNote = '') => {
    return await request(`/tutor-applications/admin/${applicationId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ adminNote }),
    });
  },

  // GET /brokerage-packages/admin/get-all (Lấy tất cả gói môi giới - Page<BrokeragePackageResponse>)
  getAllPackages: async (page = 0, size = 100) => {
    const res = await request(withPagination('/brokerage-packages/admin/get-all', page, size));
    return extractPageContent(res);
  },

  // GET /admin/disputes (Lấy danh sách khiếu nại tranh chấp cho Admin - Page<DisputeResponse>)
  getDisputes: async (status, page = 0, size = 100) => {
    const base = status ? `/admin/disputes?status=${status}` : '/admin/disputes';
    const res = await request(withPagination(base, page, size));
    return extractPageContent(res);
  },

  // GET /admin/disputes/:id (Xem chi tiết khiếu nại)
  getDisputeDetail: async (id) => {
    return await request(`/admin/disputes/${id}`);
  },

  // PATCH /admin/disputes/:id/approve (Chấp thuận khiếu nại & hoàn tiền)
  approveDispute: async (id) => {
    return await request(`/admin/disputes/${id}/approve`, {
      method: 'PATCH',
    });
  },

  // PATCH /admin/disputes/:id/reject (Từ chối / Bác bỏ khiếu nại)
  rejectDispute: async (id) => {
    return await request(`/admin/disputes/${id}/reject`, {
      method: 'PATCH',
    });
  },

  // GET /admin/action-logs (Lấy nhật ký kiểm toán hệ thống - Page<ActionLogResponse>)
  getActionLogs: async (params = {}) => {
    const query = new URLSearchParams();
    const merged = { page: 0, size: 100, ...params };
    Object.entries(merged).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    const res = await request(`/admin/action-logs${queryString ? `?${queryString}` : ''}`);
    return extractPageContent(res);
  },

  // GET /admin/action-logs/:id
  getActionLogById: async (id) => {
    return await request(`/admin/action-logs/${id}`);
  },

  // GET /admin/withdrawals (Lấy danh sách yêu cầu rút tiền - Page<WithdrawalResponse>)
  getWithdrawals: async (page = 0, size = 100) => {
    const res = await request(withPagination('/admin/withdrawals', page, size));
    return extractPageContent(res);
  },
};

/* ==================== 11. WALLET & DEPOSIT ==================== */
export const walletApi = {
  // POST /wallets (User tự gọi API tạo ví trên BE Optimize01)
  createWallet: async (type = 'NORMAL') => {
    return await request('/wallets', {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  },

  // GET /wallets/user (BE Optimize01 trả về Page<WalletResponse>)
  getMyWallets: async (page = 0, size = 20) => {
    const res = await request(withPagination('/wallets/user', page, size));
    return extractPageContent(res);
  },

  // Lấy ví NORMAL của user hiện tại (trả về null nếu user chưa tạo ví)
  getMyWallet: async () => {
    const wallets = await walletApi.getMyWallets();
    return wallets.find((w) => w.type === 'NORMAL') || wallets[0] || null;
  },

  // Tương thích các component cũ gọi theo userId -> chuyển sang GET /wallets/user
  getWalletByUserId: async (_userId) => {
    return await walletApi.getMyWallet();
  },

  // Đảm bảo user đã có ví trước khi giao dịch (tạo ví NORMAL nếu chưa có)
  ensureWallet: async (type = 'NORMAL') => {
    const existing = await walletApi.getMyWallet();
    if (existing) return existing;
    return await walletApi.createWallet(type);
  },

  // GET /wallets/:id
  getWallet: async (id) => {
    return await request(`/wallets/${id}`);
  },

  // POST /wallet/deposits
  createDeposit: async (amount) => {
    return await request('/wallet/deposits', {
      method: 'POST',
      body: JSON.stringify({ amount: Number(amount) }),
    });
  },

  // POST /wallet/deposits/:referenceCode/confirm
  confirmDeposit: async (referenceCode) => {
    return await request(`/wallet/deposits/${referenceCode}/confirm`, {
      method: 'POST',
    });
  },
};

/* ==================== 12. MOCK PAYMENT GATEWAY ==================== */
export const mockPaymentApi = {
  // POST /mock-payments/:referenceCode/success
  simulateSuccess: async (referenceCode) => {
    return await request(`/mock-payments/${referenceCode}/success`, {
      method: 'POST',
    });
  },

  // POST /mock-payments/:referenceCode/failure
  simulateFailure: async (referenceCode) => {
    return await request(`/mock-payments/${referenceCode}/failure`, {
      method: 'POST',
    });
  },
};

/* ==================== 13. PAYMENT (ESCROW HOLD) ==================== */
export const paymentApi = {
  // POST /enrollment-payments/:enrollmentId/payment
  payForEnrollment: async (enrollmentId) => {
    return await request(`/enrollment-payments/${enrollmentId}/payment`, {
      method: 'POST',
    });
  },

  // POST /booking-payments/:bookingId/payment
  payForBooking: async (bookingId) => {
    return await request(`/booking-payments/${bookingId}/payment`, {
      method: 'POST',
    });
  },
};

/* ==================== 14. TUTOR APPLICATION API ==================== */
export const tutorApplicationApi = {
  // POST /tutor-applications (Nộp đơn ứng tuyển gia sư)
  createApplication: async (data) => {
    return await request('/tutor-applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET /tutor-applications (Lấy đơn ứng tuyển của tôi)
  getMyApplication: async () => {
    return await request('/tutor-applications');
  },

  // DELETE /tutor-applications (Hủy đơn ứng tuyển của tôi)
  deleteMyApplication: async () => {
    return await request('/tutor-applications', {
      method: 'DELETE',
    });
  },
};


/* ==================== 15. DISPUTE API (STUDENT) ==================== */
export const disputeApi = {
  // POST /disputes (Tạo khiếu nại mới)
  createDispute: async (data) => {
    return await request('/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET /disputes/me (Danh sách khiếu nại của học sinh hiện tại - Page<DisputeResponse>)
  getMyDisputes: async (page = 0, size = 100) => {
    const res = await request(withPagination('/disputes/me', page, size));
    return extractPageContent(res);
  },

  // GET /disputes/:id (Xem chi tiết khiếu nại)
  getMyDispute: async (id) => {
    return await request(`/disputes/${id}`);
  },

  // PATCH /disputes/:id/cancel (Hủy khiếu nại)
  cancelDispute: async (id) => {
    return await request(`/disputes/${id}/cancel`, {
      method: 'PATCH',
    });
  },
};
