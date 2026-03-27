import Link from 'next/link';
import { AuthForm } from '@/components/auth/auth-form';
import { APP_NAME } from '@/lib/constants';

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="mt-2 text-text-secondary">欢迎回来</p>
        </div>
        <AuthForm mode="login" />
        <p className="text-sm text-text-secondary">
          还没有账号？{' '}
          <Link href="/register" className="text-accent hover:underline">
            注册
          </Link>
        </p>
      </div>
    </div>
  );
}
