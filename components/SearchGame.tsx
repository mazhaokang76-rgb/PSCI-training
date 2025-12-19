import React, { useState, useEffect } from 'react';
import { LevelConfig } from '../types';
import { speak, playSound } from '../services/audioService';
import { Search, Eye, Star, ArrowRight } from 'lucide-react';

interface Props {
  levelConfig: LevelConfig;
  onBack: () => void;
  onFinish: (score: number, stars: number) => void;
}

const CHAR_PAIRS = [
  { target: '土', distractor: '士' },
  { target: '人', distractor: '入' },
  { target: '日', distractor: '曰' },
  { target: '未', distractor: '末' },
  { target: '大', distractor: '太' },
  { target: '甲', distractor: '由' },
  { target: '贝', distractor: '见' },
  { target: '右', distractor: '石' }
];

export const SearchGame: React.FC<Props> = ({ levelConfig, onBack, onFinish }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'feedback'>('intro');
  const [grid, setGrid] = useState<{id: number, char: string, isTarget: boolean, found: boolean}[]>([]);
  const [targetChar, setTargetChar] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (gameState === 'intro') {
      speak(`火眼金睛第${levelConfig.level}关`);
    }
  }, [gameState]);

  const startGame = () => {
    const gridSize = levelConfig.params?.gridSize || 12;
    const pair = CHAR_PAIRS[Math.floor(Math.random() * CHAR_PAIRS.length)];
    setTargetChar(pair.target);

    const targetCount = 3 + Math.floor(Math.random() * 3);
    const newGrid = [];

    for (let i = 0; i < targetCount; i++) {
      newGrid.push({ id: i, char: pair.target, isTarget: true, found: false });
    }
    for (let i = targetCount; i < gridSize; i++) {
      newGrid.push({ id: i, char: pair.distractor, isTarget: false, found: false });
    }

    for (let i = newGrid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newGrid[i], newGrid[j]] = [newGrid[j], newGrid[i]];
    }

    setGrid(newGrid);
    setScore(0);
    setTimeLeft(30);
    setGameState('playing');
    playSound('click');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const handleTileClick = (index: number) => {
    const item = grid[index];
    if (item.found) return;

    if (item.isTarget) {
      playSound('success');
      const newGrid = [...grid];
      newGrid[index].found = true;
      setGrid(newGrid);
      setScore(s => s + 10);

      if (newGrid.filter(i => i.isTarget && !i.found).length === 0) {
        speak("找到了！");
        setTimeout(startGame, 500);
      }
    } else {
      playSound('error');
      setScore(s => Math.max(0, s - 2));
    }
  };

  const endGame = () => {
    setGameState('feedback');
    const stars = score >= 80 ? 3 : score >= 40 ? 2 : 1;
    setMessage(stars >= 2 ? "观察力真好！" : "继续加油！");
    if (stars >= 2) speak("真厉害");
  };

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 animate-fade-in bg-gradient-to-br from-orange-50 to-amber-100">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border-4 border-white">
          <div className="bg-orange-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-16 h-16 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">火眼金睛</h2>
           <div className="inline-block bg-orange-100 text-orange-800 px-4 py-1 rounded-full text-lg font-bold mb-4">
            第 {levelConfig.level} 关
          </div>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">在相似的字中<br/>找出指定的目标字</p>
          
          <button 
            onClick={startGame}
            className="mt-8 w-full bg-orange-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center font-bold"
          >
             <ArrowRight className="mr-2 w-8 h-8" /> 开始
          </button>
        </div>
        <button onClick={onBack} className="text-slate-500 text-lg underline">返回</button>
      </div>
    );
  }

  if (gameState === 'feedback') {
    const stars = score >= 80 ? 3 : score >= 40 ? 2 : 1;
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in bg-orange-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-orange-100 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-orange-500"></div>
           
           <div className="flex justify-center gap-2 mb-6 mt-4">
            {[1, 2, 3].map(i => (
              <Star key={i} className={`w-14 h-14 ${i <= stars ? 'text-yellow-400 fill-yellow-400 drop-shadow-md' : 'text-slate-200'} transition-all`} />
            ))}
          </div>

          <h3 className="text-4xl font-bold mb-4 text-slate-800">时间到!</h3>
          <p className="text-5xl font-bold text-orange-600 mb-4">{score} 分</p>
          <p className="text-xl text-slate-600 mb-8 font-medium">{message}</p>
          <button 
            onClick={() => onFinish(score, stars)}
            className="w-full bg-orange-600 text-white text-2xl py-4 rounded-2xl shadow hover:bg-orange-700 font-bold active:scale-95 transition-all"
          >
            完成
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-orange-50 p-4">
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
        <div className="flex items-center">
           <span className="text-slate-500 mr-3 text-2xl font-medium">请找出:</span>
           <span className="text-5xl font-bold text-orange-600 border-2 border-orange-200 px-6 py-2 rounded-xl bg-orange-50">{targetChar}</span>
        </div>
        <div className="text-right">
            <div className="text-3xl font-bold text-slate-800 font-mono mb-1">{timeLeft}s</div>
            <div className="text-lg text-slate-500 font-medium">得分: {score}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto content-center">
        <div className={`grid gap-4 ${
            (levelConfig.params?.gridSize || 12) <= 12 ? 'grid-cols-3' : 
            (levelConfig.params?.gridSize || 12) <= 20 ? 'grid-cols-4' : 'grid-cols-5'
          }`}>
          {grid.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              disabled={item.found}
              className={`aspect-square flex items-center justify-center rounded-2xl font-bold transition-all duration-200 shadow-sm
                ${item.found 
                  ? 'bg-green-500 text-white scale-90 opacity-50 shadow-inner' 
                  : 'bg-white text-slate-800 hover:bg-orange-100 active:scale-95 border-b-4 border-slate-200 active:border-b-0 active:translate-y-1'}
                ${(levelConfig.params?.gridSize || 12) <= 12 ? 'text-6xl' : 'text-4xl'}
              `}
            >
              {item.found ? <Search className="w-10 h-10" /> : item.char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
