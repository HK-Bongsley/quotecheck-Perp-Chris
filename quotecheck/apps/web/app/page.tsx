"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category } from "@quotecheck/types";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="px-4 py-12 sm:py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
          QuoteCheck
        </h1>
        <p className="text-xl text-slate-600 mb-2">
          Transparent estimates. Honest pricing. No guessing.
        </p>
        <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
          Get realistic low, typical, and high estimates for home repair jobs in your area.
          Powered by real market data and industry expertise.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm">
            ✓ No signup required
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm">
            ✓ Instant results
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm">
            ✓ Completely free
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-4 py-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">What can we help you with?</h2>

        {loading ? (
          <div className="text-center py-12">Loading categories...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/estimate?category=${category.id}`}
                className="block p-6 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{category.description}</p>
                <div className="text-indigo-600 font-medium text-sm">
                  Get an estimate →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-600 text-sm">
          <p>
            QuoteCheck provides estimates based on market data for informational purposes only.
            Always get professional on-site quotes before hiring contractors.
          </p>
        </div>
      </footer>
    </main>
  );
}
