import React, { useState, useEffect, useRef } from 'react';
import { LevelConfig } from '../types';
import { speak, playSound } from '../services/audioService';
import { Hand, Star, Play } from 'lucide-react';

interface Props {
  levelConfig: LevelConfig;
  onBack: () => void;
  onFinish: (score: number, stars: number) => void;
}

interface FallingItem {
  id: number;
  x: number;
  y: number;
  symbol: string;
  type: 'good' | 'bad';
  speed: number;
}

export const TaiChiGame: React.FC<Props> = ({ levelConfig, onBack, onFinish }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'feedback'>('intro');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [catcherX, setCatcherX] = useState(50);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [message, setMessage] = useState("");
  
  const gameLoopRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameState === 'intro') {
      speak(`接福气第${levelConfig.level}关。移动福袋，接住红包，避开蜘蛛`);
    }
  }, [gameState, levelConfig.level]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(levelConfig.params?.duration || 45);
    setItems([]);
    setGameState('playing');
    playSound('click');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    let lastSpawn = 0;
    const spawnRate = levelConfig.params?.spawnRate || 1500;
    const baseSpeed = levelConfig.params?.baseSpeed || 0.3;

    const loop = (time: number) => {
      if (time - lastSpawn > spawnRate) {
        lastSpawn = time;
        const type = Math.random() > 0.3 ? 'good' : 'bad';
        const newItem: FallingItem = {
          id: time,
          x: Math.random() * 80 + 10, 
          y: -10,
          symbol: type === 'good' ? '🧧' : '🕷️',
          type,
          speed: baseSpeed + (Math.random() * 0.2)
        };
        setItems(prev => [...prev, newItem]);
      }

      setItems(prev => {
        const nextItems: FallingItem[] = [];
        prev.forEach(item => {
          const newY = item.y + item.speed;
          
          let hit = false;
          if (newY > 85 && newY < 95) { 
             if (Math.abs(item.x - catcherX) < 15) { 
               hit = true;
               if (item.type === 'good') {
                 setScore(s => s + 10);
                 playSound('success');
               } else {
                 setScore(s => Math.max(0, s - 10));
                 playSound('error');
               }
             }
          }

          if (!hit && newY < 100) {
            nextItems.push({ ...item, y: newY });
          }
        });
        return nextItems;
      });

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      clearInterval(timer);
    };
  }, [gameState, catcherX, levelConfig]);

  const endGame = () => {
    setGameState('feedback');
    const target = levelConfig.targetScore || 100;
    const stars = score >= target ? 3 : score >= target * 0.6 ? 2 : 1;
    setMessage(stars >= 2 ? "反应速度真快！" : "多练习会更快！");
    
    if (stars >= 2) speak(`时间到！恭喜您获得${stars}颗星`);
    else speak("时间到！再试一次吧");
  };

  const moveCatcher = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let clientX = 0;
    if ('touches' in e) clientX = e.touches[0].clientX;
    else clientX = (e as React.MouseEvent).clientX;

    const relativeX = clientX - rect.left;
    const percentage = (relativeX / rect.width) * 100;
    setCatcherX(Math.max(10, Math.min(90, percentage)));
  };

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 animate-fade-in bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border-4 border-white">
          <div className="bg-amber-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
            <Hand className="w-16 h-16 text-amber-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">接福气</h2>
           <div className="inline-block bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-lg font-bold mb-4">
            第 {levelConfig.level} 关
          </div>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">移动福袋，接住红包 (🧧)<br/>避开蜘蛛 (🕷️)</p>
          
          <button 
            onClick={startGame}
            className="mt-8 w-full bg-amber-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-amber-700 transition-all active:scale-95 flex items-center justify-center font-bold"
          >
            <Play className="mr-2 w-8 h-8" /> 开始
          </button>
        </div>
        <button onClick={onBack} className="text-slate-500 text-lg underline">返回</button>
      </div>
    );
  }

  if (gameState === 'feedback') {
    const target = levelConfig.targetScore || 100;
    const stars = score >= target ? 3 : score >= target * 0.6 ? 2 : 1;

    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in bg-amber-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-amber-100 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-amber-500"></div>
           
           <div className="flex justify-center gap-2 mb-6 mt-4">
            {[1, 2, 3].map(i => (
              <Star key={i} className={`w-14 h-14 ${i <= stars ? 'text-yellow-400 fill-yellow-400 drop-shadow-md' : 'text-slate-200'} transition-all`} />
            ))}
          </div>

          <h3 className="text-4xl font-bold mb-4 text-slate-800">时间到!</h3>
          <p className="text-5xl font-bold text-amber-600 mb-4">{score} 分</p>
          <p className="text-xl text-slate-600 mb-8 font-medium">{message}</p>
          
          <button 
            onClick={() => onFinish(score, stars)}
            className="w-full bg-amber-600 text-white text-2xl py-4 rounded-2xl shadow hover:bg-amber-700 font-bold active:scale-95 transition-all"
          >
            完成
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative h-full bg-amber-50 overflow-hidden touch-none"
      ref={containerRef}
      onMouseMove={moveCatcher}
      onTouchMove={moveCatcher}
      onClick={moveCatcher}
    >
      <div className="absolute top-4 left-4 right-4 flex justify-between text-xl font-bold text-amber-900 z-10 pointer-events-none">
        <span className="bg-white/80 px-6 py-2 rounded-full shadow-sm">得分: {score}</span>
        <span className="bg-white/80 px-6 py-2 rounded-full shadow-sm">时间: {timeLeft}s</span>
      </div>

      {items.map(item => (
        <div
          key={item.id}
          className="absolute text-7xl pointer-events-none transition-transform drop-shadow-sm"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {item.symbol}
        </div>
      ))}

      <div 
        className="absolute bottom-10 w-32 h-32 bg-gradient-to-t from-red-600 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-yellow-400 transition-all duration-75 ease-out pointer-events-none"
        style={{
          left: `${catcherX}%`,
          transform: 'translateX(-50%)'
        }}
      >
        <span className="text-6xl drop-shadow-md">💰</span>
      </div>
    </div>
  );
};
