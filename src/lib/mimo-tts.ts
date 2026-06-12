import "server-only";

type MimoAudioResponse = {
  choices?: Array<{
    message?: {
      audio?: {
        data?: string;
      };
    };
  }>;
};

export type MimoTtsResult = {
  audio: Uint8Array;
  format: string;
  voice: string;
  model: string;
};

function getMimoConfig() {
  const apiKey = process.env.MIMO_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    baseURL: process.env.MIMO_BASE_URL || "https://api.xiaomimimo.com/v1",
    model: process.env.MIMO_TTS_MODEL || "mimo-v2.5-tts",
    voice: process.env.MIMO_TTS_VOICE || "Chloe",
    format: process.env.MIMO_TTS_FORMAT || "mp3"
  };
}

function cleanText(text: string) {
  return text.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").trim().slice(0, 1200);
}

export async function synthesizeMimoSpeech(text: string, style = "平静、清晰、有说服力"): Promise<MimoTtsResult | null> {
  const config = getMimoConfig();
  const spokenText = cleanText(text);
  if (!config || !spokenText) return null;

  const endpoint = `${config.baseURL.replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "api-key": config.apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "assistant", content: `<style>${style}</style>${spokenText}` }],
      audio: {
        voice: config.voice,
        format: config.format
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Mimo TTS 请求失败：${response.status}`);
  }

  const json = (await response.json()) as MimoAudioResponse;
  const data = json.choices?.[0]?.message?.audio?.data;
  if (!data) {
    throw new Error("Mimo TTS 响应缺少音频数据");
  }

  return {
    audio: Buffer.from(data, "base64"),
    format: config.format,
    voice: config.voice,
    model: config.model
  };
}
