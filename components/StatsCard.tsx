import { JSX } from 'react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: number | string;
  Icon: JSX.Element;
  iconBgColor: string;
}

const StatsCard = (props: StatsCardProps) => {
  const { title, value, Icon, iconBgColor } = props;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconBgColor}`}>{Icon}</div>
      </div>
    </Card>
  );
};

export default StatsCard;
