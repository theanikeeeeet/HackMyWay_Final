import type { UserProfile } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  return image ? { url: image.imageUrl, hint: image.imageHint } : { url: 'https://picsum.photos/seed/error/1200/600', hint: 'placeholder image' };
};

const now = new Date();

export const users: UserProfile[] = [
  { id: '1', name: 'Aisha Sharma', email: 'aisha@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=aisha', userType: 'participant', college: 'IIT Bombay', createdAt: now.toISOString() },
  { id: '2', name: 'Rohan Verma', email: 'rohan@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=rohan', userType: 'organization', organization: 'TechMinds', createdAt: now.toISOString() },
  { id: '3', name: 'Admin User', email: 'admin@hacktrack.com', avatarUrl: 'https://i.pravatar.cc/150?u=admin', createdAt: now.toISOString() },
];
