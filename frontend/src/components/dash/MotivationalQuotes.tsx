//frontend/src/components/dash/MotivationalQuotes.tsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Quote, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MotivationalQuotes() {
  const [quote, setQuote] = useState("Loading motivational quote...");
  const [loadingQuote, setLoadingQuote] = useState(false);

  const fetchQuote = async () => {
    setLoadingQuote(true);
    try {
      const res = await  fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/motivation`);
      const data = await res.json();
      setQuote(data.quote);
    } catch {
      setQuote("Stay strong, your journey matters. 🌟");
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <Card className="shadow-md border bg-white">
      <CardHeader>
        <CardTitle className=" text-2xl text-slate-800">
          <div className="flex gap-3 items-center justify-center">
            <Quote /> Daily Motivation
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <blockquote className="text-lg italic text-slate-600">{quote}</blockquote>
        <Button
          onClick={fetchQuote}
          disabled={loadingQuote}
          className="bg-sky-600 hover:bg-sky-700 mt-5"
        >
          {loadingQuote ? (
            "Loading..."
          ) : (
            <>
              <RefreshCw /> New Quote
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
