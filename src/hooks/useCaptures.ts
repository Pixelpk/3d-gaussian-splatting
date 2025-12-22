import { useState, useEffect } from "react";
import { getAllCaptures } from "@/actions/captureActions";
import { Capture } from "@/types";

export function useCaptures() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCaptures = async () => {
    try {
      setIsLoading(true);
      const result = await getAllCaptures();

      if (result.success && result.data) {
        setCaptures(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to load captures");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error fetching captures:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptures();
  }, []);

  return {
    captures,
    isLoading,
    error,
    refetch: fetchCaptures,
  };
}
