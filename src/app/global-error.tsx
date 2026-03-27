'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl text-[#F5F5F3]">出了点问题</h2>
          <p className="text-sm text-[#A0A0A0]">别担心，刷新一下试试</p>
          <button
            onClick={reset}
            className="px-5 py-2 bg-[#E8D5B7] text-[#0A0A0B] rounded-md text-sm font-medium"
          >
            重试
          </button>
        </div>
      </body>
    </html>
  );
}
