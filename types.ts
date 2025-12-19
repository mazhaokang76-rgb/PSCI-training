export enum GameMode {
  MENU = 'MENU',
  MARKET = 'MARKET',
  MEMORY = 'MEMORY',
  REACTION = 'REACTION',
  MATH = 'MATH',
  SEARCH = 'SEARCH',
  SORTING = 'SORTING',
  PATTERN = 'PATTERN',
  COLOR_MATCH = 'COLOR_MATCH',
  REPORT = 'REPORT'
}

export enum GameCategory {
  SPEED = '处理速度',
  ATTENTION = '注意力',
  PERCEPTION = '知觉',
  LONG_MEMORY = '长期记忆',
  WORK_MEMORY = '工作记忆',
  CALCULATION = '计算',
  EXECUTION = '执行功能',
  REASONING = '逻辑推理',
  INHIBITION = '抑制能力'
}

export interface LevelConfig {
  level: number;
  difficulty: 'easy' | 'medium' | 'hard';
  params: any; // Specific parameters for the game (e.g., grid size, time limit)
  targetScore: number; // Score needed to get 3 stars
}

export interface GameScore {
  gameId: string; // Composite ID: GameMode + Level
  stars: number; // 0-3
  score: number;
  date: string;
}

export interface MarketItem {
  id: string;
  name: string;
  isTarget: boolean;
  emoji: string;
}

export interface MemoryCard {
  id: string;
  content: string; // Emoji or Character
  isFlipped: boolean;
  isMatched: boolean;
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}