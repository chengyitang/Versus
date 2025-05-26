'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '../../../lib/utils';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function LeagueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const tabs = [
    { name: 'Overview', href: pathname.split('/').slice(0, 3).join('/') },
    { name: 'Matches', href: `${pathname.split('/').slice(0, 3).join('/')}/matches` },
    { name: 'Players', href: `${pathname.split('/').slice(0, 3).join('/')}/player-stats` },
    { name: 'Settings', href: `${pathname.split('/').slice(0, 3).join('/')}/settings` },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Leagues
      </Link>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div>{children}</div>
    </div>
  );
} 