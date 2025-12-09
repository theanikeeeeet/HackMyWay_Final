
'use client';

import { collection, writeBatch, getDocs, Firestore, serverTimestamp, doc } from 'firebase/firestore';
import hackathonData from './hackathon-data.json';
import { PlaceHolderImages } from './placeholder-images';
import type { Notification } from './types';

function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedNotifications(db: Firestore, userId: string) {
    const notificationsCollection = collection(db, 'users', userId, 'notifications');
    const batch = writeBatch(db);

    const notifications: Omit<Notification, 'id' | 'createdAt'>[] = [
        {
            title: "You won 1st place!",
            description: "Congratulations on winning Innovate India 2024. Your prize will be processed shortly.",
            icon: "Trophy",
            isRead: false,
            link: "/hackathons/hck-001"
        },
        {
            title: "New Hackathon Posted",
            description: "Code for a Cause 2024 is now accepting applications. Check it out!",
            icon: "PlusCircle",
            isRead: false,
            link: "/hackathons/hck-009"
        },
        {
            title: "Deadline Approaching",
            description: "Your submission for the Web3 Challenge is due in 3 days.",
            icon: "AlertTriangle",
            isRead: true,
            link: "/hackathons/hck-004"
        }
    ];

    notifications.forEach(notif => {
        const notifRef = doc(notificationsCollection);
        batch.set(notifRef, { 
            ...notif,
            id: notifRef.id,
            createdAt: serverTimestamp() 
        });
    });

    await batch.commit();
    console.log('Successfully seeded notifications!');
}

export async function seedHackathons(db: Firestore, organizerId: string) {
    const hackathonsCollection = collection(db, 'hackathons');

    // Check if data already exists to prevent duplicates
    const snapshot = await getDocs(hackathonsCollection);
    if (!snapshot.empty) {
        console.log('Hackathon data already exists. Seeding skipped.');
        // Still seed notifications if they don't exist
        const notifSnapshot = await getDocs(collection(db, 'users', organizerId, 'notifications'));
        if (notifSnapshot.empty) {
            await seedNotifications(db, organizerId);
        }
        return { success: true, message: 'Database already contains data. Seeding skipped.' };
    }

    const batch = writeBatch(db);

    // Seed only user-created hackathons, scraper will handle the rest
    const userCreatedHackathons = hackathonData.filter(h => !h.isScraped);

    userCreatedHackathons.forEach((hackathon) => {
        const docRef = doc(db, 'hackathons', hackathon.id);

        let startDate: Date, endDate: Date, registrationDeadline: Date;
        const today = new Date();

        if (hackathon.status === 'Upcoming') {
            startDate = randomDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), new Date(today.getFullYear(), 11, 31));
            endDate = new Date(startDate.getTime() + Math.random() * (14 * 24 * 60 * 60 * 1000) + (2 * 24 * 60 * 60 * 1000));
            registrationDeadline = new Date(startDate.getTime() - (7 * 24 * 60 * 60 * 1000));
        } else if (hackathon.status === 'Ongoing') {
            startDate = randomDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), today);
            endDate = randomDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000));
            registrationDeadline = new Date(startDate.getTime() - (2 * 24 * 60 * 60 * 1000));
        } else { // Ended
            endDate = randomDate(new Date(today.getFullYear(), 0, 1), new Date(today.getTime() - 24 * 60 * 60 * 1000));
            startDate = new Date(endDate.getTime() - Math.random() * (14 * 24 * 60 * 60 * 1000) - (2 * 24 * 60 * 60 * 1000));
            registrationDeadline = new Date(startDate.getTime() - (7 * 24 * 60 * 60 * 1000));
        }
        
        const coverImage = PlaceHolderImages.find(img => img.imageHint === hackathon.imageHint);

        const fullHackathonData = {
            ...hackathon,
            organizerId: organizerId, // Assign the current user as the organizer
            coverImageUrl: coverImage?.imageUrl || 'https://picsum.photos/seed/default/600/400',
            startDate,
            endDate,
            registrationDeadline,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            prize1st: hackathon.prizeMoney,
            prize2nd: 0,
            prize3rd: 0,
            registrationUrl: hackathon.sourceUrl || '#',
        };

        batch.set(docRef, fullHackathonData);
    });

    try {
        await batch.commit();
        await seedNotifications(db, organizerId); // Seed notifications after seeding hackathons
        console.log('Successfully seeded user-created hackathons and notifications!');
        return { success: true, message: `${userCreatedHackathons.length} hackathons have been added to the database.` };
    } catch (error) {
        console.error("Error seeding database: ", error);
        return { success: false, message: 'An error occurred while seeding the database.' };
    }
}
