'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, MouseEvent } from 'react';

interface UnsavedChangesLinkProps {
  href: string;
  children: ReactNode;
  hasUnsavedChanges: boolean;
  message?: string;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: unknown;
}

/**
 * Link component that warns users about unsaved changes before navigating
 */
export default function UnsavedChangesLink({
  href,
  children,
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  onClick,
  className,
  ...props
}: UnsavedChangesLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      const shouldLeave = window.confirm(message);
      if (shouldLeave) {
        router.push(href);
      }
      return;
    }

    onClick?.(e);
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}
