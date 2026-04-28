'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ChatMessage,
  DiseasePrediction,
  PredictionResult,
  SymptomCheckbox,
} from '@/lib/api';

export type DiagnosisStep = 'input' | 'symptoms' | 'diagnosis' | 'followup';

export interface DiagnosisSession {
  id: string;
  timestamp: Date;
  description: string;
  checkedSymptoms: string[];
  predictions: DiseasePrediction[];
  diagnosisText: string;
  followUpHistory: ChatMessage[];
}

interface AppState {
  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

  // Current diagnosis flow
  step: DiagnosisStep;
  setStep: (step: DiagnosisStep) => void;

  // Symptom input
  userDescription: string;
  setUserDescription: (desc: string) => void;

  // Symptom checkboxes
  symptomCheckboxes: SymptomCheckbox[];
  setSymptomCheckboxes: (boxes: SymptomCheckbox[]) => void;
  toggleSymptom: (key: string) => void;
  clarifyingMessage: string;
  setClarifyingMessage: (msg: string) => void;
  followUpQuestion: string | null;
  setFollowUpQuestion: (q: string | null) => void;

  // Diagnosis results
  predictionResult: PredictionResult | null;
  setPredictionResult: (result: PredictionResult | null) => void;
  diagnosisText: string;
  setDiagnosisText: (text: string) => void;
  isStreaming: boolean;
  setIsStreaming: (v: boolean) => void;

  // Follow-up chat
  chatHistory: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  // Preferred model
  preferredModel: string;
  setPreferredModel: (model: string) => void;

  // User's own Gemini API key (optional — overrides server env key)
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;

  // Dynamically fetched models for the current API key (NOT persisted)
  fetchedModels: string[];
  setFetchedModels: (models: string[]) => void;

  // Session history
  sessions: DiagnosisSession[];
  addSession: (session: DiagnosisSession) => void;
  clearSessions: () => void;

  // Loading/error
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  error: string | null;
  setError: (err: string | null) => void;

  // Reset flow
  resetFlow: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // Step
      step: 'input',
      setStep: (step) => set({ step }),

      // Input
      userDescription: '',
      setUserDescription: (userDescription) => set({ userDescription }),

      // Checkboxes
      symptomCheckboxes: [],
      setSymptomCheckboxes: (symptomCheckboxes) => set({ symptomCheckboxes }),
      toggleSymptom: (key) =>
        set((state) => ({
          symptomCheckboxes: state.symptomCheckboxes.map((cb) =>
            cb.symptom_key === key ? { ...cb, checked: !cb.checked } : cb
          ),
        })),
      clarifyingMessage: '',
      setClarifyingMessage: (clarifyingMessage) => set({ clarifyingMessage }),
      followUpQuestion: null,
      setFollowUpQuestion: (followUpQuestion) => set({ followUpQuestion }),

      // Diagnosis
      predictionResult: null,
      setPredictionResult: (predictionResult) => set({ predictionResult }),
      diagnosisText: '',
      setDiagnosisText: (diagnosisText) => set({ diagnosisText }),
      isStreaming: false,
      setIsStreaming: (isStreaming) => set({ isStreaming }),

      // Chat
      chatHistory: [],
      addChatMessage: (msg) =>
        set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
      clearChat: () => set({ chatHistory: [] }),

      // Model
      preferredModel: '',
      setPreferredModel: (preferredModel) => set({ preferredModel }),

      // Gemini API key
      geminiApiKey: '',
      setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),

      // Fetched models (runtime only — not persisted)
      fetchedModels: [],
      setFetchedModels: (fetchedModels) => set({ fetchedModels }),

      // Sessions
      sessions: [],
      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 20),
        })),
      clearSessions: () => set({ sessions: [] }),

      // Loading/Error
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      error: null,
      setError: (error) => set({ error }),

      // Reset
      resetFlow: () =>
        set({
          step: 'input',
          userDescription: '',
          symptomCheckboxes: [],
          clarifyingMessage: '',
          followUpQuestion: null,
          predictionResult: null,
          diagnosisText: '',
          isStreaming: false,
          chatHistory: [],
          error: null,
          isLoading: false,
        }),
    }),
    {
      name: 'medai-store',
      // fetchedModels intentionally excluded — always re-fetched at runtime
      partialize: (state) => ({
        theme: state.theme,
        preferredModel: state.preferredModel,
        geminiApiKey: state.geminiApiKey,
        sessions: state.sessions,
      }),
    }
  )
);
