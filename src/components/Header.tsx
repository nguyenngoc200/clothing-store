'use client';

import React from 'react';
import { SidebarTrigger } from './ui/sidebar';

export default function Header() {
  return (
    <header className="app-header w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-[#0b0b0b]/50 backdrop-blur">
      <div className="w-full flex items-center justify-between gap-4 px-4 h-14">
        {/* Left: search */}
        <div className="flex items-center gap-2">
          <SidebarTrigger />
        </div>

        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-slate-400"
              >
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="11"
                  cy="11"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              aria-label="Search"
              placeholder="Tìm kiếm..."
              className="block w-full pl-10 pr-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070707] text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>

        {/* Right: notifications + account */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="text-slate-700 dark:text-slate-200"
            >
              <path
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-500 rounded-full">
              3
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-sm font-medium">Quinn</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Admin</span>
            </div>
            <button className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-100">
              <span className="sr-only">Open user menu</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zM4 22c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
