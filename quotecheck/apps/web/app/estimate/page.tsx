"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Turnstile from "@cloudflare/turnstile-react";
import type { Category, QuestionItem } from "@quotecheck/types";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";

type Step = "category" | "location" | "questions" | "photos" | "results" | "error";

interface EstimateResult {
  id: string;
  low: number;
  typical: number;
  high: number;
  confidence: string;
  assumptions: string[];
  exclusions: string[];
  reasonBreakdown: string[];
  disclaimers: string[];
  createdAt: string;
}

export default function EstimatePage() {
  const searchParams = useSearchParams();
  const initialCategoryId = searchParams.get("category");

  const [step, setStep] = useState<Step>("category");
  const [categoryId, setCategoryId] = useState<number | null>(
    initialCategoryId ? Number(initialCategoryId) : null
  );
  const [areaId, setAreaId] = useState<number | null>(null);
  const [areaCode, setAreaCode] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);

        if (initialCategoryId) {
          const categoryNum = Number(initialCategoryId);
          setCategoryId(categoryNum);
          setStep("location");
        }
      } catch (err) {
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, [initialCategoryId]);

  // Fetch intake questions when category selected
  useEffect(() => {
    if (!categoryId || step !== "questions") return;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/intake/${categoryId}`);
        const data = await res.json();
        setQuestions(data);
        setCurrentQuestionIndex(0);
        setAnswers({});
      } catch (err) {
        setError("Failed to load questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [categoryId, step]);

  const handleCategorySelect = (id: number) => {
    setCategoryId(id);
    setStep("location");
  };

  const handleLocationSubmit = async () => {
    if (!areaCode.trim()) {
      setError("Please enter your area code");
      return;
    }

    setLoading(true);
    try {
      // Validate area exists by trying to fetch pricing
      // For now, assume area is valid and set areaId to 1 (Austin demo)
      setAreaId(1); // TODO: Actually look up area
      setStep("questions");
    } catch (err) {
      setError("Area not found");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (value: unknown) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion?.field_name]: value,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setStep("photos");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSkipPhotos = async () => {
    if (!categoryId || !areaId || !turnstileToken) {
      setError("Missing required information");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          areaId,
          answers,
          photos: [],
          turnstileToken,
        }),
      });

      if (!res.ok) throw new Error("Estimation failed");

      const data = await res.json();
      setResult(data);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Estimation failed");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  // Render based on step
  if (step === "category") {
    return (
      <div className="flex-1 px-4 py-12 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">What can we help with?</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className="p-4 text-left bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
            >
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="text-sm text-slate-600 mt-1">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "location") {
    return (
      <div className="flex-1 px-4 py-12 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Where are you located?</h1>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            ZIP code / Area code
          </label>
          <input
            type="text"
            value={areaCode}
            onChange={(e) => setAreaCode(e.target.value)}
            placeholder="e.g., 78704"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

        <button
          onClick={handleLocationSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Continue"}
        </button>
      </div>
    );
  }

  if (step === "questions") {
    return (
      <div className="flex-1 px-4 py-12 max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="h-1 w-32 bg-slate-200 rounded-full">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {currentQuestion && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{currentQuestion.question_text}</h2>
            {currentQuestion.help_text && (
              <p className="text-sm text-slate-600 mb-4">{currentQuestion.help_text}</p>
            )}

            <div className="space-y-3">
              {currentQuestion.question_type === "radio" && currentQuestion.options ? (
                Object.entries(currentQuestion.options).map(([key, label]) => (
                  <label key={key} className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name={currentQuestion.field_name}
                      value={key}
                      checked={answers[currentQuestion.field_name] === key}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="mr-3"
                    />
                    {label}
                  </label>
                ))
              ) : currentQuestion.question_type === "number" ? (
                <input
                  type="number"
                  value={answers[currentQuestion.field_name] || ""}
                  onChange={(e) => handleAnswerChange(Number(e.target.value))}
                  placeholder="Enter number"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              ) : (
                <input
                  type="text"
                  value={answers[currentQuestion.field_name] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Enter response"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleNextQuestion}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            {currentQuestionIndex === questions.length - 1 ? "Done" : "Next"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "photos") {
    return (
      <div className="flex-1 px-4 py-12 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add photos (optional)</h1>
        <p className="text-slate-600 mb-6">
          Photos help improve estimate accuracy, but aren't required.
        </p>

        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
          onSuccess={(token) => setTurnstileToken(token)}
        />

        <button
          onClick={handleSkipPhotos}
          disabled={loading || !turnstileToken}
          className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Get My Estimate"}
        </button>

        {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
      </div>
    );
  }

  if (step === "results" && result) {
    return (
      <div className="flex-1 px-4 py-12 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Estimate</h1>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-lg mb-8">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <p className="text-slate-600 text-sm mb-1">Low</p>
              <p className="text-2xl font-bold text-slate-900">
                ${result.low.toLocaleString()}
              </p>
            </div>
            <div className="text-center border-l border-r border-slate-300">
              <p className="text-slate-600 text-sm mb-1">Typical</p>
              <p className="text-3xl font-bold text-indigo-600">
                ${result.typical.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600 text-sm mb-1">High</p>
              <p className="text-2xl font-bold text-slate-900">
                ${result.high.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="text-center">
            <span className="inline-block px-4 py-1 bg-white rounded-full text-sm font-medium">
              Confidence: <span className="font-bold text-indigo-600">{result.confidence}</span>
            </span>
          </div>
        </div>

        {result.reasonBreakdown.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold mb-4">What affected your price</h2>
            <ul className="space-y-2">
              {result.reasonBreakdown.map((reason, idx) => (
                <li key={idx} className="text-slate-700 flex gap-2">
                  <span>•</span> {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.assumptions.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold mb-4">Our assumptions</h2>
            <ul className="space-y-2">
              {result.assumptions.map((assumption, idx) => (
                <li key={idx} className="text-slate-700 text-sm flex gap-2">
                  <span>•</span> {assumption}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.exclusions.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="font-semibold mb-3 text-yellow-900">Not included</h2>
            <ul className="space-y-1 text-sm text-yellow-800">
              {result.exclusions.map((exclusion, idx) => (
                <li key={idx} className="flex gap-2">
                  <span>•</span> {exclusion}
                </li>
              ))}
            </ul>
          </div>
        )}

        <EmailCaptureForm estimateId={result.id} />

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold mb-3 text-blue-900">Important disclaimer</h2>
          <ul className="space-y-1 text-sm text-blue-800">
            {result.disclaimers.map((disclaimer, idx) => (
              <li key={idx} className="flex gap-2">
                <span>•</span> {disclaimer}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="w-full mt-8 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700"
        >
          Get Another Estimate
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-12 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-slate-600 mb-6">{error || "An unexpected error occurred."}</p>
      <button
        onClick={() => window.location.href = "/"}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700"
      >
        Go Home
      </button>
    </div>
  );
}
