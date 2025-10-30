// src/components/dash/ImageAnalyser.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import FaqWidget from "./FaqWidget";

export default function ImageAnalyser() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
      setDescription("");
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("image", selectedImage);

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/image-analyser`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setDescription(data.description);
    } catch (err) {
      console.error(err);
      setDescription("Failed to analyze image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2">
      <h2 className="text-4xl font-bold mb-5 text-sky-700">
        Medicine Image Analyzer
      </h2>

      {/* Upload Card */}
      <Card className="bg-white shadow">
        <CardHeader>
          <CardTitle className="text-xl">Upload Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded-lg file:mr-4 file:bg-sky-600 file:text-white file:px-4 file:py-2 file:rounded-lg file:cursor-pointer file:hover:bg-sky-700"
            />
            <div className="flex justify-center">
              <Button
                onClick={handleUpload}
                disabled={!selectedImage || loading}
                className="bg-sky-600 hover:bg-sky-700 w-1/2 text-0.5xl"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Image Preview */}
      {selectedImage && (
        <Card className="bg-white shadow mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Selected Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full max-w-md h-60 mx-auto">
              <Image
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                fill
                className="object-contain rounded-lg shadow-md border border-sky-300"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Result Card */}
      {description && (
        <Card className="bg-white shadow mt-8" id="ImageAnalyzer">
          <CardHeader>
            <CardTitle className="text-xl">Extracted Medicine Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-2">
              {description
                ?.split("\n")
                .filter((line) => line.trim() !== "")
                .map((line, index) => {
                  const trimmed = line.trim();

                  // Detect section headings like "Dosage:", "Instructions:", etc.
                  if (/^[A-Z][\w\s]+:$/.test(trimmed)) {
                    return (
                      <h4 key={index} className="font-bold">
                        {trimmed.replace(/\*\*/g, "")}
                      </h4>
                    );
                  }

                  // Detect label + value pairs like "Medicine Name: Paracetamol"
                  if (/^([A-Za-z\s]+):\s*(.*)/.test(trimmed)) {
                    const [label, ...rest] = trimmed.split(":");
                    return (
                      <p key={index}>
                        <strong>{label.replace(/\*\*/g, "").trim()}:</strong>{" "}
                        {rest.join(":").replace(/\*\*/g, "").trim()}
                      </p>
                    );
                  }

                  // Inline bold for **text** inside sentences
                  const parts = trimmed.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return (
                        <strong key={i}>
                          {part.replace(/\*\*/g, "").trim()}
                        </strong>
                      );
                    }
                    return part;
                  });

                  return <p key={index}>{parts}</p>;
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {description && <FaqWidget containerId="ImageAnalyzer" />}
    </div>
  );
}
