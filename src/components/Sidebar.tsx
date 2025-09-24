'use client';

import { cn } from '@/lib/utils';
import {
  Sidebar as ShadSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from './ui/sidebar';

import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react';
import { useEffect } from 'react';

// Menu items.
const items = [
  {
    title: 'Home',
    url: '#',
    icon: Home,
  },
  {
    title: 'Inbox',
    url: '#',
    icon: Inbox,
  },
  {
    title: 'Calendar',
    url: '#',
    icon: Calendar,
  },
  {
    title: 'Search',
    url: '#',
    icon: Search,
  },
  {
    title: 'Settings',
    url: '#',
    icon: Settings,
  },
];

export default function Sidebar() {
  const { state } = useSidebar();

  // `state` is either 'expanded' or 'collapsed'
  const expanded = state === 'expanded';

  useEffect(() => {
    try {
      // sync body class and css var so other parts (ContentWrapper) can read it
      if (!expanded) {
        // collapsed
        document.body.classList.add('sidebar-collapsed');
        document.body.style.setProperty('--sidebar-width', '5rem');
      } else {
        // expanded
        document.body.classList.remove('sidebar-collapsed');
        document.body.style.setProperty('--sidebar-width', '16rem');
      }
    } catch {
      // ignore on SSR
    }
  }, [expanded]);

  return (
    <ShadSidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="min-h-8 min-w-8 bg-sky-500 rounded-sm flex items-center justify-center text-white font-bold">
              Q
            </div>
            {/* Animate the label instead of toggling display to avoid layout jumps */}
            <span
              className={cn(
                'inline-block overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-200 ease text-sm',
                expanded ? 'max-w-[10rem] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0',
              )}
              aria-hidden={!expanded}
            >
              Quinn Store
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadSidebar>
  );
}
