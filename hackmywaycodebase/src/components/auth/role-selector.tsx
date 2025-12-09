
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Building } from "lucide-react";

interface RoleSelectorModalProps {
  isOpen: boolean;
  onRoleSelect: (role: "participant" | "organization") => void;
}

export function RoleSelectorModal({ isOpen, onRoleSelect }: RoleSelectorModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">One Last Step!</DialogTitle>
          <DialogDescription>
            How are you planning to use HackMyWay? This will help us personalize your experience.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="h-20 flex items-center justify-start text-left p-4 hover:bg-accent"
            onClick={() => onRoleSelect("participant")}
          >
            <User className="h-8 w-8 mr-4 text-primary" />
            <div>
              <p className="font-semibold text-base">As a Participant</p>
              <p className="text-sm text-muted-foreground">Find & join amazing hackathons.</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex items-center justify-start text-left p-4 hover:bg-accent"
            onClick={() => onRoleSelect("organization")}
          >
            <Building className="h-8 w-8 mr-4 text-primary" />
            <div>
              <p className="font-semibold text-base">As an Organization</p>
              <p className="text-sm text-muted-foreground">Host & manage your hackathon.</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
