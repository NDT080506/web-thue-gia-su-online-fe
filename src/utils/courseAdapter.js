/**
 * Chuẩn hóa các trường khóa học có trong phản hồi từ Backend.
 */
export const COURSE_PLACEHOLDER_IMAGE = '/course-placeholder.svg';

export function formatCourseFromBackend(course) {
  if (!course) return null;

  return {
    ...course,
    instructor: course.tutorName || course.instructor || course.tutor?.displayName || '',
    instructorRole: course.instructorRole || course.tutor?.title || '',
    instructorAvatar: course.instructorAvatar || course.tutorAvatar || course.tutor?.avatarUrl || '',
    rating: course.rating != null ? Number(course.rating) : null,
    ratingCount: course.ratingCount ?? course.reviewCount ?? null,
    price: course.price != null ? Number(course.price) : null,
    originalPrice: course.originalPrice ?? null,
    thumbnail: course.thumbnail || course.thumbnailUrl || COURSE_PLACEHOLDER_IMAGE,
    category: course.category || '',
    level: course.level || '',
    hours: course.hours || '',
    lessons: course.lessons ?? course.lessonCount ?? null,
    updatedDate: course.updatedDate || course.updatedAt || '',
    highlights: Array.isArray(course.highlights) ? course.highlights : [],
  };
}
