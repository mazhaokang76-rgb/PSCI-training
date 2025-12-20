import React, { useState } from 'react';
import { GameScore } from '../types';
import { Trophy, TrendingUp, Calendar, Loader2, FileText, Activity, Clock, ArrowLeft, Brain } from 'lucide-react';
import { generateGrokReport } from '../services/grokService';

interface Props {
  scores: GameScore[];
  onBack: () => void;
}

export const Dashboard: React.FC<Props> = ({ scores, onBack }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const recentScores = [...scores].reverse().slice(0, 8);
  const totalScore = scores.reduce((acc, curr) => acc + curr.score, 0);

  const handleGenerateReport = async () => {
    setLoading(true);
    const text = await generateGrokReport(scores);
    setReport(text);
    setLoading(false);
  };

  const getGameName = (gameId: string) => {
    if (gameId.startsWith('MARKET')) return '超市大采购 (Memory)';
    if (gameId.startsWith('MEMORY')) return '麻将对对碰 (Memory)';
    if (gameId.startsWith('REACTION')) return '接福气 (Reaction)';
    if (gameId.startsWith('MATH')) return '菜场算账 (Calc)';
    if (gameId.startsWith('SEARCH')) return '火眼金睛 (Attention)';
    if (gameId.startsWith('SORTING')) return '物品分类 (Exec)';
    if (gameId.startsWith('PATTERN')) return '找规律 (Logic)';
    if (gameId.startsWith('COLOR_MATCH')) return '颜色大作战 (Inhibition)';
    return '训练游戏';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <header className="px-8 py-5 bg-white border-b border-slate-200 flex items-center gap-4 z-10 shadow-sm shrink-0">
         <button 
           onClick={onBack}
           className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
         >
           <ArrowLeft className="w-5 h-5" />
         </button>
         <div>
            <h1 className="text-xl font-bold text-slate-900">训练进展报告</h1>
            <p className="text-xs text-slate-500 font-medium">AI 认知康复评估系统</p>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Activity className="w-5 h-5" /></div>
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">训练次数</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{scores.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Trophy className="w-5 h-5" /></div>
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">累计得分</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{totalScore}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Clock className="w-5 h-5" /></div>
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">最后训练</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                        {scores.length > 0 ? new Date(scores[scores.length-1].date).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-slate-800">AI 康复评估</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">AI POWERED</span>
                    </div>
                    {!loading && (
                        <button 
                            onClick={handleGenerateReport}
                            className="text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg shadow-sm hover:shadow transition-all"
                        >
                            <FileText className="w-4 h-4" />
                            {report ? "重新生成" : "生成报告"}
                        </button>
                    )}
                </div>
                
               <div className="p-6">
                    {!report && !loading && (
                        <div className="text-center py-12 text-slate-500">
                            <Brain className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg font-medium mb-2">尚未生成 AI 评估报告</p>
                            <p className="text-sm">点击"生成报告"按钮，让AI 为您分析认知训练表现</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                            <span className="text-slate-600 font-medium text-lg">AI 正在分析认知表现...</span>
                            <span className="text-slate-400 text-sm mt-2">这可能需要几秒钟</span>
                        </div>
                    )}

                    {report && (
                        <div className="prose prose-slate max-w-none">
                            <div className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-sm md:text-base border-l-4 border-blue-500 pl-6 bg-slate-50/70 p-6 rounded-r-xl">
                                {report}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent History Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-slate-500" />
                        最近训练记录
                    </h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {recentScores.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>暂无训练数据</p>
                            <p className="text-sm mt-1">完成训练后，记录将显示在这里</p>
                        </div>
                    ) : (
                        recentScores.map((score, idx) => (
                            <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div>
                                    <p className="font-semibold text-slate-900">{getGameName(score.gameId)}</p>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                                        {new Date(score.date).toLocaleDateString()} • {new Date(score.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm font-bold text-slate-900">{score.score} pts</span>
                                    <div className="flex gap-0.5 justify-end mt-1">
                                         {[1,2,3].map(i => (
                                             <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= score.stars ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                         ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
