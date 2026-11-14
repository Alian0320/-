import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  parseRawTextToOrders,
  processDeliveryOrders,
} from './src/shared/yilanRouteEngine.ts';
import type { RawOrderItem, SortMode } from './src/shared/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('尚未設定 GEMINI_API_KEY，請於 Settings > Secrets 確認環境變數。');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ImageInputPayload {
  base64: string;
  mimeType: string;
  label?: string;
}

interface ParseRequestBody {
  images?: ImageInputPayload[];
  rawText?: string;
  sortMode?: SortMode;
}

const SYSTEM_INSTRUCTION = `你是一位專精於「宜蘭縣羅東鎮、冬山鄉、五結鄉」外送派單系統的 OCR 與路線資料提取專家。
你的任務是從使用者上傳的多張外送截圖、影片影格或文字清單中，精確提取每一筆訂單資訊，並執行以下規範：

1. 完整提取每一筆訂單：
   - 依圖片順序及每張圖由上至下的閱讀順序提取：recipientName（收件人姓名）、rawAddress（完整地址，含路名巷弄號）、rawDistrict（若有顯示鄉鎮市區，如冬山鄉、羅東鎮、五結鄉、宜蘭市等）、rawFloor（樓層如 1樓、3F、三樓）、notes（備註如放門口、警衛室）、orderCount（若單一卡片明確標示多份/多筆如 x2、+3 則填入數字，否則為 1）。
   - 若同一收件人或同一地址出現多筆獨立訂單（例如多張不同餐點/單號的訂單卡），請全部各自列為一筆資料，切勿自行刪減合併，後續系統會進行全局合併與 +N 計數。
   - 若多張圖片是來自同一段滑動錄影的相鄰影格，且同一張訂單卡片（相同單號或完全相同畫面位置）在前後影格重疊出現，請只提取一次，避免影格重疊造成的重複計算。

2. 宜蘭在地路名 OCR 反向校對與同音字意識：
   - 常見易錯路名請特別留意字形與宜蘭實際路名：
     * 冬山鄉「清溝路」常被辨識成「清溝綠濲」、「清溝露」、「青溝路」。
     * 冬山鄉「南盟路」常被誤認成「南望路」、「南宜路」、「南亭路」；羅東鎮有「南門路」、「南昌街」。
     * 羅東鎮常見路名：公正路、純精路、興東路、中正路、中正北/南路、中山路、倉前路、林森路、復興路、北成路、維揚路、培英路、國華街、四育路、光榮路、陽明路、站前路、月眉路、富農路。
     * 冬山鄉常見路名：清溝路、群英路、義成路、冬山路、廣興路、梅花路、鹿得路、柯林路、順安路、永興路、珍珠一路/二路、武淵路、補城路、成興路、南盟路、照安路、太和路、香和路。
     * 五結鄉常見路名：五結路、五結中路、中正路一段/二段/三段、國民路、國民中路、學進路、二結路、舊街路、四結路、復興中路、鎮安路、傳藝路、親河路、五濱路、利澤路、利澤東/西路、利成路、孝威路、大吉路、三吉路、錦眾路、季水路。
   - 若畫面文字模糊、有簡體字或出現不確定/非宜蘭常見路名，請忠實保留辨識字面於 rawAddress，並將 ocrConfidence 設為 "low"，於 ocrUncertainReason 簡述原因。

3. 排序指令偵測：
   - 若使用者的補充文字指令中有要求「取消地理微聚類」、「照影片順序」、「照原始順序」等語意，請將 detectedDisableGeoCluster 設為 true。`;

async function extractOrdersWithGemini(
  images: ImageInputPayload[],
  rawText: string
): Promise<{ orders: RawOrderItem[]; detectedDisableGeoCluster: boolean }> {
  const ai = getGeminiClient();

  const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> = [];

  images.forEach((img, idx) => {
    const cleanBase64 = img.base64.includes(',') ? img.base64.split(',')[1] : img.base64;
    parts.push({
      text: `【來源畫面 ${idx + 1}${img.label ? `：${img.label}` : ''}】`,
    });
    parts.push({
      inlineData: {
        mimeType: img.mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    });
  });

  const userPrompt = rawText.trim()
    ? `請解析以上所有截圖/影格中的外送訂單，並參考以下補充文字或指令：\n${rawText.trim()}`
    : '請解析以上所有截圖/影格中的外送訂單，並回傳結構化 JSON。';

  parts.push({ text: userPrompt });

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedDisableGeoCluster: {
            type: Type.BOOLEAN,
            description: '使用者是否要求取消地理微聚類並依照影片/原始順序排列',
          },
          orders: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                recipientName: {
                  type: Type.STRING,
                  description: '收件人姓名',
                },
                rawAddress: {
                  type: Type.STRING,
                  description: '完整原始地址（保留路名、巷弄、門牌號碼與樓層）',
                },
                rawDistrict: {
                  type: Type.STRING,
                  description: '畫面中有出現或可明確判讀的鄉鎮市區名稱（如羅東鎮、冬山鄉、五結鄉、宜蘭市等，無則留空）',
                },
                rawFloor: {
                  type: Type.STRING,
                  description: '樓層資訊（例如 1樓、3樓、3F，無則留空）',
                },
                notes: {
                  type: Type.STRING,
                  description: '備註或配送指示（如放門口、警衛室，無則留空）',
                },
                orderCount: {
                  type: Type.INTEGER,
                  description: '此單據包含的訂單筆數，預設為 1',
                },
                sourceLabel: {
                  type: Type.STRING,
                  description: '來源標記，例如 截圖 #1 或 影格 00:05',
                },
                ocrConfidence: {
                  type: Type.STRING,
                  description: '辨識信心度：high、medium 或 low',
                },
                ocrUncertainReason: {
                  type: Type.STRING,
                  description: '若字跡模糊或路名疑慮，簡述原因',
                },
              },
              required: ['recipientName', 'rawAddress'],
            },
          },
        },
        required: ['orders', 'detectedDisableGeoCluster'],
      },
    },
  });

  const text = (response.text ?? '{}').trim();
  let parsed: {
    detectedDisableGeoCluster?: boolean;
    orders?: Array<{
      recipientName?: string;
      rawAddress?: string;
      rawDistrict?: string;
      rawFloor?: string;
      notes?: string;
      orderCount?: number;
      sourceLabel?: string;
      ocrConfidence?: string;
      ocrUncertainReason?: string;
    }>;
  } = {};

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('模型回傳格式解析失敗，請重試。');
  }

  const orders: RawOrderItem[] = (parsed.orders || []).map((item, idx) => ({
    id: `ocr-${Date.now()}-${idx}`,
    sourceIndex: idx,
    sourceLabel: item.sourceLabel || `畫面 #${idx + 1}`,
    recipientName: (item.recipientName || '未具名收件人').trim(),
    rawAddress: (item.rawAddress || '').trim(),
    rawDistrict: item.rawDistrict?.trim() || undefined,
    rawFloor: item.rawFloor?.trim() || undefined,
    notes: item.notes?.trim() || undefined,
    orderCount: item.orderCount && item.orderCount > 0 ? item.orderCount : 1,
    ocrConfidence:
      item.ocrConfidence === 'low' || item.ocrConfidence === 'medium' ? item.ocrConfidence : 'high',
    ocrUncertainReason: item.ocrUncertainReason?.trim() || undefined,
  }));

  return {
    orders,
    detectedDisableGeoCluster: Boolean(parsed.detectedDisableGeoCluster),
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'yilan-delivery-route-parser-v10' });
  });

  app.post('/api/parse-route', async (req: Request, res: Response) => {
    try {
      const body = (req.body || {}) as ParseRequestBody;
      const images = Array.isArray(body.images) ? body.images : [];
      const rawText = typeof body.rawText === 'string' ? body.rawText : '';
      let requestedSortMode: SortMode = body.sortMode === 'original_order' ? 'original_order' : 'geo_cluster';

      if (images.length === 0 && rawText.trim().length === 0) {
        res.status(400).json({ error: '請上傳至少一張外送截圖／影片，或貼上訂單文字清單。' });
        return;
      }

      let extractedOrders: RawOrderItem[] = [];
      let detectedDisableGeoCluster = /取消地理微聚類|照影片|原始順序|不要聚類|照順序/.test(rawText);

      if (images.length > 0) {
        const geminiResult = await extractOrdersWithGemini(images, rawText);
        extractedOrders = geminiResult.orders;
        if (geminiResult.detectedDisableGeoCluster) {
          detectedDisableGeoCluster = true;
        }
      } else {
        const textResult = parseRawTextToOrders(rawText);
        extractedOrders = textResult.orders;
        if (textResult.detectedDisableGeoCluster) {
          detectedDisableGeoCluster = true;
        }
      }

      if (detectedDisableGeoCluster) {
        requestedSortMode = 'original_order';
      }

      const result = processDeliveryOrders(extractedOrders, requestedSortMode);

      res.json({
        rawOrders: extractedOrders,
        result,
        detectedDisableGeoCluster,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '解析過程發生未預期錯誤';
      console.error('[/api/parse-route] Error:', error);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Delivery Route Parser v10 listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
