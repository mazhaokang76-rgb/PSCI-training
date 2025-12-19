import React, { useState, useEffect } from 'react';
import { LevelConfig } from '../types';
import { speak, playSound } from '../services/audioService';
import { Star, ArrowRight, ArrowLeft, Play } from 'lucide-react';

interface Props {
  levelConfig: LevelConfig;
  onBack: () => void;
  onFinish: (score: number, stars: number) => void;
}

interface Item {
  emoji: string;
  name: string;
  category: 'A' | 'B';
}

const DATA_SETS = {
  1: {
    catA: '水果', catB: '动物',
    itemsA: [{e:'🍎',n:'苹果'}, {e:'🍌',n:'香蕉'}, {e:'🍇',n:'葡萄'}, {e:'🍊',n:'橘子'}, {e:'🍑',n:'桃子'}],
    itemsB: [{e:'🐶',n:'小狗'}, {e:'🐱',n:'小猫'}, {e:'🐯',n:'老虎'}, {e:'🐮',n:'奶牛'}, {e:'🐷',n:'小猪'}]
  },
  2: {
    catA: '电器', catB: '衣服',
    itemsA: [{e:'📱',n:'手机'}, {e:'💻',n:'电脑'}, {e:'📺',n:'电视'}, {e:'📷',n:'相机'}, {e:'⏰',n:'闹钟'}],
    itemsB: [{e:'👕',n:'T恤'}, {e:'👖',n:'裤子'}, {e:'👗',n:'裙子'}, {e:'🧥',n:'外套'}, {e:'🧦',n:'袜子'}]
  },
  3: {
    catA: '天上', catB: '水里',
    itemsA: [{e:'☀️',n:'太阳'}, {e:'☁️',n:'云朵'}, {e:'🦅',n:'老鹰'}, {e:'✈️',n:'飞机'}, {e:'🌙',n:'月亮'}],
    itemsB: [{e:'🐟',n:'鱼'}, {e:'🦀',n:'螃蟹'}, {e:'🐙',n:'章鱼'}, {e:'🐋',n:'鲸鱼'}, {e:'🐢',n:'乌龟'}]
  }
};

export const SortingGame: React.FC<Props> = ({ levelConfig, onBack, onFinish }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'feedback'>('intro');
  const [queue, setQueue] = useState<Item[]>([]);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [score, setScore] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState({ A: '', B: '' });

  useEffect(() => {
    if (gameState === 'intro') {
      const data = DATA_SETS[levelConfig.level as 1|2|3] || DATA_SETS[1];
      speak(`物品分类第${levelConfig.level}关。请把${data.catA}和${data.catB}分开`);
    }
  }, [gameState]);

  const startGame = () => {
    const data = DATA_SETS[levelConfig.level as 1|2|3] || DATA_SETS[1];
    setCategories({ A: data.catA, B: data.catB });

    const list: Item[] = [];
    data.itemsA.forEach(i => list.push({ emoji: i.e, name: i.n, category: 'A' }));
    data.itemsB.forEach(i => list.push({ emoji: i.e, name: i.n, category: 'B' }));

    const fullList = [...list, ...list];
    setTotalItems(fullList.length);

    for (let i = fullList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fullList[i], fullList[j]] = [fullList[j], fullList[i]];
    }

    setQueue(fullList);
    setCurrentItem(fullList[0]);
    setScore(0);
    setGameState('playing');
    playSound('click');
  };

  const handleSort = (targetCat: 'A' | 'B') => {
    if (!currentItem) return;

    if (currentItem.category === targetCat) {
      playSound('success');
      const pointsPerItem = 100 / totalItems;
      setScore(s => Math.min(100, Math.ceil(s + pointsPerItem)));
    } else {playSound('error');
}
    const nextQueue = queue.slice(1);
setQueue(nextQueue);

if (nextQueue.length > 0) {
  setCurrentItem(nextQueue[0]);
} else {
  finishGame();
}
};
const finishGame = () => {
setGameState('feedback');
const stars = score >= 80 ? 3 : score >= 60 ? 2 : 1;
setMessage(stars >= 2 ? "分类能力很棒！" : "继续加油！");
if (stars >= 2) speak("真棒");
};
if (gameState === 'intro') {
const data = DATA_SETS[levelConfig.level as 1|2|3] || DATA_SETS[1];
return (
<div className="flex flex-col items-center justify-center h-full p-6 bg-gradient-to-br from-cyan-50 to-blue-100">
<div className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border-4 border-white">
<div className="bg-cyan-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
<ArrowLeft className="w-16 h-16 text-cyan-600" />
</div>
<h2 className="text-3xl font-bold text-slate-800 mb-6">物品分类</h2>
<div className="inline-block bg-cyan-100 text-cyan-800 px-4 py-1 rounded-full text-lg font-bold mb-6">
第 {levelConfig.level} 关
</div>
<p className="text-xl text-slate-600 leading-relaxed mb-8">
请将物品分到正确的类别：<br/>
<span className="font-bold text-cyan-700">{data.catA}</span> vs <span className="font-bold text-blue-700">{data.catB}</span>
</p>
      <button 
        onClick={startGame}
        className="w-full bg-cyan-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-cyan-700 font-bold flex items-center justify-center"
      >
         <Play className="mr-2 w-8 h-8" /> 开始
      </button>
    </div>
    <button onClick={onBack} className="text-slate-500 text-lg underline mt-8">返回</button>
  </div>
);
}
if (gameState === 'feedback') {
const stars = score >= 80 ? 3 : score >= 60 ? 2 : 1;
return (
<div className="flex flex-col items-center justify-center h-full p-6 text-center bg-cyan-50">
<div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-cyan-100 max-w-md w-full relative overflow-hidden">
<div className="absolute top-0 left-0 w-full h-3 bg-cyan-500"></div>
<div className="flex justify-center gap-2 mb-6 mt-4">
{[1, 2, 3].map(i => (
<Star key={i} className={w-14 h-14 ${i <= stars ? 'text-yellow-400 fill-yellow-400 drop-shadow-md' : 'text-slate-200'} transition-all} />
))}
</div>
<h3 className="text-4xl font-bold mb-4 text-slate-800">完成!</h3>
<p className="text-5xl font-bold text-cyan-600 mb-4">{score} 分</p>
<p className="text-xl text-slate-600 mb-8 font-medium">{message}</p>
<button
onClick={() => onFinish(score, stars)}
className="w-full bg-cyan-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:bg-cyan-700 font-bold active:scale-95 transition-all"
>
完成
</button>
</div>
</div>
);
}
return (
<div className="flex flex-col h-full bg-cyan-50 p-4 relative overflow-hidden">
<div className="flex justify-between items-center mb-4">
<h3 className="text-2xl font-bold text-cyan-900">请分类</h3>
<div className="text-cyan-800 font-bold bg-white px-6 py-2 rounded-full border border-cyan-100 text-xl">
剩余: {queue.length}
</div>
</div>
  <div className="flex-1 flex items-center justify-center mb-4">
    {currentItem && (
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-8 border-white flex flex-col items-center animate-pop-in">
        <span className="text-9xl mb-6 drop-shadow-lg">{currentItem.emoji}</span>
        <span className="text-3xl font-bold text-slate-700">{currentItem.name}</span>
      </div>
    )}
  </div>

  <div className="grid grid-cols-2 gap-6 h-48 md:h-64">
    <button
      onClick={() => handleSort('A')}
      className="bg-cyan-100 hover:bg-cyan-200 border-4 border-cyan-300 rounded-3xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-md"
    >
      <ArrowLeft className="w-12 h-12 text-cyan-700 mb-2" />
      <span className="text-3xl font-bold text-cyan-800">{categories.A}</span>
    </button>
    <button
      onClick={() => handleSort('B')}
      className="bg-blue-100 hover:bg-blue-200 border-4 border-blue-300 rounded-3xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-md"
    >
       <span className="text-3xl font-bold text-blue-800 mb-2">{categories.B}</span>
       <ArrowRight className="w-12 h-12 text-blue-700" />
    </button>
  </div>
</div>
);
};
