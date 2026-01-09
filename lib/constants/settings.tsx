import { Building2, Palette, Shield, User, Users } from 'lucide-react';
import ProfileSettings from '@/components/Settings/ProfileSettings';
import ManagerManagement from '@/components/Settings/ManagerManagement';
import RestaurantManagement from '@/components/Settings/RestaurantManagement';
import EmployeeManagement from '@/components/Settings/EmployeeManagement';
import ThemeSettings from '@/components/Settings/ThemeSettings';
import { GetUserProfile } from '@/infra/db/types/db';

export enum SETTINGS_TITLES {
  PROFILE = 'profile',
  MANAGERS = 'managers',
  RESTAURANTS = 'restaurants',
  EMPLOYEES = 'employees',
  APPEARANCE = 'appearance',
}

interface SettingSection {
  id: SETTINGS_TITLES;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  content: React.ReactNode;
}

const ADMIN_SETTINGS: SettingSection[] = [
  {
    id: SETTINGS_TITLES.RESTAURANTS,
    title: 'Restaurant Management',
    description: 'Create and manage your restaurants',
    icon: Building2,
    color: 'bg-purple-500',
    content: <RestaurantManagement />,
  },
  {
    id: SETTINGS_TITLES.MANAGERS,
    title: 'Manager Management',
    description: 'Create and manage managers for your restaurants',
    icon: Shield,
    color: 'bg-green-500',
    content: <ManagerManagement />,
  },
];

const MANAGER_SETTINGS: SettingSection[] = [
  {
    id: SETTINGS_TITLES.EMPLOYEES,
    title: 'Employee Management',
    description: 'Create and manage employees for your restaurants',
    icon: Users,
    color: 'bg-blue-500',
    content: <EmployeeManagement />,
  },
];

const renderSettings = (
  isAdmin: boolean,
  isManager: boolean,
  userProfile: GetUserProfile
): SettingSection[] => {
  return [
    {
      id: SETTINGS_TITLES.PROFILE,
      title: 'Profile Information',
      description: 'Update your personal information and account details',
      icon: User,
      color: 'bg-blue-500',
      content: <ProfileSettings userProfile={userProfile} />,
    },
    ...(isAdmin ? ADMIN_SETTINGS : []),
    ...(isManager ? MANAGER_SETTINGS : []),
    {
      id: SETTINGS_TITLES.APPEARANCE,
      title: 'Appearance',
      description: 'Customize the look and feel of the application',
      icon: Palette,
      color: 'bg-orange-500',
      content: <ThemeSettings />,
    },
  ];
};

export default renderSettings;
