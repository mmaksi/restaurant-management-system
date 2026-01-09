import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface CardInfoProps {
  title: string;
  value: number;
  Icon: LucideIcon;
  color: string;
}

const CardInfo = (props: CardInfoProps) => {
  const { title, value, Icon, color } = props;
  return (
    <Card
      className={`bg-${color}-50 px-4 py-2 flex flex-row gap-0 items-center space-x-2`}
    >
      <Icon className={`w-5 h-5 text-${color}-600`} />
      <div>
        <p className={`text-xs text-${color}-600 font-medium`}>{title}</p>
        <p className={`text-lg font-bold text-${color}-700`}>{value}</p>
      </div>
    </Card>
  );
};

export default CardInfo;
