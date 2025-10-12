'use client';

import { usePathname } from 'next/navigation';

import Logo from '@/components/Logo';
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
} from '@/components/ui/sidebar';
import { SIDEBAR_ITEMS as items } from '@/constants/sidebar';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { ROUTES } from '@/constants/routes';
import AccountBlock from '../admin/AccountBlock';

interface SidebarProps {
  user?: User | null;
}

export default function Sidebar(props: SidebarProps) {
  const { user: initialUser } = props;

  const [user, setUser] = useState<User | null>(initialUser ?? null);

  const { state } = useSidebar();
  const pathname = usePathname();

  // `state` is either 'expanded' or 'collapsed'
  const expanded = state === 'expanded';

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    // Clear local state
    setUser(null);
    if (typeof window !== 'undefined') window.location.href = ROUTES.HOME;
  };

  return (
    <ShadSidebar collapsible="icon">
      <SidebarHeader className="bg-white text-black border-b border-slate-200/60">
        <div className="flex items-center justify-between w-full">
          <div className={cn('flex items-center gap-2', !expanded && 'justify-center')}>
            <Logo alt="Logo" />
            <span
              className={cn(
                'inline-block overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-200 ease text-sm font-bold font-headline tracking-wide',
                expanded ? 'max-w-[10rem] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0',
              )}
              aria-hidden={!expanded}
            >
              BUIDOI HIGHHAND
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white text-black flex flex-col justify-between">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm mb-2">Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'transition-all duration-200 ease-in-out',
                        'hover:bg-slate-100 hover:text-slate-900',
                        isActive && 'bg-slate-900 text-white hover:bg-slate-800 hover:text-white',
                      )}
                    >
                      <a href={item.url}>
                        <item.icon className={cn('transition-colors', isActive && 'text-white')} />
                        <span className={cn('transition-colors', isActive && 'font-medium')}>
                          {item.title}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <AccountBlock
          user={user}
          onSignOut={handleSignOut}
          className="p-4 flex justify-between border-t border-foreground/20 mx-4"
          logoutDisplay="icon"
        />
      </SidebarContent>
    </ShadSidebar>
  );
}
