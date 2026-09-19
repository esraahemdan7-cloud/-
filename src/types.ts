export type GameMode = 'vs-cpu' | 'local';

export interface Player {
  id: number;
  name: string;
  color: string;
  position: number; // 0 (dock) to 20
  trophies: number;
  earnedSquares: number[]; // squares where this player has earned trophies
  isCpu: boolean;
}

export interface QuestionRecord {
  q: string;
  a: string;
}

export interface BoardSquare {
  number: number;
  row: number;
  col: number;
}

export interface BannerEvent {
  type: 'ladder' | 'snake' | 'overshoot';
  player: string;
  from?: number;
  to?: number;
  message: string;
}

export interface WinnerInfo {
  player: Player;
  reason: string;
}

export const PLAYER_COLORS = [
  '#ff5d66', // coral
  '#1878ee', // blue
  '#18a75b', // green
  '#8a4de1', // purple
  '#ef8b20', // orange
];

export const LADDERS: Record<number, number> = {
  2: 9,
  7: 14,
  12: 19,
};

export const SNAKES: Record<number, number> = {
  11: 10,
  13: 8,
  15: 6,
};

export const DEFAULT_QUESTIONS: QuestionRecord[] = [
  { q: 'ما هو ناتج 6 × 7 ؟', a: '42' },
  { q: 'ما هي عاصمة جمهورية مصر العربية؟', a: 'القاهرة' },
  { q: 'كم عدد أيام الأسبوع؟', a: '7' },
  { q: 'ما هي عاصمة المملكة العربية السعودية؟', a: 'الرياض' },
  { q: 'ما هو أكبر كوكب في المجموعة الشمسية؟', a: 'المشتري' },
  { q: 'How many months are in a year?', a: '12' },
  { q: 'ما هو الحيوان الملقب بسفينة الصحراء؟', a: 'الجمل' },
  { q: 'ما هو ناتج جمع 125 + 75 ؟', a: '200' },
  { q: 'What is the opposite of cold?', a: 'hot' },
  { q: 'كم ضلعاً للمربع؟', a: '4' },
  { q: 'ما هو العضو المسؤول عن ضخ الدم في جسم الإنسان؟', a: 'القلب' },
  { q: 'ما هو أطول أنهار العالم؟', a: 'النيل' },
  { q: 'What is 9 × 9 ?', a: '81' },
  { q: 'ما هو الغاز الضروري لتنفس الكائنات الحية؟', a: 'الأكسجين' },
  { q: 'كم ثانية في الدقيقة الواحدة؟', a: '60' },
  { q: 'ما هي وحدة قياس الكتلة في النظام الدولي؟', a: 'الكيلوجرام' },
  { q: 'كم عدد أضلاع المثلث؟', a: '3' },
  { q: 'ما هو ناتج 100 ÷ 4 ؟', a: '25' },
  { q: 'ما هو الكوكب الذي نعيش عليه؟', a: 'الأرض' },
  { q: 'ما هو لون علم المملكة العربية السعودية؟', a: 'أخضر' },
];
