import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://medai-backend-production-a830.up.railway.app';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'key1';

// ─────────────────────────────────────────
// Helper: get user's Gemini key from store at call time
// (we import lazily to avoid SSR/circular issues)
// ─────────────────────────────────────────
function getGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem('medai-store');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return (parsed?.state?.geminiApiKey || '').trim();
  } catch {
    return '';
  }
}

// Build headers for a request, injecting the Gemini key when available
function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Api-Key': API_KEY,
    ...extra,
  };
  const geminiKey = getGeminiKey();
  if (geminiKey) {
    headers['X-Gemini-Key'] = geminiKey;
  }
  return headers;
}

export const apiClient = axios.create({
  baseURL: API_URL,
});

// Intercept every request to inject fresh headers
apiClient.interceptors.request.use((config) => {
  const geminiKey = getGeminiKey();
  config.headers['Content-Type'] = 'application/json';
  config.headers['X-Api-Key'] = API_KEY;
  if (geminiKey) {
    config.headers['X-Gemini-Key'] = geminiKey;
  }
  return config;
});

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SymptomCheckbox {
  symptom_key: string;
  symptom_label: string;
  checked: boolean;
}

export interface SymptomCheckboxResponse {
  clarifying_message: string;
  checkboxes: SymptomCheckbox[];
  follow_up_question?: string;
}

export interface DiseasePrediction {
  disease_name: string;
  probability: number;
  rank: number;
  rag_symptom_match: boolean;
  matched_symptoms: string[];
}

export interface PredictionResult {
  top_diseases: DiseasePrediction[];
  checked_symptoms: string[];
}

export interface HealthResponse {
  status: string;
  version: string;
  available_models: string[];
}

// ─────────────────────────────────────────
// Error detection in streamed responses
// ─────────────────────────────────────────

// Patterns the backend embeds inline when Gemini / pipeline fails mid-stream
const STREAM_ERROR_PATTERNS = [
  /^\s*⚠️\s*(Error|An error)[:\s]/i,
  /Gemini API error/i,
  /quota.*exceeded/i,
  /429.*rate.?limit/i,
  /Invalid operation.*response\.text/i,
  /finish_reason/i,
];

function isStreamError(text: string): boolean {
  return STREAM_ERROR_PATTERNS.some((re) => re.test(text));
}

/** Extract a human-friendly message from a raw backend error string */
function friendlyError(raw: string): string {
  // Strip leading emoji / whitespace
  let msg = raw.replace(/^[\s⚠️]+/, '').replace(/^Error[:\s]*/i, '').trim();

  if (/quota.*exceeded/i.test(msg) || /429/i.test(msg)) {
    return 'The AI service is temporarily rate-limited. Please wait a moment and try again, or use your own Gemini API key in Settings.';
  }
  if (/Invalid operation.*response\.text/i.test(msg) || /finish_reason/i.test(msg)) {
    return 'The AI model returned an empty response. This can happen with certain queries — please try rephrasing your question.';
  }
  if (msg.length > 200) {
    msg = msg.slice(0, 180) + '…';
  }
  return msg || 'An unexpected error occurred. Please try again.';
}

// ─────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────

export async function analyzeDescription(
  description: string,
  history: ChatMessage[] = []
): Promise<SymptomCheckboxResponse> {
  const { data } = await apiClient.post('/analyze-description', {
    description,
    history,
  });
  return data;
}

export async function generateDiagnosisStream(
  checkedSymptoms: string[],
  description: string,
  history: ChatMessage[] = [],
  preferredModel?: string,
  onPrediction?: (result: PredictionResult) => void,
  onChunk?: (chunk: string) => void
): Promise<void> {
  const response = await fetch(`${API_URL}/generate-diagnosis`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({
      checked_symptoms: checkedSymptoms,
      description,
      history,
      preferred_model: preferredModel,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  let streamErrorMsg = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('[PREDICTION_JSON]')) {
        try {
          onPrediction?.(JSON.parse(line.replace('[PREDICTION_JSON]', '')));
        } catch { /* ignore */ }
      } else if (line) {
        // Detect inline errors from backend and surface them properly
        if (isStreamError(line)) {
          streamErrorMsg += line + '\n';
        } else {
          onChunk?.(line + '\n');
        }
      }
    }
  }

  // Flush remaining buffer
  if (buffer) {
    if (buffer.startsWith('[PREDICTION_JSON]')) {
      try { onPrediction?.(JSON.parse(buffer.replace('[PREDICTION_JSON]', ''))); } catch { /* ignore */ }
    } else if (isStreamError(buffer)) {
      streamErrorMsg += buffer;
    } else {
      onChunk?.(buffer);
    }
  }

  // If the stream contained errors, throw so the UI can handle them
  if (streamErrorMsg) {
    throw new Error(friendlyError(streamErrorMsg));
  }
}

export async function followUpStream(
  question: string,
  history: ChatMessage[] = [],
  contextDiseases: string[] = [],
  preferredModel?: string,
  onChunk?: (chunk: string) => void
): Promise<void> {
  const response = await fetch(`${API_URL}/followup`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({
      question,
      history,
      context_diseases: contextDiseases,
      preferred_model: preferredModel,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let streamErrorMsg = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    if (isStreamError(text)) {
      streamErrorMsg += text;
    } else {
      onChunk?.(text);
    }
  }

  if (streamErrorMsg) {
    throw new Error(friendlyError(streamErrorMsg));
  }
}

export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get('/health');
  return data;
}

// ─────────────────────────────────────────
// Fetch models available to a Gemini API key
// Calls Google's REST endpoint directly from the browser
// ─────────────────────────────────────────

export interface GeminiModelInfo {
  id: string;           // e.g. "gemini-2.0-flash"
  displayName: string;  // e.g. "Gemini 2.0 Flash"
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedMethods: string[];
}

export async function fetchGeminiModels(apiKey: string): Promise<GeminiModelInfo[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}&pageSize=100`;

  const res = await fetch(url, { method: 'GET' });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body?.error?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  const data = await res.json();
  const models: GeminiModelInfo[] = [];

  for (const m of data.models ?? []) {
    const methods: string[] = m.supportedGenerationMethods ?? [];
    // Only include models that can actually generate text
    if (!methods.includes('generateContent')) continue;

    // Extract short ID from "models/gemini-2.0-flash" → "gemini-2.0-flash"
    const id = (m.name as string).replace(/^models\//, '');

    // Skip non-Gemini models (e.g. embedding models listed here)
    if (!id.startsWith('gemini')) continue;

    models.push({
      id,
      displayName: m.displayName ?? id,
      description: m.description ?? '',
      inputTokenLimit: m.inputTokenLimit ?? 0,
      outputTokenLimit: m.outputTokenLimit ?? 0,
      supportedMethods: methods,
    });
  }

  // Sort: stable → flash → pro → experimental, then alphabetical within each group
  const rank = (id: string) => {
    if (id.includes('exp') || id.includes('preview')) return 3;
    if (id.includes('pro')) return 2;
    if (id.includes('flash')) return 1;
    return 0;
  };

  return models.sort((a, b) => {
    const rd = rank(b.id) - rank(a.id);
    return rd !== 0 ? rd : a.id.localeCompare(b.id);
  });
}
