
import { GoogleGenAI, Type } from "@google/genai";
import { DrinkRecipe } from "../types";

export const generateMoodMenu = async (moodText: string): Promise<DrinkRecipe[]> => {
  // Fix: Initialize GoogleGenAI using process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("终端错误：数据合成失败。");
    throw e;
  }
};
