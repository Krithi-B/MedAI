// frontend/src/components/dash/FaqWidget.tsx
"use client";

import { useState, useEffect } from "react";

interface Faq {
  question: string;
  answer: string;
}

interface Props {
  containerId?: string; // optional: id of container to insert FAQ
}

export default function FaqWidget({ containerId }: Props) {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Only run the effect if this component is explicitly mounted
    // Avoid auto-running globally like before
    const fetchFaqs = async () => {
      setLoading(true);

      // Only read text if containerId is provided
      const containerText = containerId
        ? document.getElementById(containerId)?.innerText
        : null;

      // Prevent running if containerText is empty or null
      if (!containerText) {
        setFaqs([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/faqs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: containerText }),
        });
        const data = await res.json();
        setFaqs(data.faqs || []);
      } catch (err) {
        console.error("FAQ generation failed:", err);
        setFaqs([]);
      }

      setLoading(false);
    };

    fetchFaqs();
  }, [containerId]);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Don’t render anything if there’s no valid container
  if (!containerId) return null;

  return (
    <div className="mt-4 w-full bg-white rounded-2xl shadow-md p-4 border border-sky-200">
      <h2 className="text-lg font-semibold text-sky-800 mb-2">FAQs</h2>

      {loading ? (
        <p className="text-gray-500 text-sm">Generating FAQs...</p>
      ) : faqs.length > 0 ? (
        <ul className="space-y-2">
          {faqs.map((faq, i) => (
            <li key={i} className="border-b last:border-b-0 pb-2">
              <button
                onClick={() => toggleAccordion(i)}
                className="w-full flex justify-between items-center text-left font-medium text-sky-700 hover:text-sky-900 focus:outline-none"
              >
                <span>Q: {faq.question}</span>
                <span>{expandedIndex === i ? "▲" : "▼"}</span>
              </button>
              {expandedIndex === i && (
                <p className="mt-1 text-gray-500 text-medium">A: {faq.answer}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">
          No FAQs available for this content.
        </p>
      )}
    </div>
  );
}
