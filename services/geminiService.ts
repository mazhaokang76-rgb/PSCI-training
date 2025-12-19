import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-3-flash-preview";

// Helper to clean JSON string if it contains markdown code blocks
const cleanJsonString = (str: string): string => {
  if (str.startsWith("```json")) {
    return str.replace(/^```json\n/, "").replace(/\n```$/, "");
  }
  return str;
};

export const generateMarketScenario = async (difficulty: Difficulty): Promise<{ targetItems: string[], distractorItems: string[] }> => {
  const count = difficulty === Difficulty.EASY ? 3 : difficulty === Difficulty.MEDIUM ? 5 : 7;
  
  const prompt = `
    Generate a shopping list for a game designed for Chinese post-stroke patients.
    Context: A traditional Chinese wet market or supermarket.
    
    1. Generate ${count} "target" items (common foods/household items in China).
    2. Generate ${count} "distractor" items (items that belong in a market but are NOT on the list).
    
    Items should be simple nouns (e.g., "Bok Choy", "Pork Belly", "Soy Sauce", "Tofu").
    Return ONLY JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Items the user needs to buy"
            },
            distractorItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Items to ignore"
            }
          }
        }
      }
    });

    const jsonStr = response.text ? cleanJsonString(response.text) : '{"targetItems": ["白菜", "豆腐", "鸡蛋"], "distractorItems": ["酱油", "大米", "鱼"]}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Market Error:", error);
    return {
      targetItems: ["白菜", "豆腐", "鸡蛋"],
      distractorItems: ["酱油", "大米", "鱼"]
    };
  }
};

export const generateMathProblem = async (difficulty: Difficulty): Promise<{ question: string; answer: number }> => {
  // Local logic for Easy/Medium to ensure speed and simplicity
  if (difficulty === Difficulty.EASY) {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    return { question: `🍎 ${a}元 + 🍌 ${b}元 = ?`, answer: a + b };
  }
  
  // Use Gemini for Hard word problems
  const prompt = `
    Generate a simple math word problem in Simplified Chinese for a stroke patient.
    Context: Buying vegetables or fruits at a market.
    The math should involve addition or subtraction within 20.
    The language should be very simple and direct.
    Return strictly JSON: { "question": "The question text", "answer": number }.
    Example: { "question": "白菜3元，萝卜2元，一共多少元？", "answer": 5 }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.INTEGER }
          }
        }
      }
    });
    const jsonStr = response.text ? cleanJsonString(response.text) : '{"question": "苹果5元，买了2个，一共多少元？", "answer": 10}';
    return JSON.parse(jsonStr);
  } catch (error) {
    return { question: "苹果5元，付了10元，找零多少？", answer: 5 };
  }
};

export const generateEncouragement = async (score: number, gameName: string): Promise<string> => {
  const prompt = `
    You are a kind rehabilitation assistant for stroke survivors.
    The user just finished playing "${gameName}" and scored ${score} points.
    Write a very short (1 sentence), encouraging message in Simplified Chinese.
    If the score is low, be supportive. If high, be celebratory.
    Keep it warm and respectful of older adults.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "做得好！继续加油。";
  } catch (error) {
    return "辛苦了！您的努力会有回报的。";
  }
};

export const generateTherapistReport = async (scores: any[]): Promise<string> => {
  if (!scores || scores.length === 0) return "目前没有足够的训练记录。请先进行几次游戏训练，AI治疗师将为您生成评估报告。";

  const recentScores = scores.slice().reverse().slice(0, 15); // Analyze last 15 games
  
  const gameNameMap: Record<string, string> = {
    'MARKET': '超市大采购 (长时记忆)',
    'MEMORY': '麻将对对碰 (工作记忆)',
    'REACTION': '接福气 (反应速度)',
    'MATH': '菜场算账 (计算能力)',
    'SEARCH': '火眼金睛 (视觉注意)',
    'SORTING': '物品分类 (执行功能)',
    'PATTERN': '找规律 (逻辑推理)',
    'COLOR_MATCH': '颜色大作战 (抑制能力)'
  };

  const summary = recentScores.map(s => {
    const mode = s.gameId.split('-')[0];
    const level = s.gameId.split('-')[1];
    const name = gameNameMap[mode] || mode;
    return `- ${name} 第${level}关: ${s.score}分 (${s.stars}星) ${new Date(s.date).toLocaleDateString()}`;
  }).join('\n');

  const prompt = `
    你是一位专业的认知康复治疗师。请根据以下脑卒中患者的近期训练数据，生成一份简短、专业且令人鼓舞的康复评估报告。
    
    患者近期训练记录:
    ${summary}
    
    请输出纯文本格式 (不要使用Markdown，不要使用#号标题)，包含以下三个部分，每部分之间空一行：
    
    【训练进展评价】
    (根据分数和星级评价患者的参与度和总体表现)
    
    【认知能力分析】
    (根据玩的游戏类型，分析患者在记忆、计算、注意力、执行功能等方面的强项和弱项)
    
    【下一步训练建议】
    (提出具体的训练目标，并推荐重点训练的游戏类型)
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "无法生成报告。";
  } catch (error) {
    console.error("Gemini Report Error:", error);
    return "生成报告时网络出错，请检查您的连接或API Key。";
  }
};
