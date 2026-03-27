import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import { Toaster } from 'sonner';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-noto-sc',
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${notoSansSC.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--background-raised)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            },
          }}
        />
      </body>
    </html>
  );
}
