import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Restaurant Management System',
  description: 'Comprehensive restaurant management and scheduling platform',
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  display: 'swap',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 scroll-smooth">
              {children}
            </div>
            <Toaster richColors={true} position="bottom-right" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
