import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://mini-vet.app'),
  title: 'Mini Veterinarian — 宠物智能问诊',
  description: '为有治病需求的宠物主人提供智能用药方案参考，含物种解剖图、护理步骤图解、用药剂量参考、就医决策流程图。',
  keywords: ['宠物问诊', '宠物用药', '宠物健康', '智能问诊', '护理方案', '猫咪', '狗狗', '兔子', '雪貂'],
  authors: [{ name: 'Mini Vet' }],
  openGraph: {
    title: 'Mini Veterinarian — 宠物智能问诊',
    description: '为有治病需求的宠物主人提供智能用药方案参考',
    type: 'website',
    locale: 'zh_CN',
    siteName: 'Mini Veterinarian',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mini Veterinarian — 宠物智能问诊',
    description: '为有治病需求的宠物主人提供智能用药方案参考',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0d9488',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
