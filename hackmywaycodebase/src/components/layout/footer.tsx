
import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

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

export function Footer() {
  return (
    <footer className="border-t bg-background/50">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2 font-headline text-lg font-semibold">
              <CustomLogo />
              <span>HackMyWay</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Discover amazing hackathons across India. 🇮🇳
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-2">
            <div className="grid gap-2">
              <h3 className="font-semibold">Platform</h3>
              <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">Explore</Link>
              <Link href="/create-hackathon" className="text-muted-foreground hover:text-foreground text-sm">Create Hackathon</Link>
              <Link href="/data-sources" className="text-muted-foreground hover:text-foreground text-sm">Data Sources</Link>
            </div>
            <div className="grid gap-2">
                <h3 className="font-semibold">Legal</h3>
                <Link href="/about" className="text-muted-foreground hover:text-foreground text-sm">About Us</Link>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground text-sm">Contact</Link>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm">Terms of Service</Link>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm">Privacy Policy</Link>
            </div>
            <div className="grid gap-2">
              <h3 className="font-semibold">Connect</h3>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></Link>
                <Link href="https://github.com/your-org/your-repo" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Github className="h-5 w-5" /></Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-4">
            <p className="text-center text-sm text-muted-foreground">© {new Date().getFullYear()} HackMyWay. All rights reserved.</p>
            <p className="text-center text-xs text-muted-foreground/80 mt-2">
                Disclaimer: Hackathon information is aggregated from public sources. Please verify details on the official platform before registering.
            </p>
        </div>
      </div>
    </footer>
  );
}
