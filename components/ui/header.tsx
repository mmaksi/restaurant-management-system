import { ReactNode } from 'react';

interface HeaderProps {
  children: ReactNode;
}

const Header = (props: HeaderProps) => {
  const { children } = props;
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">{children}</div>
      </div>
    </header>
  );
};

export default Header;
