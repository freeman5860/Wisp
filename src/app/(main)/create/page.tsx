import { CreateWizard } from '@/components/create/create-wizard';

export const metadata = {
  title: '记录此刻',
};

export default function CreatePage() {
  return (
    <main className="min-h-screen">
      <CreateWizard />
    </main>
  );
}
