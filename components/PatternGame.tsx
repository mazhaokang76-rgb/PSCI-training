import React, { useState, useEffect } from 'react';
import { LevelConfig } from '../types';
import { generateEncouragement } from '../services/geminiService';
import { speak, playSound } from '../services/audioService';
import { Star, HelpCircle, ArrowRight, Play, Clock, Puzzle } from 'lucide-react';

interface Props {
  levelConfig: LevelConfig;
  onBack: () => void;
  onFinish: (score: number, stars: number, action: 'next' | 'quit') => void;
}

interface PatternQuestion {
  sequence: string[];
  options: string[];
  answer: string;
}

export const PatternGame: React.FC<Props> = ({ levelConfig, onBack, onFinish }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'feedback'>('intro');
  const [currentQ, setCurrentQ] = useState<PatternQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [message, setMessage] = useState("");
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    if (gameState === 'intro') {
      speak(`找规律第${levelConfig.level}关。在60秒内，猜猜下一个是什么。`);
    }
  }, [gameState, levelConfig.level]);

  const generateQuestion = (): PatternQuestion => {
    const type = Math.floor(Math.random() * 4);
    
    // Type 0: ABAB Pattern
    if (type === 0) {
      const sets = [
        ['🔴', '🔵'], ['🐶', '🐱'], ['☀️', '🌙'], ['⬆️', '⬇️'], ['🅰️', '🅱️']
      ];
      const set = sets[Math.floor(Math.random() * sets.length)];
      const seq = [set[0], set[1], set[0], set[1], set[0]];
      return {
        sequence: seq,
        options: [set[0], set[1], '❓'].sort(() => Math.random() - 0.5),
        answer: set[1]
      };
    }
    
    // Type 1: AABB Pattern
    if (type === 1) {
      const sets = [
        ['🍎', '🍐'], ['🚗', '🚕'], ['◼️', '◻️']
      ];
      const set = sets[Math.floor(Math.random() * sets.length)];
      const seq = [set[0], set[0], set[1], set[1], set[0]];
      return {
        sequence: seq,
        options: [set[0], set[1], '❓'].sort(() => Math.random() - 0.5),
        answer: set[0]
      };
    }

    // Type 2: Number Sequence (+1, +2, +5, +10)
    if (type === 2) {
      const start = Math.floor(Math.random() * 10) + 1;
      const step = [1, 2, 5, 10][Math.floor(Math.random() * 4)];
      const seq = [0, 1, 2, 3].map(i => (start + i * step).toString());
      const next = (start + 4 * step).toString();
      const wrong1 = (start + 4 * step + step).toString();
      const wrong2 = (start + 4 * step - step).toString();
      return {
        sequence: seq,
        options: [next, wrong1, wrong2].sort(() => Math.random() - 0.5),
        answer: next
      };
    }

    // Type 3: Clock (Hours)
    const startHour = Math.floor(Math.random() * 8) + 1;
    const clocks = ['🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛'];
    const seq = [clocks[startHour-1], clocks[startHour], clocks[startHour+1]];
    return {
      sequence: seq,
      options: [clocks[startHour+2], clocks[startHour+3] || clocks[0], clocks[startHour-2] || clocks[11]].sort(() => Math.random() - 0.5),
      answer: clocks[startHour+2]
    };
  };

  const startGame = () => {
    setScore(0);
    setQuestionCount(0);
    setTimeLeft(60); // Unified 60s duration
    setCurrentQ(generateQuestion());
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

  const handleAnswer = (option: string) => {
    if (!currentQ) return;
    
    if (option === currentQ.answer) {
      playSound('success');
      setScore(s => s + 10);
      setQuestionCount(c => c + 1);
    } else {
      playSound('error');
    }
    
    // Generate next question immediately
    setCurrentQ(generateQuestion());
  };

  const endGame = async () => {
    setGameState('feedback');
    const msg = await generateEncouragement(score, "找规律");
    setMessage(msg);
    
    // Normalized stars: >80 (8 correct) is 3 stars
    const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
    if (stars >= 2) speak(`时间到！你真聪明，答对了${questionCount}题。`);
    else speak(`时间到！继续加油。`);
  };

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-gradient-to-br from-violet-50 to-fuchsia-100">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border-4 border-white">
          <div className="bg-violet-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
            <Puzzle className="w-16 h-16 text-violet-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-6">找规律</h2>
          <div className="inline-block bg-violet-100 text-violet-800 px-4 py-1 rounded-full text-lg font-bold mb-6">
            第 {levelConfig.level} 关
          </div>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            限时60秒。<br/>
            观察排列，猜猜下一个是什么？
          </p>
          
          <button 
            onClick={startGame}
            className="w-full bg-violet-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-violet-700 font-bold flex items-center justify-center"
          >
             <Play className="mr-2 w-8 h-8" /> 开始挑战
          </button>
        </div>
        <button onClick={onBack} className="text-slate-500 text-lg underline mt-8">返回</button>
      </div>
    );
  }

  if (gameState === 'feedback') {
    const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-violet-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-violet-100 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-violet-500"></div>
           <div className="flex justify-center gap-2 mb-6 mt-4">
            {[1, 2, 3].map(i => (
              <Star key={i} className={`w-14 h-14 ${i <= stars ? 'text-yellow-400 fill-yellow-400 drop-shadow-md' : 'text-slate-200'} transition-all`} />
            ))}
          </div>
          <h3 className="text-4xl font-bold mb-4 text-slate-800">时间到!</h3>
          <p className="text-5xl font-bold text-violet-600 mb-4">{score} 分</p>
          <p className="text-xl text-slate-600 mb-8 font-medium">{message}</p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => onFinish(score, stars, 'next')}
              className="bg-violet-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-violet-700 w-full font-bold active:scale-95 transition-all"
            >
              {stars >= 2 ? "下一关" : "完成"}
            </button>
            <button onClick={() => onFinish(score, stars, 'quit')} className="text-slate-400 py-2 text-lg">退出</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-violet-50 p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
           <Clock className="w-8 h-8 text-violet-700" />
           <span className="text-3xl font-bold text-violet-900">{timeLeft}s</span>
        </div>
        <div className="text-violet-800 font-bold bg-white px-6 py-2 rounded-full border border-violet-100 text-xl">得分: {score}</div>
      </div>

      <div className="flex-1 flex flex-col justify-center animate-fade-in">
        {currentQ && (
          <>
            {/* Sequence Display */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-violet-100 mb-8 flex flex-wrap justify-center items-center gap-4 min-h-[160px]">
              {currentQ.sequence.map((item, i) => (
                 <div key={i} className="text-6xl md:text-7xl drop-shadow-sm">{item}</div>
              ))}
              <div className="w-20 h-20 md:w-24 md:h-24 bg-violet-100 rounded-xl flex items-center justify-center border-4 border-violet-300 border-dashed animate-pulse">
                <HelpCircle className="w-10 h-10 text-violet-400" />
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-3 gap-6">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="bg-white hover:bg-violet-100 border-4 border-white hover:border-violet-300 rounded-2xl py-8 shadow-md active:scale-95 transition-all flex items-center justify-center"
                >
                  <span className="text-6xl md:text-7xl">{opt}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};