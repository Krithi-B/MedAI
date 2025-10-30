"use client";

import React, { useState } from "react";
import { Card, CardContent} from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Button } from "../ui/button";
import FaqWidget from "./FaqWidget";

interface BMIResult {
  bmi: number;
  category: string;
  interpretation: string;
  normalWeightRange: string;
  recommendations: string[];
}

const BMICalculator: React.FC = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!height || !weight) {
      toast.error("Please enter height and weight");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/bmi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          height: parseFloat(height),
          weight: parseFloat(weight),
        }),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Try again later.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const bmiPercentage = result ? Math.min((result.bmi / 40) * 100, 100) : 0;

  return (
    <div className="p-2">
      <h2 className="text-4xl font-bold mb-5 text-sky-700">BMI Calculator</h2>

      <Card className=" mx-auto bg-white  p-6 rounded-2xl">
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            {/* Height Input */}
            <div className="flex-1 flex flex-col space-y-2">
              <label className="font-semibold text-gray-800">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Enter height"
                className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Weight Input */}
            <div className="flex-1 flex flex-col space-y-2">
              <label className="font-semibold text-gray-800">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight"
                className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleCalculate}
              disabled={!height || !weight || loading}
              className="bg-sky-600 hover:bg-sky-700 w-1/2 text-0.5xl px-3 py-2 rounded-lg"
            >
              {loading ? "Calculating..." : "Calculate BMI"}
            </Button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="mt-5 space-y-4" >
              <p className="font-semibold text-gray-800 text-lg">
                BMI: {result.bmi.toFixed(1)} ({result.category})
              </p>

              {/* BMI Progress Bar */}
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${bmiPercentage}%`,
                    backgroundColor:
                      result.bmi < 18.5
                        ? "#3b82f6" // blue
                        : result.bmi < 25
                        ? "#10b981" // green
                        : result.bmi < 30
                        ? "#facc15" // yellow
                        : "#ef4444", // red
                  }}
                ></div>
              </div>

              {result.interpretation && (
                <p className="text-gray-700">{result.interpretation}</p>
              )}

              {result.normalWeightRange && (
                <p className="text-gray-700">
                  Normal weight range: {result.normalWeightRange}
                </p>
              )}

              {result.recommendations?.length > 0 && (
                <div id="bmi">
                  <strong className="text-gray-800">Recommendations:</strong>
                  <ul className="list-disc ml-5 mt-2 text-gray-700">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {result && <FaqWidget containerId="bmi"/>}
    </div>
  );
};

export default BMICalculator;
