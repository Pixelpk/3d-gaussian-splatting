"use client";

import { useState } from "react";
import { Navbar } from "@/components/_shared/Navbar";
import { CreateModal } from "@/components/_shared/CreateModal";
import { SearchBar } from "@/components/Home/SearchBar";
import { CaptureGrid } from "@/components/Home/CaptureGrid";
import { useCaptures } from "@/hooks/useCaptures";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { captures, isLoading, error, refetch } = useCaptures();

  const handleUploadComplete = () => {
    // Refetch captures when upload modal is closed
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCreateClick={() => setIsCreateModalOpen(true)} />

      <main className="mx-auto px-6 py-8">
        <SearchBar />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <CaptureGrid captures={captures} />
        )}
      </main>

      <CreateModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
