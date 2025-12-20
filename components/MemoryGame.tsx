import React, { useState, useEffect } from 'react';
import { MemoryCard, LevelConfig } from '../types';
import { speak, playSound } from '../services/audioService';
import { Grid, Star, Play } from 'lucide-react';

interface Props {
  levelConfig: LevelConfig;
  onBack: () => void;
  onFinish: (score: number, stars: number) => void;
}

const TILES = ["🀄", "🃏", "🀐", "🀙", "🀘", "🀅", "🀇", "🀆", "🀀", "🀁", "🀂", "🀃"];

export const MemoryGame: React.FC<Props> = ({ levelConfig, onBack, onFinish }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<MemoryCard[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'feedback'>('intro');
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (gameState === 'intro') {
      speak(`欢迎来到麻将对对碰，第${levelConfig.level}关。请翻开卡片寻找相同的牌`);
    }
  }, [gameState, levelConfig.level]);

  const setupGame = () => {
    const pairCount = levelConfig.params?.pairCount || 4;
    
    const selectedTiles = TILES.slice(0, pairCount);
    const deck = [...selectedTiles, ...selectedTiles]
      .sort(() => Math.random() - 0.5)
      .map((content, index) => ({
        id: `card-${index}`,
        content,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(deck);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameState('playing');
    playSound('click');
  };

  const handleCardClick = (card: MemoryCard) => {
    if (gameState !== 'playing' || card.isMatched || card.isFlipped || flippedCards.length >= 2) return;

    playSound('click');
    const newCards = cards.map(c => c.id === card.id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    
    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      checkForMatch(newFlipped[0], newFlipped[1]);
    }
  };

  const checkForMatch = (card1: MemoryCard, card2: MemoryCard) => {
    if (card1.content === card2.content) {
      playSound('success');
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          c.content === card1.content ? { ...c, isMatched: true } : c
        ));
        setFlippedCards([]);
        setMatches(m => {
          const newMatches = m + 1;
          const pairCount = levelConfig.params?.pairCount || 4;
          if (newMatches === pairCount) finishGame();
          return newMatches;
        });
      }, 500);
    } else {
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          c.id === card1.id || c.id === card2.id ? { ...c, isFlipped: false } : c
        ));
        setFlippedCards([]);
      }, 1000);
    }
  };

  const finishGame = () => {
    const pairCount = levelConfig.params?.pairCount || 4;
    const optimal = pairCount;
    const rawScore = Math.max(0, 100 - ((moves - optimal) * 10));
    
    const stars = rawScore >= 80 ? 3 : rawScore >= 50 ? 2 : 1;
    setMessage(stars >= 2 ? "记忆力真棒！" : "继续练习会更好！");
    
    if (stars >= 2) {
      playSound('success');
      speak("太好了，记忆力很棒！");
    } else {
      speak("继续加油，你可以做得更好");
    }
    
    setGameState('feedback');
  };

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 animate-fade-in bg-gradient-to-br from-rose-50 to-pink-100">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border-4 border-white">
          <div className="bg-rose-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
            <Grid className="w-16 h-16 text-rose-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">麻将对对碰</h2>
           <div className="inline-block bg-rose-100 text-rose-800 px-4 py-1 rounded-full text-lg font-bold mb-4">
            第 {levelConfig.level} 关
          </div>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">翻开牌面<br/>寻找相同的麻将牌</p>
          
          <button 
            onClick={setupGame}
            className="mt-8 w-full bg-rose-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-rose-700 transition-all active:scale-95 flex items-center justify-center font-bold"
          >
             <Play className="mr-2 w-8 h-8" /> 开始游戏
          </button>
        </div>
        <button onClick={onBack} className="text-slate-500 text-lg underline">返回</button>
      </div>
    );
  }

  if (gameState === 'feedback') {
     const pairCount = levelConfig.params?.pairCount || 4;
     const optimal = pairCount;
     const score = Math.max(0, 100 - ((moves - optimal) * 10));
     const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;

    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in bg-rose-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-rose-100 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-rose-500"></div>
           
           <div className="flex justify-center gap-2 mb-6 mt-4">
            {[1, 2, 3].map(i => (
              <Star key={i} className={`w-14 h-14 ${i <= stars ? 'text-yellow-400 fill-yellow-400 drop-shadow-md' : 'text-slate-200'} transition-all`} />
            ))}
          </div>

          <h3 className="text-4xl font-bold mb-4 text-slate-800">游戏完成!</h3>
          <p className="text-2xl text-slate-600 mb-2 font-medium">使用步数: {moves}</p>
          <p className="text-xl text-rose-700 font-bold mb-8">{message}</p>
          
          <button 
            onClick={() => onFinish(score, stars)}
            className="w-full bg-rose-600 text-white text-2xl py-4 rounded-2xl shadow hover:bg-rose-700 font-bold active:scale-95 transition-all"
          >
            完成
          </button>
        </div>
      </div>
    );
  }

 return (
    <div className="flex flex-col h-full bg-rose-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-rose-900">麻将对对碰</h3>
        <div className="text-rose-800 font-bold bg-white px-6 py-2 rounded-full shadow-sm text-xl border border-rose-100">
          步数: {moves}
        </div>
      </div>

      <div className={`grid gap-3 flex-1 content-center max-w-4xl mx-auto w-full ${
        (levelConfig.params?.pairCount || 4) > 6 ? 'grid-cols-4' : 'grid-cols-4 md:grid-cols-3'
      }`}>
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            className={`aspect-[2/3] rounded-xl shadow-md flex items-center justify-center transition-all duration-500 transform perspective-1000
              ${card.isFlipped || card.isMatched 
                ? 'bg-orange-50 border-4 border-orange-100 rotate-y-180' 
                : 'bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-white'}`}
            disabled={card.isMatched || card.isFlipped}
          >
            {(card.isFlipped || card.isMatched) 
              ? <span className="text-5xl md:text-6xl lg:text-7xl select-none leading-none">{card.content}</span>
              : <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] rounded-lg"></div>}
          </button>
        ))}
      </div>
    </div>
  );
};
