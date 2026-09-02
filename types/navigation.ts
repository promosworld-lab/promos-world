import type { LucideIcon } from 'lucide-react';
import type { UserRole } from './database';

export interface NavigationItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  roles?: UserRole[];
  badge?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}