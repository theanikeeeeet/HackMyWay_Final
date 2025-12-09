
import type {Metadata} from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { Poppins, Space_Grotesk } from 'next/font/google';
import { Providers } from '@/components/layout/providers';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'HackMyWay | Discover Hackathons',
  description: 'A comprehensive hackathon discovery and management platform for Indian students and organizers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('scroll-smooth dark', poppins.variable, spaceGrotesk.variable)}>
      <body className={cn("font-body antialiased min-h-screen bg-background flex flex-col")}>
        <Providers>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
