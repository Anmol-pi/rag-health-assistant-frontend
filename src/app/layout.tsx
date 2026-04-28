import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: 'MedAI — Intelligent Medical Diagnostic Assistant',
  description: 'AI-powered medical diagnostic assistant using XGBoost, RAG, and Gemini for intelligent disease prediction and personalized health insights.',
  keywords: ['medical AI', 'disease prediction', 'diagnostic assistant', 'health AI', 'symptom checker'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
