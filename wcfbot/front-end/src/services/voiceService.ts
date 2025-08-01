import { API_CONFIG } from "@/app/api/config";

export const fetchTTSAudio = async (text: string): Promise<Response> => {
  const payload = {
    text,
    voice: "ame",
    model: "pawa-tts-v1-20250704",
    max_tokens: 65536,
    temperature: 0.5,
    top_p: 0.95,
    repetition_penalty: 1.1,
  };

  console.log("Sending TTS payload:", payload);
  console.log("TTS API URL:", "/api/tts");
  console.log("TTS Headers:", {
    ...API_CONFIG.HEADERS.COMMON,
    ...API_CONFIG.HEADERS.TTS,
    "Content-Type": "application/json",
  });

  const response = await fetch("/api/tts", {
    method: "POST",
    headers: {
      ...API_CONFIG.HEADERS.COMMON,
      ...API_CONFIG.HEADERS.TTS,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log("TTS Response status:", response.status);
  console.log("TTS Response headers:", Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error("TTS Service error response:", errorText);
    throw new Error(`TTS API request failed: ${response.status} - ${errorText}`);
  }

  return response;
};

export const transcribeAudio = async (file: File): Promise<{ text: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "pawa-stt-v1-20240701");
  formData.append("language", "sw"); // Swahili language
  formData.append("temperature", "0.5");

  console.log("Sending VTS request with file:", file.name);

  const response = await fetch("/api/vts", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Speech-to-text API request failed: ${response.status}`);
  }

  return await response.json();
};

