import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const OpenedSettingsSkeleton = () => {
  return (
    <Card className="bg-white rounded-xl shadow-md border-slate-200 overflow-hidden">
      <CardHeader className="hover:bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="w-5 h-5 rounded" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
};

const ClosedSettingsSkeleton = () => {
  return (
    <Card className="bg-white rounded-xl shadow-md border-slate-200 overflow-hidden">
      <CardHeader className="hover:bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Skeleton className="w-5 h-5 rounded" />
        </div>
      </CardHeader>
    </Card>
  );
};

const SettingsLoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      <OpenedSettingsSkeleton />
      <ClosedSettingsSkeleton />
    </div>
  );
};

export default SettingsLoadingSkeleton;
