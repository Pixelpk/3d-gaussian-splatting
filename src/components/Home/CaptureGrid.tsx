import { CaptureCard } from "./CaptureCard";
import { CaptureGridProps } from "@/types";

export function CaptureGrid({ captures }: CaptureGridProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-foreground">
        Your Captures
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {captures.map((capture) => (
          <CaptureCard
            key={capture.id}
            id={capture.id}
            title={capture.title}
            image={capture.image}
            status={capture.status}
          />
        ))}
      </div>
    </div>
  );
}
