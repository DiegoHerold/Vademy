import './globals.css';
import type { Metadata } from 'next';
import { Inter, Source_Sans_3 } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const sourceSans3 = Source_Sans_3({ 
  subsets: ['latin'], 
  variable: '--font-source-sans-3',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vademy - Code Learning Platform',
  description: 'Learn to code with interactive repositories and tutorials',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${inter.variable} ${sourceSans3.variable} font-sans antialiased min-h-screen bg-background`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1" role="main">
                {children}
              </main>
              <footer className="border-t py-6 md:py-0" role="contentinfo">
                <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-12 md:flex-row">
                  <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Built with Next.js and Tailwind CSS. © 2024 Vademy.
                  </p>
                </div>
              </footer>
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
