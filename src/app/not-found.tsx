import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-text-tertiary">404</h1>
        <p className="text-text-secondary">这个页面不存在</p>
        <Link
          href="/"
          className="inline-flex items-center h-10 px-5 bg-accent text-background font-medium rounded-md text-sm"
        >
          回到 {APP_NAME}
        </Link>
      </div>
    </div>
  );
}
