import { Card } from '../types';

// Các mức đánh giá
export enum Rating {
  KNOWN = 1,  // Đã biết (Dễ)
  MEDIUM = 2, // Trung bình
  HARD = 3    // Khó
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const calculateReview = (card: Card, rating: Rating): Card => {
  const now = Date.now();
  
  // Lấy giá trị hiện tại
  let interval = card.interval || 0;
  let easeFactor = card.easeFactor || 2.5;

  // Logic SRS cập nhật theo yêu cầu
  if (rating === Rating.HARD) {
    // Khó: Lặp lại hàng ngày (Interval = 1)
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (rating === Rating.MEDIUM) {
    // Trung bình: Lặp lại ít (Interval = 2 ngày)
    interval = 2;
    easeFactor = easeFactor; // Giữ nguyên độ khó
  } else if (rating === Rating.KNOWN) {
    // Đã biết: Đẩy lùi lịch ôn rất xa (Interval >= 10 ngày)
    if (interval < 10) {
        interval = 10; // Nhảy cóc lên 10 ngày nếu đang ở mức thấp
    } else {
        interval = Math.round(interval * 2.5); // Tăng nhanh
    }
    easeFactor = easeFactor + 0.15;
  }

  return {
    ...card,
    interval,
    easeFactor,
    nextReview: now + (interval * DAY_IN_MS)
  };
};

export const getDueCards = (cards: Card[]): Card[] => {
  const now = Date.now();
  return cards.filter(card => {
    // Thẻ mới (chưa có nextReview) hoặc thẻ đã đến hạn
    return !card.nextReview || card.nextReview <= now;
  });
};

// Hàm helper để phân loại level thẻ cho Dashboard
export const getCardLevel = (card: Card): 'new' | 'hard' | 'medium' | 'mastered' => {
    if (!card.interval || card.interval === 0) return 'new';
    if (card.interval === 1) return 'hard';
    if (card.interval > 1 && card.interval < 10) return 'medium'; // Updated range
    return 'mastered';
};