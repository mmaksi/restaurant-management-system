import { Calendar, Users, ClipboardList } from 'lucide-react';
import StatsCard from '@/components/StatsCard';

const QuickStats = () => {
  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title="Active Employees"
        value={10}
        Icon={<Users className="w-8 h-8 text-blue-600" />}
        iconBgColor="bg-blue-100"
      />

      <StatsCard
        title="Pending Availability"
        value={2}
        Icon={<ClipboardList className="w-8 h-8 text-orange-600" />}
        iconBgColor="bg-orange-100"
      />

      <StatsCard
        title="Next Week Schedule"
        value="Draft"
        Icon={<Calendar className="w-8 h-8 text-green-600" />}
        iconBgColor="bg-green-100"
      />
    </div>
  );
};

export default QuickStats;
