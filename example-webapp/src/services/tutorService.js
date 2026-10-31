const APPLICATIONS_KEY = "hoc-cung-tutor-applications";

export const sampleTutors = [
  {
    id: "1",
    name: "Nguyễn Minh Anh",
    initials: "MA",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=85",
    subject: "Toán",
    experience: "8 năm kinh nghiệm",
    rating: "4.98",
    reviews: 126,
    lessons: 840,
    location: "Cầu Giấy, Hà Nội",
    price: 250000,
    badge: "Gia sư nổi bật",
    intro: "Giúp em hiểu bản chất, tự tin chinh phục điểm 9+",
    schedule: "Tối nay · 19:30",
    color: "peach",
    education: "Cử nhân Sư phạm Toán",
  },
  {
    id: "2",
    name: "Trần Quốc Bảo",
    initials: "QB",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=85",
    subject: "Tiếng Anh",
    experience: "6 năm kinh nghiệm",
    rating: "4.96",
    reviews: 98,
    lessons: 612,
    location: "Đống Đa, Hà Nội",
    price: 220000,
    badge: "Phản hồi nhanh",
    intro: "Luyện giao tiếp và IELTS theo lộ trình riêng",
    schedule: "Ngày mai · 18:00",
    color: "blue",
    education: "Cử nhân Ngôn ngữ Anh",
  },
  {
    id: "3",
    name: "Lê Thu Hà",
    initials: "TH",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=85",
    subject: "Vật lý",
    experience: "5 năm kinh nghiệm",
    rating: "4.93",
    reviews: 74,
    lessons: 426,
    location: "Thanh Xuân, Hà Nội",
    price: 200000,
    badge: "Được yêu thích",
    intro: "Học Vật lý qua ví dụ thực tế, nhớ lâu và dễ áp dụng",
    schedule: "Tối nay · 20:00",
    color: "green",
    education: "Cử nhân Sư phạm Vật lý",
  },
  {
    id: "4",
    name: "Phạm Hoàng Nam",
    initials: "HN",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=85",
    subject: "Hóa học",
    experience: "7 năm kinh nghiệm",
    rating: "4.97",
    reviews: 111,
    lessons: 735,
    location: "Ba Đình, Hà Nội",
    price: 230000,
    badge: "Top gia sư",
    intro: "Ôn thi THPTQG có chiến lược, học đến đâu chắc đến đó",
    schedule: "Thứ 7 · 09:00",
    color: "lilac",
    education: "Cử nhân Hóa học",
  },
];

export function getTutorApplications() {
  const storedApplications = localStorage.getItem(APPLICATIONS_KEY);
  return storedApplications ? JSON.parse(storedApplications) : [];
}

function saveTutorApplications(applications) {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
}

export function submitTutorApplication(application) {
  const applications = getTutorApplications();
  const pendingApplication = {
    ...application,
    id: `application-${Date.now()}`,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  saveTutorApplications([...applications, pendingApplication]);
  return pendingApplication;
}

export function updateTutorApplicationStatus(applicationId, status) {
  const applications = getTutorApplications();
  const applicationExists = applications.some(
    (application) => application.id === applicationId
  );

  if (!applicationExists) {
    throw new Error("Không tìm thấy hồ sơ gia sư cần cập nhật.");
  }

  const updatedApplications = applications.map((application) =>
    application.id === applicationId
      ? { ...application, status }
      : application
  );
  saveTutorApplications(updatedApplications);
  return updatedApplications;
}

export function getPublicTutors() {
  const approvedApplications = getTutorApplications()
    .filter((application) => application.status === "approved")
    .map((application) => ({
      ...application,
      initials: application.name
        .split(/\s+/)
        .slice(-2)
        .map((part) => part[0])
        .join("")
        .toLocaleUpperCase("vi"),
      rating: "Mới",
      reviews: 0,
      lessons: 0,
      badge: "Gia sư mới",
      schedule: "Linh hoạt",
      color: "peach",
    }));

  return [...sampleTutors, ...approvedApplications];
}

export function getPublicTutorById(id) {
  return getPublicTutors().find((tutor) => String(tutor.id) === id) || null;
}

export function getApplicationByUserId(userId) {
  return (
    getTutorApplications().find(
      (application) => application.userId === userId
    ) || null
  );
}