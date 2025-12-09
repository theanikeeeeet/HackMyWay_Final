

"use client";
import Link from 'next/link';
import {
  Bell,
  Home,
  Menu,
  PlusCircle,
  Save,
  Shield,
  User as UserIcon,
  LogOut,
  LayoutGrid,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from '../ui/skeleton';
import { toast } from '@/hooks/use-toast';
import type { Notification, WithId } from '@/lib/types';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';


const navLinks = [
  { href: '/', label: 'Explore' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/my-hackathons', label: 'My Hackathons' },
  { href: '/saved', label: 'Saved' },
];

const organizerLinks = [
  { href: '/create-hackathon', label: 'Create Hackathon' },
];

const adminLinks = [
    { href: '/admin', label: 'Admin Dashboard' },
];

const CustomLogo = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        className="h-7 w-7 text-primary"
        >
        <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: 'hsl(var(--accent))', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
            </linearGradient>
        </defs>
        <path
            d="M4 4H8V10H16V4H20V20H16V14H8V20H4V4Z"
            fill="url(#logo-gradient)"
        />
    </svg>
  );

const iconMap = {
    Trophy: <Trophy className="h-4 w-4 mt-1 text-yellow-500"/>,
    PlusCircle: <PlusCircle className="h-4 w-4 mt-1 text-green-500"/>,
    AlertTriangle: <AlertTriangle className="h-4 w-4 mt-1 text-orange-500"/>,
    Bell: <Bell className="h-4 w-4 mt-1 text-blue-500"/>
}


export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, `users/${user.uid}/notifications`),
        orderBy('createdAt', 'desc'),
        limit(5)
    );
  }, [user, firestore]);

  const { data: notifications } = useCollection<Notification>(notificationsQuery);
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully signed out.",
      });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
      });
    }
  };
  
  // TODO: Replace with role from user profile in Firestore
  const userRole = 'student';

  const getNavLinks = () => {
    let links = [
      { href: '/', label: 'Explore' },
      { href: '/leaderboard', label: 'Leaderboard' },
    ];
    if (user) {
        links.push({ href: '/my-hackathons', label: 'Dashboard' });
    }
    return links;
  };
  
  const allLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base font-headline"
        >
          <CustomLogo />
          <span className="sr-only">HackMyWay</span>
        </Link>
        {allLinks.map((link) => (
            <Link
                key={link.href}
                href={link.href}
                className={cn(
                    "transition-colors hover:text-foreground",
                    pathname === link.href ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
            >
            {link.label}
            </Link>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold font-headline mb-4"
            >
              <CustomLogo />
              <span>HackMyWay</span>
            </Link>
            {allLinks.map(link => (
                <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {isUserLoading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-20" />
          </div>
        ) : user ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute top-0 right-0 h-4 w-4 shrink-0 rounded-full p-0 flex items-center justify-center text-xs">{unreadCount}</Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications && notifications.length > 0 ? (
                    notifications.map(notif => (
                         <DropdownMenuItem key={notif.id} asChild>
                            <Link href={notif.link || '/notifications'} className="flex items-start gap-3 cursor-pointer">
                                {notif.icon ? iconMap[notif.icon] : <Bell className="h-4 w-4 mt-1" />}
                                <div className="w-full">
                                    <p className={cn("font-semibold", !notif.isRead && "font-bold")}>{notif.title}</p>
                                    <p className="text-xs text-muted-foreground">{notif.description}</p>
                                    <p className="text-xs text-muted-foreground/80 mt-1">
                                        {formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true })}
                                    </p>
                                </div>
                           </Link>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
                )}
                 <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                    <Link href="/notifications" className="justify-center text-sm text-muted-foreground cursor-pointer">
                        See all notifications
                    </Link>
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.displayName || 'My Account'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile" className="flex items-center"><UserIcon className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/my-hackathons" className="flex items-center"><LayoutGrid className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer"><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex gap-2">
             <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
             </Button>
             <Button asChild>
                <Link href="/signup">Sign Up</Link>
             </Button>
          </div>
        )}
      </div>
    </header>
  );
}
