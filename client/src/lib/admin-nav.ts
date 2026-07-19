import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Companies', href: '/admin/companies', icon: Building2 },
  { label: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export const logoutItem: NavItem = { label: 'Logout', href: '/admin', icon: LogOut };
