import React, { useState, useEffect } from 'react';
import { GameMode, Difficulty, MarketItem, LevelConfig } from '../types';
import { generateEncouragement } from '../services/geminiService';
import { speak, playSound } from '../services/audioService';
import { ShoppingBasket, CheckCircle, Loader2, Star, ArrowRight } from 'lucide-react';

interface Props {
  levelConfig: LevelConfig;
  onBack: () => void;
  onFinish: (score: number, stars: number, action: 'next' | 'quit') => void;
}

const MARKET_ITEMS = [
  { name: "苹果", emoji: "🍎" }, { name: "香蕉", emoji: "🍌" }, { name: "葡萄", emoji: "🍇" },
  { name: "西瓜", emoji: "🍉" }, { name: "橘子", emoji: "🍊" }, { name: "草莓", emoji: "🍓" },
  { name: "白菜", emoji: "🥬" }, { name: "胡萝卜", emoji: "🥕" }, { name: "土豆", emoji: "🥔" },
  { name: "番茄", emoji: "🍅" }, { name: "玉米", emoji: "🌽" }, { name: "西兰花", emoji: "🥦" },
  { name: "鱼", emoji: "🐟" }, { name: "鸡腿", emoji: "🍗" }, { name: "鸡蛋", emoji: "🥚" },
  { name: "牛奶", emoji: "🥛" }, { name: "面包", emoji: "🍞" }, { name: "面条", emoji: "🍜" },
  { name: "米饭", emoji: "🍚" }, { name: "蛋糕", emoji: "🍰" }, { name: "饼干", emoji: "🍪" },
  { name: "糖果", emoji: "🍬" }, { name: "酱油", emoji: "🍾" }, { name: "冰淇淋", emoji: "🍦" }
];

export const MarketGame: React.FC<Props> = ({ levelConfig, onBack, onFinish }) => {
  const [gameState, setGameState] = useState<'intro' | 'memorize' | 'playing' | 'feedback'>('intro');
  const [items, setItems] = useState<MarketItem[]>([]);
  const [targetList, setTargetList] = useState<string[]>([]);
  const [basket, setBasket] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameState === 'intro') {
      speak(`欢迎来到超市大采购，第${levelConfig.level}关。请记住购物清单。`);
    }
  }, [gameState, levelConfig.level]);

  const startGame = () => {
    setLoading(true);
    // Determine number of targets based on difficulty
    const count = levelConfig.difficulty === Difficulty.EASY ? 3 : levelConfig.difficulty === Difficulty.MEDIUM ? 5 : 7;
    
    // Shuffle and pick targets
    const shuffled = [...MARKET_ITEMS].sort(() => Math.random() - 0.5);
    const targets = shuffled.slice(0, count);
    const distractors = shuffled.slice(count, count + 8); // Always show 8 distractors

    setTargetList(targets.map(t => t.name));
    
    const gameItems = [...targets, ...distractors]
      .sort(() => Math.random() - 0.5)
      .map(item => ({
        id: Math.random().toString(36).substr(2, 9),
        name: item.name,
        emoji: item.emoji,
        isTarget: targets.some(t => t.name === item.name)
      }));

    setItems(gameItems);
    setBasket([]);
    setLoading(false);
    setGameState('memorize');
    speak("请记住这些商品，记好了请按蓝色按钮。");
  };

  const handleSelectItem = (item: MarketItem) => {
    if (gameState !== 'playing') return;
    
    playSound('click');
    if (basket.includes(item.name)) {
      setBasket(prev => prev.filter(i => i !== item.name));
    } else {
      setBasket(prev => [...prev, item.name]);
    }
  };

  const submitBasket = async () => {
    let correctCount = 0;
    let wrongCount = 0;

    basket.forEach(item => {
      if (targetList.includes(item)) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    // Scoring: 100 max. 
    // Points per target = 100 / totalTargets.
    // Penalty for wrong items = half of point per target.
    const pointPerTarget = 100 / targetList.length;
    let currentScore = (correctCount * pointPerTarget) - (wrongCount * (pointPerTarget / 2));
    
    // Clamp score
    currentScore = Math.max(0, Math.min(100, Math.round(currentScore)));
    
    setScore(currentScore);
    setLoading(true);
    
    // Standard thresholds
    const stars = currentScore >= 80 ? 3 : currentScore >= 60 ? 2 : 1;

    const feedback = await generateEncouragement(currentScore, "超市大采购");
    setMessage(feedback);
    
    if (stars >= 2) {
      playSound('success');
      speak(`太棒了！您获得了${stars}颗星。${feedback}`);
    } else {
      playSound('error');
      speak(`继续加油。${feedback}`);
    }

    setLoading(false);
    setGameState('feedback');
  };

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 animate-fade-in bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border-4 border-white">
          <div className="bg-emerald-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBasket className="w-16 h-16 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">超市大采购</h2>
          <div className="inline-block bg-emerald-100 text-emerald-800 px-4 py-1 rounded-full text-lg font-bold mb-4">
            第 {levelConfig.level} 关
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">请记住购物清单<br/>然后把商品放入篮子。</p>
          
          <button 
            onClick={startGame}
            disabled={loading}
            className="mt-8 w-full bg-emerald-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center font-bold"
          >
            {loading ? <Loader2 className="animate-spin w-8 h-8" /> : <><ArrowRight className="mr-2 w-8 h-8" /> 开始挑战</>}
          </button>
        </div>
        <button onClick={onBack} className="text-slate-500 text-lg underline">返回</button>
      </div>
    );
  }

  if (gameState === 'memorize') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center animate-fade-in bg-emerald-50">
        <h3 className="text-3xl font-bold mb-8 text-slate-700">请记住要买的东西：</h3>
        <div className="flex flex-wrap justify-center gap-6 mb-10 w-full max-w-3xl">
          {targetList.map((itemName, idx) => {
             const emoji = MARKET_ITEMS.find(m => m.name === itemName)?.emoji;
             return (
              <div key={idx} className="bg-white border-4 border-emerald-200 p-6 rounded-3xl shadow-md text-2xl font-bold min-w-[160px] animate-pop-in flex flex-col items-center transform hover:scale-105 transition-transform" style={{animationDelay: `${idx*100}ms`}}>
                <span className="block text-7xl mb-4 drop-shadow-sm">{emoji}</span>
                <span className="text-emerald-900">{itemName}</span>
              </div>
            );
          })}
        </div>
        <button 
          onClick={() => {
            setGameState('playing');
            speak("开始选择商品");
          }}
          className="bg-blue-600 text-white text-2xl px-16 py-5 rounded-2xl shadow-xl hover:bg-blue-700 font-bold active:scale-95 transition-all"
        >
          我记住了
        </button>
      </div>
    );
  }

  if (gameState === 'feedback') {
    const stars = score >= 80 ? 3 : score >= 60 ? 2 : 1;

    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in bg-emerald-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-emerald-100 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-emerald-500"></div>
          
          <div className="flex justify-center gap-2 mb-6 mt-4">
            {[1, 2, 3].map(i => (
              <Star key={i} className={`w-14 h-14 ${i <= stars ? 'text-yellow-400 fill-yellow-400 drop-shadow-md' : 'text-slate-200'} transition-all duration-500`} />
            ))}
          </div>

          <h3 className="text-5xl font-bold mb-4 text-slate-800">{score} 分</h3>
          <p className="text-xl text-slate-600 mb-8 font-medium">{message}</p>
          
          <div className="text-left mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="font-bold text-slate-700 mb-4 text-lg">正确清单：</p>
            <div className="flex flex-wrap gap-3">
              {targetList.map(t => (
                <span key={t} className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl text-lg font-bold shadow-sm">{t}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => onFinish(score, stars, 'next')}
              className="bg-emerald-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-emerald-700 font-bold active:scale-95 transition-all"
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
    <div className="flex flex-col h-full p-4 bg-emerald-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-slate-700">请选择正确的商品</h3>
        <div className="text-emerald-800 font-bold bg-white px-6 py-2 rounded-full shadow-sm border-2 border-emerald-100 text-xl">
          篮子: {basket.length} / {targetList.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-24">
          {items.map((item) => {
            const isSelected = basket.includes(item.name);
            return (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className={`p-4 rounded-3xl border-4 transition-all duration-200 flex flex-col items-center justify-center aspect-square shadow-sm relative overflow-hidden
                  ${isSelected 
                    ? 'bg-emerald-50 border-emerald-500 scale-95 shadow-inner' 
                    : 'bg-white border-white hover:border-emerald-200 shadow-md'}`}
              >
                <span className="text-6xl md:text-7xl mb-4 drop-shadow-sm transform transition-transform group-hover:scale-110">{item.emoji}</span>
                <span className={`text-xl md:text-2xl font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-600'}`}>
                  {item.name}
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                    <CheckCircle className="w-8 h-8 text-emerald-600 fill-emerald-100" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-slate-200 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] rounded-t-3xl">
        <button 
          onClick={submitBasket}
          className="w-full bg-emerald-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-emerald-700 active:bg-emerald-800 font-bold tracking-wider transition-all active:scale-[0.98]"
        >
          去结账
        </button>
      </div>
    </div>
  );
};