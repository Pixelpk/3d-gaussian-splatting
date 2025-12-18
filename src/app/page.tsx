"use client";

import { useState } from "react";
import { Navbar } from "@/components/_shared/Navbar";
import { CreateModal } from "@/components/_shared/CreateModal";
import { SearchBar } from "@/components/Home/SearchBar";
import { CaptureGrid } from "@/components/Home/CaptureGrid";

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
      <Navbar onCreateClick={() => setIsCreateModalOpen(true)} />

      <main className="mx-auto px-6 py-8">
        <SearchBar />
        <CaptureGrid captures={captures} />
      </main>

      <CreateModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
