"use client";

import { Button } from "@/components/ui/button";
import { Plus, User, Menu } from "lucide-react";
import { NavbarProps } from "@/types";

export function Navbar({ onCreateClick }: NavbarProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
            <div className="h-6 w-6 bg-foreground/20 rounded" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">CultraVista</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onCreateClick}
          >
            <Plus className="h-4 w-4" />
            Create
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
