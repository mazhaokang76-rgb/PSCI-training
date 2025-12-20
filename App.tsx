import React, { useState } from 'react';
import { GameMode, GameScore, GameCategory, LevelConfig, Difficulty } from './types';
import { MarketGame } from './components/MarketGame';
import { MemoryGame } from './components/MemoryGame';
import { TaiChiGame } from './components/TaiChiGame';
import { MathGame } from './components/MathGame';
import { SearchGame } from './components/SearchGame';
import { SortingGame } from './components/SortingGame';
import { PatternGame } from './components/PatternGame';
import { ColorMatchGame } from './components/ColorMatchGame';
import { Dashboard } from './components/Dashboard';
import { Brain, ShoppingBasket, Grid, Hand, BarChart3, Calculator, Eye, Lock, Star, PlayCircle, ArrowLeft, Layers, Puzzle, Palette, Activity, ChevronRight } from 'lucide-react';
import { speak, playSound } from './services/audioService';

// --- Configuration Data ---

interface CategoryDef {
  id: GameCategory;
  name: string;
  subTitle: string;
  englishTitle: string;
  icon: React.ReactNode;
  themeColor: string;
  gameMode: GameMode;
  levels: LevelConfig[];
}

const CATEGORIES: CategoryDef[] = [
  {
    id: GameCategory.SPEED,
    name: "反应训练",
    subTitle: "Reaction & Motor",
    englishTitle: "Reaction Time",
    icon: <Hand className="w-6 h-6" />,
    themeColor: "amber",
    gameMode: GameMode.REACTION,
    levels: [
      { level: 1, difficulty: Difficulty.EASY, params: { baseSpeed: 0.2, spawnRate: 2000, duration: 30 }, targetScore: 80 },
      { level: 2, difficulty: Difficulty.MEDIUM, params: { baseSpeed: 0.4, spawnRate: 1500, duration: 45 }, targetScore: 80 },
      { level: 3, difficulty: Difficulty.HARD, params: { baseSpeed: 0.6, spawnRate: 1000, duration: 60 }, targetScore: 80 }
    ]
  },
  {
    id: GameCategory.PERCEPTION,
    name: "视觉搜索",
    subTitle: "Visual Attention",
    englishTitle: "Visual Search",
    icon: <Eye className="w-6 h-6" />,
    themeColor: "orange",
    gameMode: GameMode.SEARCH,
    levels: [
      { level: 1, difficulty: Difficulty.EASY, params: { gridSize: 12 }, targetScore: 80 },
      { level: 2, difficulty: Difficulty.MEDIUM, params: { gridSize: 20 }, targetScore: 80 },
      { level: 3, difficulty: Difficulty.HARD, params: { gridSize: 30 }, targetScore: 80 }
    ]
  },
  {
    id: GameCategory.WORK_MEMORY,
    name: "工作记忆",
    subTitle: "Working Memory",
    englishTitle: "Memory Match",
    icon: <Grid className="w-6 h-6" />,
    themeColor: "rose",
    gameMode: GameMode.MEMORY,
    levels: [
      { level: 1, difficulty: Difficulty.EASY, params: { pairCount: 4 }, targetScore: 80 },
      { level: 2, difficulty: Difficulty.MEDIUM, params: { pairCount: 6 }, targetScore: 80 },
      { level: 3, difficulty: Difficulty.HARD, params: { pairCount: 8 }, targetScore: 80 }
    ]
  },
  {
    id: GameCategory.LONG_MEMORY,
    name: "长时记忆",
    subTitle: "Long-term Memory",
    englishTitle: "Shopping Recall",
    icon: <ShoppingBasket className="w-6 h-6" />,
    themeColor: "emerald",
    gameMode: GameMode.MARKET,
    levels: [
      { level: 1, difficulty: Difficulty.EASY, params: {}, targetScore: 80 },
      { level: 2, difficulty: Difficulty.MEDIUM, params: {}, targetScore: 80 },
      { level: 3, difficulty: Difficulty.HARD, params: {}, targetScore: 80 }
    ]
  },
  {
    id: GameCategory.CALCULATION,
    name: "计算能力",
    subTitle: "Calculation",
    englishTitle: "Math Tasks",
    icon: <Calculator className="w-6 h-6" />,
    themeColor: "indigo",
    gameMode: GameMode.MATH,
    levels: [
      { level: 1, difficulty: Difficulty.EASY, params: {}, targetScore: 80 },
      { level: 2, difficulty: Difficulty.MEDIUM, params: {}, targetScore: 80 },
      { level: 3, difficulty: Difficulty.HARD, params: {}, targetScore: 80 }
    ]
  },
  {
    id: GameCategory.EXECUTION,
    name: "执行功能",
    subTitle: "Executive Function",
    englishTitle: "Sorting Task",
    icon: <Layers className="w-6 h-6" />,
    themeColor: "cyan",
    gameMode: GameMode.SORTING,
    levels: [
      { level: 1, difficulty: Difficulty.EASY, params: {}, targetScore: 80 },
      { level: 2, difficulty: Difficulty.MEDIUM, params: {}, targetScore: 80 },
      { level: 3, difficulty: Difficulty.HARD, params: {}, targetScore: 80 }
    ]
  },
  {
    id: GameCategory.REASONING,
    name: "逻辑推理",
    subTitle: "Logical Reasoning",
    englishTitle: "Pattern Finding",
    icon: <Puzzle className="w-6 h-6" />,
    themeColor: "violet",
    gameMode: GameMode.PATTERN,
    levels: [
      { level: 1, difficulty: Difficulty.EASY, params: {}, targetScore: 80 },
      { level: 2, difficulty: Difficulty.MEDIUM, params: {}, targetScore: 80 },
      { level: 3, difficulty: Difficulty.HARD, params: {}, targetScore: 80 }
    ]
  },
  {
    id: GameCategory.INHIBITION,
    name: "抑制能力",
    subTitle: "Inhibition Control",
    englishTitle: "Stroop Test",
    icon: <Palette className="w-6 h-6" />,
    themeColor: "pink",
    gameMode: GameMode.COLOR_MATCH,
    levels: [
      { level: 1, difficulty: Difficulty.EASY, params: { duration: 30 }, targetScore: 80 },
      { level: 2, difficulty: Difficulty.MEDIUM, params: { duration: 45 }, targetScore: 80 },
      { level: 3, difficulty: Difficulty.HARD, params: { duration: 60 }, targetScore: 80 }
    ]
  }
];

const getThemeClasses = (color: string) => {
  const map: Record<string, { bg: string, text: string, border: string, iconBg: string }> = {
    amber: { bg: 'hover:border-amber-400', text: 'text-amber-700', border: 'border-amber-200', iconBg: 'bg-amber-100 text-amber-600' },
    orange: { bg: 'hover:border-orange-400', text: 'text-orange-700', border: 'border-orange-200', iconBg: 'bg-orange-100 text-orange-600' },
    rose: { bg: 'hover:border-rose-400', text: 'text-rose-700', border: 'border-rose-200', iconBg: 'bg-rose-100 text-rose-600' },
    emerald: { bg: 'hover:border-emerald-400', text: 'text-emerald-700', border: 'border-emerald-200', iconBg: 'bg-emerald-100 text-emerald-600' },
    indigo: { bg: 'hover:border-indigo-400', text: 'text-indigo-700', border: 'border-indigo-200', iconBg: 'bg-indigo-100 text-indigo-600' },
    cyan: { bg: 'hover:border-cyan-400', text: 'text-cyan-700', border: 'border-cyan-200', iconBg: 'bg-cyan-100 text-cyan-600' },
    violet: { bg: 'hover:border-violet-400', text: 'text-violet-700', border: 'border-violet-200', iconBg: 'bg-violet-100 text-violet-600' },
    pink: { bg: 'hover:border-pink-400', text: 'text-pink-700', border: 'border-pink-200', iconBg: 'bg-pink-100 text-pink-600' },
  };
  return map[color] || map['indigo'];
};

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'HOME' | 'LEVEL_SELECT' | 'GAME' | 'REPORT'>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<CategoryDef | null>(null);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [scores, setScores] = useState<GameScore[]>([]);

  const getUnlockedLevel = (gameMode: GameMode) => {
    let maxLevel = 1;
    scores.forEach(s => {
       if (s.gameId.startsWith(gameMode) && s.stars >= 1) {
          const level = parseInt(s.gameId.split('-')[1]);
          if (level + 1 > maxLevel) maxLevel = level + 1;
       }
    });
    return maxLevel;
  };

  const handleGameFinish = (score: number, stars: number) => {
    if (selectedCategory && currentLevel) {
      const gameId = `${selectedCategory.gameMode}-${currentLevel.level}`;
      const newRecord: GameScore = {
        gameId,
        stars,
        score,
        date: new Date().toISOString(),
      };
      setScores(prev => [...prev, newRecord]);
      setViewState('LEVEL_SELECT');
    }
  };

  const renderContent = () => {
    if (viewState === 'GAME' && selectedCategory && currentLevel) {
       const props = {
         key: `${selectedCategory.gameMode}-${currentLevel.level}`,
         levelConfig: currentLevel,
         onBack: () => setViewState('LEVEL_SELECT'),
         onFinish: handleGameFinish
       };

       switch (selectedCategory.gameMode) {
         case GameMode.MARKET: return <MarketGame {...props} />;
         case GameMode.MEMORY: return <MemoryGame {...props} />;
         case GameMode.REACTION: return <TaiChiGame {...props} />;
         case GameMode.MATH: return <MathGame {...props} />;
         case GameMode.SEARCH: return <SearchGame {...props} />;
         case GameMode.SORTING: return <SortingGame {...props} />;
         case GameMode.PATTERN: return <PatternGame {...props} />;
         case GameMode.COLOR_MATCH: return <ColorMatchGame {...props} />;
         default: return <div>Error</div>;
       }
    }

    if (viewState === 'REPORT') {
      return <Dashboard scores={scores} onBack={() => setViewState('HOME')} />;
    }

    if (viewState === 'LEVEL_SELECT' && selectedCategory) {
      const unlockedLevel = getUnlockedLevel(selectedCategory.gameMode);
      const theme = getThemeClasses(selectedCategory.themeColor);

      return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
           <header className="px-8 py-6 flex items-center bg-white border-b border-slate-200 z-10">
             <button 
               onClick={() => setViewState('HOME')} 
               className="p-2 rounded-lg mr-4 hover:bg-slate-100 transition-colors"
             >
               <ArrowLeft className="w-6 h-6 text-slate-600" />
             </button>
             <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${theme.iconBg}`}>
                  {selectedCategory.icon}
                </div>
                <div>
                   <h2 className="text-xl font-bold text-slate-800 tracking-tight">{selectedCategory.name}</h2>
                   <p className="text-sm text-slate-500 font-medium">{selectedCategory.englishTitle}</p>
                </div>
             </div>
           </header>

           <div className="flex-1 p-8 flex items-center justify-center bg-slate-50/50">
             <div className="grid gap-6 grid-cols-1 md:grid-cols-3 w-full max-w-5xl">
               {selectedCategory.levels.map((lvl) => {
                 const isLocked = lvl.level > unlockedLevel;
                 const bestScore = scores
                   .filter(s => s.gameId === `${selectedCategory.gameMode}-${lvl.level}`)
                   .sort((a, b) => b.score - a.score)[0];
                 
                 return (
                   <button
                     key={lvl.level}
                     disabled={isLocked}
                     onClick={() => {
                       setCurrentLevel(lvl);
                       setViewState('GAME');
                       playSound('click');
                     }}
                     className={`rounded-xl border flex flex-col items-center justify-between p-8 transition-all relative h-64 group
                       ${isLocked 
                       ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' 
                       : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1'
                     }`}
                   >
                     <div className="w-full flex justify-between items-start">
                        <span className={`text-lg font-bold ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>Level {lvl.level}</span>
                        {isLocked ? <Lock className="w-5 h-5 text-slate-300" /> : <PlayCircle className="w-6 h-6 text-blue-600" />}
                     </div>

                     <div className={`text-4xl font-bold ${isLocked ? 'text-slate-300' : 'text-slate-800'}`}>
                        第 {lvl.level} 关
                     </div>
                     
                     <div className="w-full">
                       {bestScore ? (
                         <div className="flex justify-center gap-1">
                           {[1,2,3].map(i => (
                             <Star key={i} className={`w-5 h-5 ${i <= bestScore.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                           ))}
                         </div>
                       ) : (
                         <div className="text-center text-xs text-slate-400 font-medium uppercase tracking-wide">{isLocked ? "LOCKED" : "START"}</div>
                       )}
                     </div>
                   </button>
                 );
               })}
             </div>
           </div>
        </div>
      );
    }

    // HOME SCREEN
    return (
      <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
        <header className="px-8 py-5 bg-white border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">NeuroGuard PSCI</h1>
              <p className="text-xs text-slate-500 font-medium mt-1 tracking-wide">认知训练系统 | Powered by Grok AI</p>
            </div>
          </div>
          <button 
            onClick={() => setViewState('REPORT')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors group"
          >
            <BarChart3 className="w-5 h-5 text-slate-600 group-hover:text-slate-800" />
            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-800">评估报告</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              训练模块 / Training Modules
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CATEGORIES.map(cat => {
                 const theme = getThemeClasses(cat.themeColor);
                 return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setViewState('LEVEL_SELECT');
                      playSound('click');
                      speak(cat.name);
                    }}
                    className={`relative overflow-hidden bg-white rounded-xl border border-slate-200 p-6 text-left transition-all duration-200 hover:shadow-lg group ${theme.bg}`}
                  >
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg ${theme.iconBg} transition-colors`}>
                          {cat.icon}
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{cat.name}</h3>
                      <p className="text-sm text-slate-500 font-medium mb-1">{cat.englishTitle}</p>
                      <div className="h-1 w-12 bg-slate-100 mt-3 rounded-full overflow-hidden">
                        <div className={`h-full w-full ${theme.iconBg.split(' ')[0]} opacity-50`}></div>
                      </div>
                    </div>

                    <div className={`absolute -bottom-6 -right-6 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none ${theme.text}`}>
                       {React.cloneElement(cat.icon as React.ReactElement, { className: "w-32 h-32" })}
                    </div>
                  </button>
                 );
              })}
            </div>
          </div>
        </div>
        
        <footer className="px-8 py-4 bg-white border-t border-slate-200 text-center text-xs text-slate-400 font-medium">
          NeuroGuard PSCI v2.0 • 上海智缘益慷科技有限公司
        </footer>
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-slate-50 overflow-hidden font-sans select-none touch-pan-x touch-pan-y text-slate-900">
      {renderContent()}
    </div>
  );
};

export default App;
