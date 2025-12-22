"use client";

import { Button } from "../ui/button";
import { convertPlyWithLambda } from "@/actions/lambdaActions";
import { useState, useRef } from "react";

const Convert = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".ply")) {
        setError("Please select a PLY file");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const convert = async () => {
    setIsConverting(true);
    setError(null);

    try {
      // Call Lambda function
      const response = await convertPlyWithLambda();

      // if (!response.success) {
      //   throw new Error("Conversion failed");
      // }

      console.log("Conversion response:", response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Conversion failed";
      setError(errorMessage);
      console.error("Conversion error:", err);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".ply"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="flex gap-3">
        <Button onClick={convert} disabled={isConverting}>
          {isConverting ? "Converting..." : "Convert to SPLAT"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Convert;
