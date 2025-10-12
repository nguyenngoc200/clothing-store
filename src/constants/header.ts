import { Home, Inbox, Calendar, Settings } from 'lucide-react';
import { ROUTES } from './routes';

export const HEADER_MENU_ITEMS = [
  { title: 'Home', url: ROUTES.HOME, icon: Home },
  { title: 'Inbox', url: ROUTES.INBOX, icon: Inbox },
  { title: 'Calendar', url: ROUTES.CALENDAR, icon: Calendar },
  { title: 'Settings', url: ROUTES.SETTINGS, icon: Settings },
];

export type HeaderMenuItem = (typeof HEADER_MENU_ITEMS)[number];
