import React, { useState, useEffect } from 'react';
import { LevelConfig, Difficulty } from '../types';
import { speak, playSound } from '../services/audioService';
import { Calculator, Delete, Check, Star, Play } from 'lucide-react';

interface Props {
  levelConfig: LevelConfig;
  onBack: () => void;
  onFinish: (score: number, stars: number) => void;
}

const generateMathProblem = (difficulty: Difficulty): { question: string; answer: number } => {
  if (difficulty === Difficulty.EASY) {
    const scenarios = [
      () => {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        return { question: `🍎 ${a}元 + 🍌 ${b}元 = ?`, answer: a + b };
      },
      () => {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        return { question: `🥬 ${a}元 + 🥕 ${b}元 = ?`, answer: a + b };
      },
      () => {
        const total = Math.floor(Math.random() * 8) + 3;
        const paid = total + Math.floor(Math.random() * 3) + 1;
        return { question: `买菜${total}元，付${paid}元，找零?`, answer: paid - total };
      }
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)]();
  }
  
  if (difficulty === Difficulty.MEDIUM) {
    const scenarios = [
      () => {
        const pricePerKg = Math.floor(Math.random() * 5) + 3;
        const kg = Math.floor(Math.random() * 3) + 2;
        return { question: `白菜${pricePerKg}元/斤，买${kg}斤 = ?`, answer: pricePerKg * kg };
      },
      () => {
        const a = Math.floor(Math.random() * 10) + 5;
        const b = Math.floor(Math.random() * 8) + 3;
        return { question: `🍅 ${a}元 - 🥔 ${b}元 = ?`, answer: a - b };
      },
      () => {
        const total = Math.floor(Math.random() * 20) + 10;
        const paid = total + Math.floor(Math.random() * 10) + 1;
        return { question: `买菜${total}元，付${paid}元，找?`, answer: paid - total };
      },
      () => {
        const item1 = Math.floor(Math.random() * 8) + 2;
        const item2 = Math.floor(Math.random() * 8) + 2;
        return { question: `鸡蛋${item1}元 + 牛奶${item2}元 = ?`, answer: item1 + item2 };
      }
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)]();
  }
  
  // HARD - 更复杂的菜场场景
  const scenarios = [
    () => {
      const pricePerKg = Math.floor(Math.random() * 6) + 4;
      const kg = Math.floor(Math.random() * 4) + 2;
      return { question: `猪肉${pricePerKg}元/斤，买${kg}斤 = ?`, answer: pricePerKg * kg };
    },
    () => {
      const a = Math.floor(Math.random() * 15) + 10;
      const b = Math.floor(Math.random() * 8) + 5;
      const c = Math.floor(Math.random() * 5) + 2;
      return { question: `🐟${a}元 + 🍗${b}元 - 🥚${c}元 = ?`, answer: a + b - c };
    },
    () => {
      const each = Math.floor(Math.random() * 5) + 3;
      const count = Math.floor(Math.random() * 3) + 3;
      return { question: `🍊 ${each}元/个，买${count}个 = ?`, answer: each * count };
    },
    () => {
      const total = Math.floor(Math.random() * 30) + 20;
      const paid = Math.ceil(total / 10) * 10;
      return { question: `共${total}元，付${paid}元，找?`, answer: paid - total };
    },
    () => {
      const item1 = Math.floor(Math.random() * 12) + 5;
      const item2 = Math.floor(Math.random() * 10) + 5;
      const item3 = Math.floor(Math.random() * 8) + 3;
      return { question: `菜${item1}元 + 肉${item2}元 + 蛋${item3}元 = ?`, answer: item1 + item2 + item3 };
    }
  ];
  return scenarios[Math.floor(Math.random() * scenarios.length)]();
};

export const MathGame: React.FC<Props> = ({ levelConfig, onBack, onFinish }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'feedback'>('intro');
  const [currentProblem, setCurrentProblem] = useState<{ question: string; answer: number } | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [message, setMessage] = useState("");

  const MAX_QUESTIONS = 10;

  useEffect(() => {
    if (gameState === 'intro') {
      speak(`菜场算账第${levelConfig.level}关。共${MAX_QUESTIONS}道题`);
    }
  }, [gameState, levelConfig.level]);

  const nextQuestion = () => {
    if (questionCount >= MAX_QUESTIONS) {
      finishGame();
      return;
    }

    const problem = generateMathProblem(levelConfig.difficulty);
    setCurrentProblem(problem);
    setUserAnswer("");
  };

  const startGame = () => {
    setScore(0);
    setQuestionCount(0);
    setGameState('playing');
    playSound('click');
    nextQuestion();
  };

  const handleInput = (num: number) => {
    playSound('click');
    if (userAnswer.length < 4) {
      setUserAnswer(prev => prev + num.toString());
    }
  };

  const handleDelete = () => {
    playSound('click');
    setUserAnswer(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (!currentProblem || userAnswer === "") return;
    
    const numAns = parseInt(userAnswer);
    if (numAns === currentProblem.answer) {
      setScore(s => s + 10);
      playSound('success');
    } else {
      playSound('error');
    }
    setQuestionCount(c => c + 1);
    nextQuestion();
  };

  const finishGame = () => {
    setGameState('feedback');
    const stars = score >= 80 ? 3 : score >= 60 ? 2 : 1;
    setMessage(stars >= 2 ? "计算能力很棒！" : "继续练习会更好！");
    if (stars >= 2) speak(`恭喜！获得${stars}颗星`);
  };

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 animate-fade-in bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border-4 border-white">
          <div className="bg-indigo-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-16 h-16 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">菜场算账</h2>
           <div className="inline-block bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full text-lg font-bold mb-4">
            第 {levelConfig.level} 关
          </div>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            共 {MAX_QUESTIONS} 题<br/>
            快速计算答案
          </p>
          
          <button 
            onClick={startGame}
            className="mt-8 w-full bg-indigo-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center font-bold"
          >
             <Play className="mr-2 w-8 h-8" /> 开始计算
          </button>
        </div>
        <button onClick={onBack} className="text-slate-500 text-lg underline">返回</button>
      </div>
    );
  }

  if (gameState === 'feedback') {
    const stars = score >= 80 ? 3 : score >= 60 ? 2 : 1;
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in bg-indigo-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-indigo-100 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-indigo-500"></div>
           
           <div className="flex justify-center gap-2 mb-6 mt-4">
            {[1, 2, 3].map(i => (
              <Star key={i} className={`w-14 h-14 ${i <= stars ? 'text-yellow-400 fill-yellow-400 drop-shadow-md' : 'text-slate-200'} transition-all`} />
            ))}
          </div>

          <h3 className="text-4xl font-bold mb-4 text-slate-800">完成!</h3>
          <p className="text-5xl font-bold text-indigo-600 mb-4">{score} 分</p>
          <p className="text-xl text-slate-600 mb-8 font-medium">{message}</p>
          <button 
            onClick={() => onFinish(score, stars)}
            className="w-full bg-indigo-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-indigo-700 font-bold active:scale-95 transition-all"
          >
            完成
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-indigo-50 p-2 sm:p-3">
      {/* 顶部信息栏 */}
      <div className="flex justify-between items-center mb-3 sm:mb-4 px-1">
        <h3 className="text-lg sm:text-xl font-bold text-indigo-900 whitespace-nowrap">
          第 {Math.min(questionCount + 1, MAX_QUESTIONS)} / {MAX_QUESTIONS} 题
        </h3>
        <div className="text-indigo-800 font-bold bg-white px-4 py-1 sm:px-5 sm:py-2 rounded-full border border-indigo-100 text-base sm:text-lg">
          得分: {score}
        </div>
      </div>

      {/* 题目区域 - 缩小高度 */}
      <div className="flex-1 flex flex-col items-center justify-start mb-3 sm:mb-4 pt-2">
        {currentProblem && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-indigo-100 w-full max-w-md min-h-[120px] sm:min-h-[140px] flex items-center justify-center text-center mx-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 leading-snug sm:leading-relaxed">
              {currentProblem.question}
            </h2>
          </div>
        )}
      </div>

      {/* 答案显示区域 - 缩小 */}
      <div className="w-full max-w-md mx-auto px-2 mb-3 sm:mb-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-inner flex justify-between items-center h-16 sm:h-20 border-4 border-indigo-100">
          <span className="text-4xl sm:text-5xl font-mono text-slate-800 ml-2 sm:ml-4 font-bold">
            {userAnswer || "0"}
          </span>
          <button 
            onClick={handleDelete} 
            className="p-2 sm:p-3 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Delete className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        </div>
      </div>

      {/* 数字键盘 - 缩小按钮 */}
      <div className="w-full max-w-md mx-auto px-2 flex-1 overflow-auto">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleInput(num)}
              className="bg-white text-slate-700 text-2xl sm:text-3xl font-bold py-3 sm:py-4 rounded-xl shadow-md border-b-3 border-slate-200 active:border-b-0 active:translate-y-1 transition-all hover:bg-indigo-50 min-h-[50px] sm:min-h-[60px]"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleInput(0)}
            className="bg-white text-slate-700 text-2xl sm:text-3xl font-bold py-3 sm:py-4 rounded-xl shadow-md border-b-3 border-slate-200 active:border-b-0 active:translate-y-1 transition-all hover:bg-indigo-50 col-span-2"
          >
            0
          </button>
          <button
            onClick={handleSubmit}
            disabled={userAnswer === ""}
            className="bg-indigo-600 text-white text-xl sm:text-2xl font-bold py-3 sm:py-4 rounded-xl shadow-md border-b-3 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed min-h-[50px] sm:min-h-[60px]"
          >
            <Check className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
