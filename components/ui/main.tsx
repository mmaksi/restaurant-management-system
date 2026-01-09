import { ReactNode } from 'react';

interface MainProps {
  children: ReactNode;
}

const Main = (props: MainProps) => {
  const { children } = props;
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  );
};

export default Main;
