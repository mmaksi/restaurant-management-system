import { SignUpForm } from '@/components/sign-up-form';

export default function Page() {
  return (
    <div className="min-h-svh w-full flex flex-col">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Restaurant Management System
          </h1>
          <p className="text-slate-600 mt-1">Create your account</p>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
