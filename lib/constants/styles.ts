import { ChefHat, Users, Shield } from 'lucide-react';
import { EMPLOYEE_ROLES } from '@/lib/constants';

type RoleStyle = {
  bg: string;
  text: string;
  border: string;
  icon: typeof ChefHat;
};

const ROLE_STYLES: Record<EMPLOYEE_ROLES, RoleStyle> = {
  [EMPLOYEE_ROLES.KITCHEN]: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: ChefHat,
  },
  [EMPLOYEE_ROLES.SERVICE]: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Users,
  },
  [EMPLOYEE_ROLES.SECURITY]: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: Shield,
  },
  [EMPLOYEE_ROLES.ALL]: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: Users,
  },
};

export default ROLE_STYLES;
