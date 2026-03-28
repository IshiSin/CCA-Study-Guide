import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { ChatPanel } from "@/components/layout/chat-panel"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-body" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "CCA Study Guide — Claude Certified Architect",
  description: "Comprehensive study guide for the Claude Certified Architect (CCA) exam. Interactive quizzes, flashcards, scenarios, and cheatsheets.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
          {/* Desktop theme toggle - fixed position */}
          <div className="hidden md:block fixed bottom-4 right-20 z-50">
            <ThemeToggle />
          </div>
          <ChatPanel />
        </ThemeProvider>
      </body>
    </html>
  )
}
