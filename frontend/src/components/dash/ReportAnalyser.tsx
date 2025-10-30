// src/components/dash/ReportAnalyser.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangeEvent, useState } from "react";
import FaqWidget from "./FaqWidget";

export default function ReportAnalyser() {
  const [selectedReport, setSelectedReport] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleReportChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedReport(file);
      setAnalysis("");
    }
  };

  const handleUpload = async () => {
    if (!selectedReport) return;

    const formData = new FormData();
    formData.append("report", selectedReport);

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/report-analyser`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      setAnalysis("Failed to analyze report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2">
      <h2 className="text-4xl font-bold mb-5 text-sky-700">
        Medical Report Analyzer
      </h2>

      {/* Upload Card */}
      <Card className="bg-white shadow">
        <CardHeader>
          <CardTitle className="text-xl">Upload Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleReportChange}
              className="w-full p-2 border rounded-lg file:mr-4 file:bg-sky-600 file:text-white file:px-4 file:py-2 file:rounded-lg file:cursor-pointer file:hover:bg-sky-700"
            />
            <div className="flex justify-center">
              <Button
                onClick={handleUpload}
                disabled={!selectedReport || loading}
                className="bg-sky-600 hover:bg-sky-700 w-1/2 text-0.5xl"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Result Card */}
      {analysis && (
        <Card className="bg-white shadow mt-8" id="ReportAnalyzer">
          <CardHeader>
            <CardTitle className="text-xl">Extracted Report Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-2">
              {analysis
                ?.split("\n")
                .filter((line) => line.trim() !== "")
                .map((line, index) => {
                  const trimmed = line.trim();

                  // Detect section headings like "Findings:", "Impression:", "Diagnosis:"
                  if (/^[A-Z][\w\s]+:$/.test(trimmed)) {
                    return (
                      <h4 key={index} className="font-bold">
                        {trimmed.replace(/\*\*/g, "")}
                      </h4>
                    );
                  }

                  // Detect label + value like "Observation: Mild infection"
                  if (/^([A-Za-z\s]+):\s*(.*)/.test(trimmed)) {
                    const [label, ...rest] = trimmed.split(":");
                    return (
                      <p key={index}>
                        <strong>{label.replace(/\*\*/g, "").trim()}:</strong>{" "}
                        {rest.join(":").replace(/\*\*/g, "").trim()}
                      </p>
                    );
                  }

                  // Bold any **word** inside sentences
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

      {analysis && <FaqWidget containerId="ReportAnalyzer" />}
    </div>
  );
}
