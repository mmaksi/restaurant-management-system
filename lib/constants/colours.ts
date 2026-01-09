import { EMPLOYEE_ROLES } from '@/lib/constants';

const COLOURS = {
  GREEN: 'green',
  ORANGE: 'orange',
  BLUE: 'blue',
  WHITE: 'white',
};

type RoleColorScheme = {
  bg: string;
  border: string;
  light: string;
  text: string;
  dotted: string;
};

const ROLE_COLOURS: Record<EMPLOYEE_ROLES, RoleColorScheme> = {
  [EMPLOYEE_ROLES.KITCHEN]: {
    bg: 'bg-orange-500',
    border: 'border-orange-500',
    light: 'bg-orange-100',
    text: 'text-orange-700',
    dotted: 'border-orange-400',
  },
  [EMPLOYEE_ROLES.SERVICE]: {
    bg: 'bg-blue-500',
    border: 'border-blue-500',
    light: 'bg-blue-100',
    text: 'text-blue-700',
    dotted: 'border-blue-400',
  },
  [EMPLOYEE_ROLES.SECURITY]: {
    bg: 'bg-purple-500',
    border: 'border-purple-500',
    light: 'bg-purple-100',
    text: 'text-purple-700',
    dotted: 'border-purple-400',
  },
  [EMPLOYEE_ROLES.ALL]: {
    bg: 'bg-slate-500',
    border: 'border-slate-500',
    light: 'bg-slate-100',
    text: 'text-slate-700',
    dotted: 'border-slate-400',
  },
};

export { COLOURS, ROLE_COLOURS };
