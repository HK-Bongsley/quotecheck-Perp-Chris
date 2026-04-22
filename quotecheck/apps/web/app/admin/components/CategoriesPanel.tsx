"use client";

import { useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
  variability: number;
  description: string;
}

export function CategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    variability: 0.3,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ name: "", description: "", variability: 0.3 });
        fetchCategories();
      }
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold text-white mb-4">Job Categories</h2>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{cat.name}</h3>
                <span className="text-sm text-gray-400">
                  Variability: {(cat.variability * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-gray-400 text-sm">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="bg-gray-800 p-6 rounded-lg sticky top-20">
          <h3 className="text-lg font-bold text-white mb-4">Add Category</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Category name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm"
              rows={3}
            />
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Variability: {(formData.variability * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={formData.variability}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    variability: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
            >
              Add Category
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
