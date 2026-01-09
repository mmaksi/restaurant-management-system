import { CardContent } from '@/components/ui/card';
import { ThemeSwitcher } from '@/components/theme-switcher';

const ThemeSettings = () => {
  return (
    <CardContent>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Theme</h3>
          <p className="text-sm text-slate-600">
            Choose your preferred color scheme
          </p>
        </div>
        <ThemeSwitcher />
      </div>
    </CardContent>
  );
};

export default ThemeSettings;
