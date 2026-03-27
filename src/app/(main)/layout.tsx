import { Navbar } from '@/components/layout/navbar';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </>
  );
}
