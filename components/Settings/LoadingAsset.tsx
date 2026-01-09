import { Skeleton } from '@/components/ui/skeleton';

const LoadingAssetSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm"
        >
          {/* Header Skeleton */}
          <div className="h-24 bg-gradient-to-br from-slate-200 to-slate-300 relative">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="absolute top-4 left-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-6">
            {/* Title */}
            <Skeleton className="h-7 w-32 mb-4" />

            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-lg" />
                <Skeleton className="h-4 w-40" />
              </div>

              {/* Restaurant */}
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-lg" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingAssetSkeleton;
