'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart4,
  Settings,
  UserCircle,
  BookmarkCheck,
  Dumbbell,
  Newspaper,
  ChevronDown,
  Building
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Calendar',
      href: '/dashboard/bookings/calendar',
      icon: Calendar,
    },
    {
      title: 'Classes',
      href: '/dashboard/classes',
      icon: BookOpen,
    },
    {
      title: 'Exercise Types',
      href: '/dashboard/exercise-types',
      icon: Dumbbell,
    },
    {
      title: 'Instructors',
      href: '/dashboard/instructors',
      icon: UserCircle,
    },
    {
      title: 'Customers',
      href: '/dashboard/customers',
      icon: Users,
    },
    {
      title: 'Bookings',
      href: '/dashboard/bookings',
      icon: BookmarkCheck,
    },
    {
      title: 'News & Events',
      icon: Newspaper,
      children: [
        {
          title: 'Articles',
          href: '/dashboard/news',
        },
        {
          title: 'Categories',
          href: '/dashboard/news/categories',
        },
      ],
    },
    {
      title: 'Reports',
      href: '/dashboard/reports',
      icon: BarChart4,
    },    
    {
      title: 'Vendors',
      href: '/dashboard/vendors',
      icon: Building,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className={cn("h-8 w-8", collapsed ? "mx-auto" : "")} />
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight">SHARE CRM</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">
            {collapsed ? 'Expand' : 'Collapse'} sidebar
          </span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => {
            if (item.children) {
              return (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                        pathname.startsWith('/dashboard/news')
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground',
                        collapsed && 'justify-center px-2'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn('h-5 w-5', collapsed && 'h-6 w-6')} />
                        {!collapsed && <span>{item.title}</span>}
                      </div>
                      {!collapsed && <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side={collapsed ? 'right' : 'bottom'}
                    className={cn('w-56', collapsed && 'ml-2')}
                  >
                    {item.children.map((child, childIndex) => (
                      <DropdownMenuItem key={childIndex} asChild>
                        <Link
                          href={child.href}
                          className={cn(
                            'w-full',
                            pathname === child.href && 'bg-accent text-accent-foreground'
                          )}
                        >
                          {child.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <item.icon className={cn('h-5 w-5', collapsed && 'h-6 w-6')} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}