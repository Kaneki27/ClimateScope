
import type { Metadata } from "next";
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script'; // Import the Next.js Script component
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "ClimateScope - Interactive Climate Visualizer",
  description: "Explore, simulate, and understand climate change impacts.",
};

// Chatbase initialization script content
const chatbaseInitializationScript = `
(function(){
  if (!window.chatbase || (typeof window.chatbase.getState === 'function' && window.chatbase.getState() !== "initialized")) {
    // Store original chatbase function if it exists and is the proxy target
    let q_array = [];
    const pusherFunction = function() { q_array.push(Array.from(arguments)); };
    pusherFunction.q = q_array;

    window.chatbase = new Proxy(pusherFunction, {
      get(target, prop) {
        if (prop === 'q') {
          return target.q;
        }
        // For chatbase.methodName(arg1, arg2)
        return function() {
          target.apply(this, [prop].concat(Array.from(arguments)));
        };
      },
      // For chatbase(arg1, arg2)
      apply(target, thisArg, argumentsList) {
        target.apply(thisArg, Array.from(argumentsList));
      }
    });
  }
})();
`;


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script for Chatbase initialization */}
        <script dangerouslySetInnerHTML={{ __html: chatbaseInitializationScript }} />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable, geistMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell>{children}</AppShell>
          <Toaster />
        </ThemeProvider>
        
        {/* Chatbase embed script loaded using Next.js Script component */}
        <Script
          src="https://www.chatbase.co/embed.min.js"
          id="cu5p7Re_5TJU0RE8UAlUR" // This is your Chatbot ID
          strategy="afterInteractive"
          // Add custom attributes like 'domain' if required by Chatbase's embed.min.js
          // For standard data attributes, use data-domain="www.chatbase.co"
          // For the user's script which sets `script.domain`, we pass it directly.
          // Next.js <Script> passes through unknown props to the script tag.
          domain="www.chatbase.co" 
        />
      </body>
    </html>
  );
}
