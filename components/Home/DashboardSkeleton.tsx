import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl bg-white shadow-md p-6"
          >
            <Skeleton className="w-14 h-14 rounded-lg mb-4" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </>
  );
};

export default DashboardSkeleton;
