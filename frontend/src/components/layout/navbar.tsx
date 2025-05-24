'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useSelectedLeague } from '@/hooks/useSelectedLeague';

export function Navbar() {
  const pathname = usePathname();
  const { selectedLeague } = useSelectedLeague();

  const navigation = selectedLeague ? [
    { name: 'Overview', href: `/leagues/${selectedLeague.id}` },
    { name: 'Rankings', href: `/leagues/${selectedLeague.id}/rankings` },
    { name: 'Matches', href: `/leagues/${selectedLeague.id}/matches` },
    { name: 'Player Stats', href: `/leagues/${selectedLeague.id}/player-stats` },
  ] : [
    { name: 'My Leagues', href: '/' },
  ];

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <Link href="/" className="flex flex-shrink-0 items-center">
                  <span className="text-xl font-bold text-blue-600">Versus</span>
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                        pathname === item.href
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              {selectedLeague && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500">
                    {selectedLeague.name}
                  </span>
                </div>
              )}
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={clsx(
                    'block border-l-4 py-2 pl-3 pr-4 text-base font-medium',
                    pathname === item.href
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 