import { Suspense } from 'react';
import Main from '@/components/ui/main';
import Header from '@/components/ui/header';
import SettingsLoadingSkeleton from '@/components/Settings/SettingsLoadingSkeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import SettingsDataLoader from '@/components/Settings/SettingsDataLoader';

export default function SettingsPage() {
  return (
    <>
      <Header>
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 text-sm">
              Configure your dashboard preferences and manage your account
            </p>
          </div>
        </div>
      </Header>
      <Main>
        <Suspense fallback={<SettingsLoadingSkeleton />}>
          <SettingsDataLoader />
        </Suspense>
      </Main>
    </>
  );
}
