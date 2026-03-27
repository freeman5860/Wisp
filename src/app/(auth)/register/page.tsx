import Link from 'next/link';
import { AuthForm } from '@/components/auth/auth-form';
import { APP_NAME } from '@/lib/constants';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="mt-2 text-text-secondary">开始记录你的情绪</p>
        </div>
        <AuthForm mode="register" />
        <p className="text-sm text-text-secondary">
          已有账号？{' '}
          <Link href="/login" className="text-accent hover:underline">
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}
