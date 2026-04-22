"use client";

import { useState, useEffect } from "react";

interface PricingEntry {
  id: number;
  categoryId: number;
  areaId: number;
  basePrice: number;
  lowVariance: number;
  highVariance: number;
}

export function PricingPanel() {
  const [pricingEntries, setPricingEntries] = useState<PricingEntry[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    categoryId: 1,
    areaId: 1,
    basePrice: 500,
    lowVariance: 0.7,
    highVariance: 1.3,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/admin/areas").then((r) => r.json()),
      fetch("/api/admin/pricing").then((r) => r.json()),
    ]).then(([cats, areas, pricing]) => {
      setCategories(cats);
      setAreas(areas);
      setPricingEntries(pricing);
      setIsLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          categoryId: 1,
          areaId: 1,
          basePrice: 500,
          lowVariance: 0.7,
          highVariance: 1.3,
        });

        const updated = await fetch("/api/admin/pricing").then((r) => r.json());
        setPricingEntries(updated);
      }
    } catch (error) {
      console.error("Failed to create pricing entry:", error);
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold text-white mb-4">Pricing Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-left px-4 py-2">Area</th>
                <th className="text-right px-4 py-2">Base Price</th>
                <th className="text-right px-4 py-2">Low</th>
                <th className="text-right px-4 py-2">High</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {pricingEntries.map((entry) => {
                const category = categories.find((c) => c.id === entry.categoryId);
                const area = areas.find((a) => a.id === entry.areaId);

                return (
                  <tr key={entry.id} className="hover:bg-gray-800">
                    <td className="px-4 py-2">{category?.name}</td>
                    <td className="px-4 py-2">{area?.name}</td>
                    <td className="text-right px-4 py-2">
                      ${entry.basePrice.toLocaleString()}
                    </td>
                    <td className="text-right px-4 py-2">
                      ${Math.round(entry.basePrice * entry.lowVariance)}
                    </td>
                    <td className="text-right px-4 py-2">
                      ${Math.round(entry.basePrice * entry.highVariance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="bg-gray-800 p-6 rounded-lg sticky top-20">
          <h3 className="text-lg font-bold text-white mb-4">Add Pricing</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoryId: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={formData.areaId}
              onChange={(e) =>
                setFormData({ ...formData, areaId: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm"
            >
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Base price"
              value={formData.basePrice}
              onChange={(e) =>
                setFormData({ ...formData, basePrice: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm"
              required
            />

            <div>
              <label className="text-sm text-gray-400">Low Variance</label>
              <input
                type="number"
                step="0.05"
                value={formData.lowVariance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lowVariance: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">High Variance</label>
              <input
                type="number"
                step="0.05"
                value={formData.highVariance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    highVariance: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
            >
              Add Pricing
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
