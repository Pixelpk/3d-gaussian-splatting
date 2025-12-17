"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Plus,
  User,
  Menu,
  Image as ImageIcon,
  CloudUpload,
  HelpCircle,
  CircleHelp,
  X,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const captures = [
    { id: 1, title: "milk", image: "/captures/milk.jpg" },
    { id: 2, title: "aslk", image: "/captures/aslk.jpg" },
    { id: 3, title: "Bottle", image: "/captures/bottle.jpg" },
    {
      id: 4,
      title: "Tai Shen",
      image: "/captures/taishen.jpg",
      status: "Finished",
    },
    { id: 5, title: "Pig2", image: "/captures/pig2.jpg" },
    { id: 6, title: "Temple", image: "/captures/temple.jpg" },
    { id: 7, title: "Park", image: "/captures/park.jpg" },
    { id: 8, title: "Piggy", image: "/captures/piggy.jpg" },
    { id: 9, title: "Studio", image: "/captures/studio.jpg" },
    { id: 10, title: "Laundry", image: "/captures/laundry.jpg" },
    { id: 11, title: "ChaiKang1", image: "/captures/chaikang1.jpg" },
    { id: 12, title: "Lee Woo Seelyard", image: "/captures/leewoo.jpg" },
    { id: 13, title: "ShingShingTai_01", image: "/captures/shingshing.jpg" },
    { id: 14, title: "ChuWingKee360", image: "/captures/chuwingkee.jpg" },
    { id: 15, title: "VR Lab", image: "/captures/vrlab.jpg" },
    { id: 16, title: "MD Cafe 360", image: "/captures/mdcafe360.jpg" },
    { id: 17, title: "MD Cafe 2F", image: "/captures/mdcafe2f.jpg" },
    { id: 18, title: "Media Cafe Ground", image: "/captures/mediacafe.jpg" },
    { id: 19, title: "Chu Wing Kee", image: "/captures/chuwingkee2.jpg" },
    {
      id: 20,
      title: "Chu Wing Kee Door",
      image: "/captures/chuwingkeedoor.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
              <div className="h-6 w-6 bg-foreground/20 rounded" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Fields Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsCreateModalOpen(true)}
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

      {/* Main Content */}
      <main className="mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="Search for your captures"
            className="max-w-3xl bg-card border-border"
          />
        </div>

        {/* Your Captures */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            Your Captures
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {captures.map((capture) => (
              <Card
                key={capture.id}
                className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-ring transition-all"
              >
                <div className="relative aspect-square bg-muted">
                  {/* Placeholder for image */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                  </div>

                  {capture.status && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="text-white text-sm font-medium">
                        {capture.status}
                      </span>
                    </div>
                  )}

                  {/* Image icon in corner */}
                  <div className="absolute bottom-2 right-2 h-6 w-6 bg-muted/80 backdrop-blur-sm rounded flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-foreground/60" />
                  </div>
                </div>

                <div className="p-3 bg-card">
                  <p className="text-sm font-medium text-foreground truncate">
                    {capture.title}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border p-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                Create
              </DialogTitle>
              <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="px-6 py-8">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-border rounded-lg p-16 flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="rounded-full p-4 bg-background/50 group-hover:bg-background transition-colors">
                <CloudUpload className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Drop a file in this area or click to select
              </p>
            </div>

            {/* Help and FAQ Links */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <CircleHelp className="h-4 w-4" />
                Help
              </button>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <CircleHelp className="h-4 w-4" />
                FAQ
              </button>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border flex justify-end">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
