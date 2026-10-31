import {
  LayoutDashboard, GraduationCap, BookOpen, Ban, Globe,
  Award, FileText, ScrollText, Users as UsersIcon, Settings,
} from 'lucide-react';

export const NAV_ITEMS = [
  { title: 'Dashboard',            view: 'homepage',     Icon: LayoutDashboard },
  { title: 'Universities',         view: 'stock',        Icon: GraduationCap },
  { title: 'Accredited Programs',  view: 'programs',     Icon: BookOpen },
  { title: 'Suspensions',          view: 'suspensions',  Icon: Ban },
  { title: 'Foreign Applications', view: 'foreign',      Icon: Globe },
  { title: 'Certificates',         view: 'certificates', Icon: Award },
  { title: 'Verification Reports', view: 'report',       Icon: FileText },
  { title: 'Audit Logs',           view: 'audit',        Icon: ScrollText },
  { title: 'University Accounts',  view: 'users',        Icon: UsersIcon },
  { title: 'Settings',             view: 'settings',     Icon: Settings },
];