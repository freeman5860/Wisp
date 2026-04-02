'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, Map, User, LogOut, Compass } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/explore', icon: Compass, label: '探索' },
  { href: '/create', icon: Plus, label: '记录' },
  { href: '/map', icon: Map, label: '地图' },
  { href: '/profile', icon: User, label: '我的' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      {/* Desktop top bar */}
      <nav className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-lg font-bold tracking-wider">
          {APP_NAME}
        </Link>
        <div className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-1.5 text-sm transition-colors',
                pathname === item.href
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] border-t border-border bg-background/90 backdrop-blur-md z-50">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-4 py-1 transition-colors',
              pathname === item.href
                ? 'text-accent'
                : 'text-text-tertiary'
            )}
          >
            <item.icon className={cn('w-5 h-5', item.href === '/create' && 'w-6 h-6')} />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
