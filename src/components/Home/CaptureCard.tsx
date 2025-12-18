import { Card } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import { CaptureCardProps } from "@/types";

export function CaptureCard({ title, status }: CaptureCardProps) {
  return (
    <Card className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-ring transition-all">
      <div className="relative aspect-square bg-muted">
        {/* Placeholder for image */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
          <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
        </div>

        {status && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-white text-sm font-medium">{status}</span>
          </div>
        )}

        {/* Image icon in corner */}
        <div className="absolute bottom-2 right-2 h-6 w-6 bg-muted/80 backdrop-blur-sm rounded flex items-center justify-center">
          <ImageIcon className="h-4 w-4 text-foreground/60" />
        </div>
      </div>

      <div className="p-3 bg-card">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
      </div>
    </Card>
  );
}
