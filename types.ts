
export interface Card {
  id: string;
  front: string;          // Trường 1
  backPrimary: string;    // Trường 2
  backSecondary: string;  // Trường 3
  
  // SRS Fields
  nextReview?: number;    // Timestamp cho lần ôn tiếp theo
  interval?: number;      // Khoảng cách ngày giữa các lần ôn
  easeFactor?: number;    // Hệ số độ khó (mặc định 2.5)
}

export interface DeckFieldNames {
  front: string;
  backPrimary: string;
  backSecondary: string;
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  createdAt: number;
  fieldNames?: DeckFieldNames; // Tên tùy chỉnh cho các trường
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  EDITOR = 'EDITOR',
  STUDY = 'STUDY',
}

export type ThemeColor = 'indigo' | 'blue' | 'emerald' | 'rose' | 'violet' | 'cyan' | 'orange' | 'slate';