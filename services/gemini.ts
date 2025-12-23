
import { DrinkRecipe } from "../types";

// 本地兜底数据：当 Gemini API 不可用时使用
const getFallbackMenu = (moodText: string): DrinkRecipe[] => {
  return [
    {
      name: "电子海风",
      tagline: "为失眠的城市上弦",
      description: "霓虹残影中，冰冷的玻璃杯贴着你的指尖。这杯酒像是深夜电台里传来的那首老歌，让你想起某个已经忘记名字的街角。",
      flavorProfile: "微甜、微苦，带一点金属味的清爽气泡。入口冰凉，回味带着淡淡的酸涩，就像回忆本身。",
      ingredients: {
        'Adelhyde': 3,
        'Bronson Ext': 2,
        'Pwd Delta': 1,
        'Flanergide': 0,
        'Karmotrine': 4
      },
      iced: true,
      aged: false
    },
    {
      name: "数据流",
      tagline: "在代码的缝隙中呼吸",
      description: "Jill 把杯子推到你面前，屏幕的蓝光映在她的脸上。'有时候，你需要一点混乱来对抗这个过于有序的世界。'她笑着说。",
      flavorProfile: "强烈的酸味和苦味交织，中间夹杂着一丝甜意。就像调试代码时的感觉——痛苦，但偶尔会有突破的瞬间。",
      ingredients: {
        'Adelhyde': 2,
        'Bronson Ext': 4,
        'Pwd Delta': 5,
        'Flanergide': 1,
        'Karmotrine': 3
      },
      iced: false,
      aged: true
    },
    {
      name: "赛博梦境",
      tagline: "在虚拟与现实的边界",
      description: "'你知道吗？' Jill 擦拭着杯子，'有时候我觉得我们都在一个巨大的模拟器里。但至少这杯酒是真实的。' 她递给你，眼神里有一丝疲惫。",
      flavorProfile: "复杂的层次感，先是甜，然后是苦，最后是辛辣的余韵。就像在虚拟世界中寻找真实的感觉——模糊，但令人着迷。",
      ingredients: {
        'Adelhyde': 4,
        'Bronson Ext': 3,
        'Pwd Delta': 2,
        'Flanergide': 3,
        'Karmotrine': 5
      },
      iced: true,
      aged: false
    }
  ];
};

export const generateMoodMenu = async (moodText: string): Promise<DrinkRecipe[]> => {
  // 检查是否有 API Key
  // vite.config.ts 中定义了 process.env.API_KEY, process.env.GEMINI_API_KEY 和 import.meta.env.VITE_GEMINI_API_KEY
  const apiKey = (process.env as any).API_KEY 
    || (process.env as any).GEMINI_API_KEY 
    || (import.meta.env as any).VITE_GEMINI_API_KEY
    || (import.meta.env as any).GEMINI_API_KEY;
  
  console.log("🔑 检查 API Key:", apiKey && typeof apiKey === 'string' && apiKey.length > 0 ? `已找到 (${apiKey.substring(0, 10)}...)` : "未找到");
  console.log("🔍 调试信息:", {
    'process.env.API_KEY': (process.env as any).API_KEY ? '存在' : '不存在',
    'process.env.GEMINI_API_KEY': (process.env as any).GEMINI_API_KEY ? '存在' : '不存在',
    'import.meta.env.VITE_GEMINI_API_KEY': (import.meta.env as any).VITE_GEMINI_API_KEY ? '存在' : '不存在',
    'apiKey类型': typeof apiKey,
    'apiKey值': apiKey ? (typeof apiKey === 'string' ? apiKey.substring(0, 20) + '...' : String(apiKey)) : 'null/undefined'
  });
  
  // 如果没有 API Key，直接返回本地兜底数据
  if (!apiKey || apiKey === 'undefined' || apiKey === '' || apiKey === 'null') {
    console.warn("⚠️ 未检测到 Gemini API Key，使用本地预设菜单。");
    console.warn("💡 提示：请在 .env.local 文件中设置 GEMINI_API_KEY=你的密钥");
    return getFallbackMenu(moodText);
  }

  try {
    console.log("🤖 开始调用 Gemini API...");
    // 动态导入 Gemini SDK，避免在浏览器端导入失败导致应用无法启动
    const { GoogleGenAI, Type } = await import("@google/genai");
    
    // 尝试使用 Gemini API
    const ai = new GoogleGenAI({ apiKey });
    console.log("✅ Gemini SDK 加载成功");
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `系统链接：BTC 终端校准。
    客户情绪数据： "${moodText}"。 
    
    扮演角色：Jill，Glitch City VA-11 HALL-A 的资深调酒师。 
    任务：根据客户的心情，生成3款独特的赛博朋克调酒建议。
    
    必须使用中文回复以下所有文本内容（名称、标语、描述、风味描述）：
    - 名称（name）：富有科幻感的中文名字。
    - 标语（tagline）：简短有力的宣传语。
    - 描述（description）：一段极具沉浸感的、符合游戏风格的背景描述或对话。
    - 风味描述（flavorProfile）：具体的味觉体验描述。
    
    配方规格（必须为数字）：
    - Adelhyde（艾德海特）：甜味、红色。
    - Bronson Ext（布朗森精粹）：苦味、橙色。
    - Pwd Delta（三角洲粉末）：酸味、蓝色。
    - Flanergide（弗兰德吉德）：辣味、绿色。
    - Karmotrine（卡莫特琳）：酒精单位、白色。
    
    限制：
    - 每种成分：0-10 单位。
    - 总量上限：20 单位。
    - iced（加冰）和 aged（陈年）布尔值。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              tagline: { type: Type.STRING },
              description: { type: Type.STRING },
              flavorProfile: { type: Type.STRING },
              ingredients: {
                type: Type.OBJECT,
                properties: {
                  'Adelhyde': { type: Type.INTEGER },
                  'Bronson Ext': { type: Type.INTEGER },
                  'Pwd Delta': { type: Type.INTEGER },
                  'Flanergide': { type: Type.INTEGER },
                  'Karmotrine': { type: Type.INTEGER }
                },
                required: ['Adelhyde', 'Bronson Ext', 'Pwd Delta', 'Flanergide', 'Karmotrine']
              },
              iced: { type: Type.BOOLEAN },
              aged: { type: Type.BOOLEAN }
            },
            required: ["name", "tagline", "description", "flavorProfile", "ingredients", "iced", "aged"]
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || "[]");
    console.log("📦 Gemini 返回数据:", parsed);
    
    // 验证返回的数据格式是否正确
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log("✅ Gemini API 调用成功，返回了", parsed.length, "款调酒");
      return parsed;
    } else {
      console.warn("⚠️ Gemini 返回的数据格式不正确，使用本地兜底数据。");
      return getFallbackMenu(moodText);
    }
  } catch (e) {
    // 如果 Gemini API 调用失败，返回本地兜底数据
    console.error("❌ Gemini API 调用失败，使用本地预设菜单：", e);
    if (e instanceof Error) {
      console.error("错误详情:", e.message);
      console.error("错误堆栈:", e.stack);
    }
    return getFallbackMenu(moodText);
  }
};
