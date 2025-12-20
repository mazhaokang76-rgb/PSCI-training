import { GameScore } from '../types';

export const generateGrokReport = async (scores: GameScore[]): Promise<string> => {
  if (!scores || scores.length === 0) {
    return "目前没有足够的训练记录。请先进行几次游戏训练，AI治疗师将为您生成评估报告。";
  }

  // 检查 API Key
  const apiKey = import.meta.env.VITE_GROK_API_KEY;
  
  if (!apiKey) {
    console.error('VITE_GROK_API_KEY is not defined');
    return `⚠️ API配置错误\n\n未检测到 Grok API 密钥。\n\n请在 Vercel 环境变量中设置:\nVITE_GROK_API_KEY=xai-your-key\n\n然后重新部署。`;
  }

  console.log('API Key exists:', apiKey.substring(0, 10) + '...');

  const recentScores = scores.slice().reverse().slice(0, 15);
  
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

  const prompt = `你是一位专业的认知康复治疗师。请根据以下脑卒中患者的近期训练数据，生成一份简短、专业且令人鼓舞的康复评估报告。

患者近期训练记录:
${summary}

请输出纯文本格式 (不要使用Markdown，不要使用#号标题)，包含以下三个部分，每部分之间空一行：

【训练进展评价】
(根据分数和星级评价患者的参与度和总体表现)

【认知能力分析】
(根据玩的游戏类型，分析患者在记忆、计算、注意力、执行功能等方面的强项和弱项)

【下一步训练建议】
(提出具体的训练目标，并推荐重点训练的游戏类型)`;

  try {
    console.log('Calling Grok API...');
    
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "你是一位经验丰富的认知康复治疗师，专门帮助脑卒中患者进行康复训练评估。请使用简洁、专业、鼓励的语气。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "'grok-2-vision-1212",
        stream: false,
        temperature: 0.7
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok API Error:", response.status, errorText);
      
      if (response.status === 401) {
        return `⚠️ API认证失败 (401)\n\nGrok API 密钥无效或已过期。\n\n请检查:\n1. API密钥是否正确\n2. API密钥是否有效\n3. 是否有足够的配额\n\n当前使用的Key前缀: ${apiKey.substring(0, 10)}...`;
      }
      
      if (response.status === 429) {
        return `⚠️ API调用限制 (429)\n\n已达到 API 调用频率限制。\n\n请稍后再试。`;
      }
      
      throw new Error(`API返回错误: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Report generated successfully');
    
    return data.choices[0]?.message?.content || "无法生成报告。";
  } catch (error) {
    console.error("Grok Report Error:", error);
    
    return `⚠️ 报告生成失败\n\n错误信息: ${error}\n\n可能的原因:\n1. 网络连接问题\n2. API密钥配置错误\n3. Grok API 服务暂时不可用\n\n技术详情:\n- 使用的API Key前缀: ${apiKey ? apiKey.substring(0, 10) + '...' : '未配置'}\n- 错误类型: ${error instanceof Error ? error.message : '未知错误'}`;
  }
};
