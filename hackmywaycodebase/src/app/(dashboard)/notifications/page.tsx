

"use client";

import { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Trophy, PlusCircle, AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import type { Notification, WithId } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, React.ReactNode> = {
    Trophy: <Trophy className="h-6 w-6 text-yellow-500" />,
    PlusCircle: <PlusCircle className="h-6 w-6 text-green-500" />,
    AlertTriangle: <AlertTriangle className="h-6 w-6 text-orange-500" />,
    Bell: <Bell className="h-6 w-6 text-blue-500" />,
};

function NotificationSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({length: 3}).map((_, i) => (
                 <Card key={i}>
                    <CardContent className="p-4 flex items-start gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-grow space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                        <Skeleton className="h-4 w-1/4" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function NotificationsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'users', user.uid, 'notifications'),
        orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: notifications, isLoading, error } = useCollection<Notification>(notificationsQuery);

  const processedNotifications = useMemo(() => {
    if (!notifications) return [];
    return notifications.map(n => ({
        ...n,
        createdAt: n.createdAt.toDate(),
    } as WithId<Notification>))
  }, [notifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user || !firestore) return;
    const notifRef = doc(firestore, 'users', user.uid, 'notifications', notificationId);
    await updateDoc(notifRef, { isRead: true });
  }

  const markAllAsRead = async () => {
    if (!user || !firestore || !notifications) return;

    const batch = (await import('firebase/firestore')).writeBatch(firestore);
    notifications.forEach(notif => {
        if (!notif.isRead) {
            const notifRef = doc(firestore, 'users', user.uid, 'notifications', notif.id);
            batch.update(notifRef, { isRead: true });
        }
    });
    await batch.commit();
  }
  
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;


  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-4">
            <Bell className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">All Notifications</h1>
                <p className="text-muted-foreground">Here is a list of your recent notifications.</p>
            </div>
        </div>
        <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
            Mark all as read
        </Button>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {isLoading && <NotificationSkeleton />}
        
        {!isLoading && error && (
             <Card>
                <CardContent className="p-12 text-center">
                    <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold">Error Loading Notifications</h2>
                    <p className="text-muted-foreground">{error.message}</p>
                </CardContent>
            </Card>
        )}
        
        {!isLoading && !error && processedNotifications.map((notification) => (
          <Card key={notification.id} className={cn("hover:shadow-md transition-shadow", !notification.isRead && "bg-primary/5 border-primary/20")}>
            <CardContent className="p-4 flex items-start gap-4">
              <div className={cn("bg-muted p-3 rounded-full", !notification.isRead && "bg-primary/10")}>
                {notification.icon ? iconMap[notification.icon] : iconMap['Bell']}
              </div>
              <div className="flex-grow">
                <Link href={notification.link || '#'} onClick={() => handleMarkAsRead(notification.id)}>
                    <p className={cn("font-semibold hover:underline", !notification.isRead && "font-bold")}>{notification.title}</p>
                </Link>
                <p className="text-sm text-muted-foreground">{notification.description}</p>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && processedNotifications.length === 0 && (
            <Card>
                <CardContent className="p-12 text-center">
                    <Bell className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold">No New Notifications</h2>
                    <p className="text-muted-foreground">You're all caught up!</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
