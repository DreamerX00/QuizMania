import './globals.css';
import { Inter, Orbitron } from 'next/font/google';
import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-orbitron', display: 'swap' });

export const metadata: Metadata = {
  title: "QuizMania - Interactive Quiz Platform",
  description: "Create, take, and share interactive quizzes with AI-powered generation",
  keywords: ["quiz", "education", "learning", "interactive", "AI", "gamification"],
  authors: [{ name: "QuizMania Team" }],
  openGraph: {
    title: "QuizMania - Interactive Quiz Platform",
    description: "Create, take, and share interactive quizzes with AI-powered generation",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuizMania - Interactive Quiz Platform",
    description: "Create, take, and share interactive quizzes with AI-powered generation",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${orbitron.variable} ${inter.className}`} suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
