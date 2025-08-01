export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL,
 
  ENDPOINTS: {
    CHAT: process.env.API_CHAT_ENDPOINT,
    PROCHAT: process.env.API_PRO_CHAT_ENDPOINT,
    TTS: process.env.API_TTS_ENDPOINT,
    MODELS: process.env.API_MODELS_ENDPOINT,
    CONVERSATIONS: {
      LIST: process.env.API_CONVERSATION_LIST,
      CREATE: process.env.API_CONVERSATION_CREATE,
      GENERATE_TITLE: process.env.API_CONVERSATION_GENERATE_TITLE,
      UPDATE: process.env. API_CONVERSATION_UPDATE,
      DELETE: process.env.API_CONVERSATION_DELETE,
    },
    AUTH: {
      LOGIN: process.env.API_AUTH_LOGIN_ENDPOINT,
      REGISTER: process.env.API_AUTH_REGISTER_ENDPOINT,
      SEND_OTP: process.env.API_AUTH_SEND_OTP_ENDPOINT,
      VERIFY_OTP: process.env.API_AUTH_VERIFY_OTP_ENDPOINT,
      REFRESH_TOKEN: process.env.API_AUTH_REFRESH_TOKEN_ENDPOINT,
      SOCIAL: process.env.API_SOCIAL_ENDPOINT,
    }
  },
 
  DEFAULT_MODEL: process.env.DEFAULT_MODEL,
 
  HEADERS: {
    COMMON: {
      'Content-Type': 'application/json',
    },
    CHAT: {
      'Accept': 'text/event-stream',
    },
    TTS: {
      'Accept': 'audio/mpeg',
    },
    MODELS: {
      'Accept': 'application/json',
    },
    AUTH: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  },
};

export const getApiUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};

export const getConversationUrl = (type: 'LIST' | 'CREATE' | 'GENERATE_TITLE', id?: string): string => {
  const baseUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONVERSATIONS[type]}`;
  return id ? `${baseUrl}/${id}` : baseUrl;
};

export const getAuthUrl = (type: 'LOGIN' | 'REGISTER' | 'SEND_OTP' | 'VERIFY_OTP' | 'REFRESH_TOKEN' | 'SOCIAL'): string => {
  const authEndpoint = API_CONFIG.ENDPOINTS.AUTH[type];
  if (authEndpoint) {
    return `${API_CONFIG.BASE_URL}${authEndpoint}`;
  }
  throw new Error(`Auth endpoint for ${type} is not defined`);
};

export const API_BASE_URL = API_CONFIG.BASE_URL;
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;
export const DEFAULT_MODEL = API_CONFIG.DEFAULT_MODEL;