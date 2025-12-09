

import { Timestamp } from "firebase/firestore";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  userType?: 'participant' | 'organization';
  bio?: string;
  skills?: string[];
  college?: string;
  organization?: string;
  createdAt: string | Timestamp;
  xp?: number;
  badges?: string[];
  country?: string;
};


export type Sponsor = {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
};

export type ScheduleItem = {
  time: string;
  event: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type Hackathon = {
  id: string;
  title: string;
  organizerName: string;
  organizerId?: string;
  location: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  prizeMoney: number;
  participantCount?: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  theme: string;
  sourcePlatform?: 'Devfolio' | 'Unstop' | 'MLH' | 'Devpost' | 'HackerEarth' | 'User Created' | 'HackScrapped';
  sourceUrl?: string;
  registrationUrl?: string;
  isScraped: boolean;
  coverImageUrl?: string;
  imageHint?: string;
  description: string;
  registrationDeadline: Date | Timestamp;
  tags?: string[];
  sponsors?: Sponsor[];
  rules?: string[];
  schedule?: ScheduleItem[];
  faqs?: FaqItem[];
  isVerified?: boolean;
  status?: 'Upcoming' | 'Ongoing' | 'Ended';
  city?: string;
  prize1st?: number;
  prize2nd?: number;
  prize3rd?: number;
  maxTeamSize?: number;
  lastUpdated?: Timestamp;
  createdAt?: Timestamp;
};

export type SavedHackathon = {
    hackathonId: string;
    savedAt: Timestamp;
};

export type Notification = {
    id: string;
    title: string;
    description: string;
    createdAt: Timestamp;
    isRead: boolean;
    link?: string;
    icon?: 'Trophy' | 'PlusCircle' | 'AlertTriangle' | 'Bell';
}

// This utility type is useful for documents read from Firestore that include the document ID.
export type WithId<T> = T & { id: string };
