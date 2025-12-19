import React, { useState, useEffect } from 'react';
import { LevelConfig } from '../types';
import { speak, playSound } from '../services/audioService';
import { Palette, Star, Play } from 'lucide-react';

interface Props {
  levelConfig: LevelConfig;
  onBack: () => void;
  onFinish: (score: number, stars: number) => void;
}

interface ColorOption {
  label: string;
  colorCode: string;
  value: string;
}

const COLORS: ColorOption[] = [
  { label: '红', colorCode: 'text-red-600', value: 'red' },
  { label: '蓝', colorCode: 'text-blue-600', value: 'blue' },
  { label: '绿', colorCode: 'text-green-600', value: 'green' },
  { label: '黄', colorCode: 'text-yellow-500', value: 'yellow' },
  { label: '黑', colorCode: 'text-slate-900', value: 'black' },
];

export const ColorMatchGame: React.FC<Props> = ({ levelConfig, onBack, onFinish }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'feedback'>('intro');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState<ColorOption>(COLORS[0]);
  const [inkColor, setInkColor] = useState<ColorOption>(COLORS[0]);
  const [options, setOptions] = useState<ColorOption[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (gameState === 'intro') {
      const mode = levelConfig.level === 1 ? "意思" : "颜色";
      speak(`颜色大作战第${levelConfig.level}关。请点击文字的${mode}`);
    }
  }, [gameState, levelConfig.level]);

  const generateTurn = () => {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    let ink = word;
    
    if (levelConfig.level > 1) {
       if (Math.random() > 0.3) {
         const others = COLORS.filter(c => c.value !== word.value);
         ink = others[Math.floor(Math.random() * others.length)];
       }
    }

    setCurrentWord(word);
    setInkColor(ink);

    const target = levelConfig.level === 1 ? word : ink;
    const distractor = COLORS.filter(c => c.value !== target.value)[Math.floor(Math.random() * (COLORS.length - 1))];
    const opts = [target, distractor].sort(() => Math.random() - 0.5);
    setOptions(opts);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(levelConfig.params?.duration || 45);
    setGameState('playing');
    playSound('click');
    generateTurn();
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

  const handleAnswer = (selected: ColorOption) => {
    const target = levelConfig.level === 1 ? currentWord : inkColor;
    if (selected.value === target.value) {
      playSound('success');
      setScore(s => s + 10);
    } else {
      playSound('error');
    }
    generateTurn();
  };

  const endGame = () => {
    setGameState('feedback');
    const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
    setMessage(stars >= 2 ? "反应很快！" : "继续加油！");
    if (stars >= 2) speak(`获得${stars}颗星`);
  };

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 animate-fade-in bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border-4 border-white">
          <div className="bg-pink-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
            <Palette className="w-16 h-16 text-pink-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">颜色大作战</h2>
          <div className="inline-block bg-pink-100 text-pink-800 px-4 py-1 rounded-full text-lg font-bold mb-4">
            第 {levelConfig.level} 关
          </div>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            {levelConfig.level === 1 ? "看文字：点击与文字意思相同的颜色按钮" : "看颜色：忽略文字意思，点击文字的颜色"}
          </p>
          
          <button 
            onClick={startGame}
            className="mt-8 w-full bg-pink-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-pink-700 transition-all active:scale-95 flex items-center justify-center font-bold"
          >
             <Play className="mr-2 w-8 h-8" /> 开始
          </button>
        </div>
        <button onClick={onBack} className="text-slate-500 text-lg underline">返回</button>
      </div>
    );
  }

  if (gameState === 'feedback') {
    const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in bg-pink-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-pink-100 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-pink-500"></div>
           <div className="flex justify-center gap-2 mb-6 mt-4">
            {[1, 2, 3].map(i => (
              <Star key={i} className={`w-14 h-14 ${i <= stars ? 'text-yellow-400 fill-yellow-400 drop-shadow-md' : 'text-slate-200'} transition-all`} />
            ))}
          </div>
          <h3 className="text-4xl font-bold mb-4 text-slate-800">时间到!</h3>
          <p className="text-5xl font-bold text-pink-600 mb-4">{score} 分</p>
          <p className="text-xl text-slate-600 mb-8 font-medium">{message}</p>
          <button 
            onClick={() => onFinish(score, stars)}
            className="w-full bg-pink-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-pink-700 font-bold active:scale-95 transition-all"
          >
            完成
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-pink-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-pink-900">
           {levelConfig.level === 1 ? "点意思是啥" : "点颜色是啥"}
        </h3>
        <div className="flex gap-4">
          <div className="text-pink-800 font-bold bg-white px-4 py-2 rounded-xl border border-pink-100 text-xl">时间: {timeLeft}s</div>
          <div className="text-pink-800 font-bold bg-white px-4 py-2 rounded-xl border border-pink-100 text-xl">得分: {score}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center mb-8">
        <div className="bg-white p-16 rounded-[3rem] shadow-xl border-8 border-white mb-12 w-full max-w-md flex items-center justify-center min-h-[300px]">
          <span className={`text-[8rem] font-bold ${inkColor.colorCode}`}>
            {currentWord.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8 w-full max-w-md">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(opt)}
              className="h-32 rounded-3xl shadow-lg border-4 border-white active:scale-95 transition-all flex items-center justify-center"
              style={{ 
                backgroundColor: opt.value === 'black' ? '#1e293b' : 
                                opt.value === 'red' ? '#ef4444' : 
                                opt.value === 'blue' ? '#3b82f6' : 
                                opt.value === 'green' ? '#22c55e' : '#eab308' 
              }}
            >
              <span className="text-white text-4xl font-bold drop-shadow-md">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
