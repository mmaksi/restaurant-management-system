import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className="text-sm text-slate-600">Code error: {params.error}</p>
      ) : (
        <p className="text-sm text-slate-600">An unspecified error occurred.</p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="min-h-svh w-full flex flex-col">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Restaurant Management System
          </h1>
          <p className="text-slate-600 mt-1">Authentication error</p>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <Card className="bg-white shadow-xl rounded-xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Sorry, something went wrong.
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense>
                  <ErrorContent searchParams={searchParams} />
                </Suspense>
                <div className="mt-6">
                  <Link href="/auth/login">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                      Return to Login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
