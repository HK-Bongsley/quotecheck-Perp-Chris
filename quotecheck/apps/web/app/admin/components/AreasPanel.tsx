"use client";

import { useState, useEffect } from "react";

interface Area {
  id: number;
  name: string;
  multiplier: number;
  zipCodes: string[];
}

export function AreasPanel() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    multiplier: 1.0,
    zip_codes: "",
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  async function fetchAreas() {
    try {
      const res = await fetch("/api/admin/areas");
      const data = await res.json();
      setAreas(data);
    } catch (error) {
      console.error("Failed to fetch areas:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/admin/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          multiplier: formData.multiplier,
          zip_codes: formData.zip_codes.split(",").map((z) => z.trim()),
        }),
      });

      if (res.ok) {
        setFormData({ name: "", multiplier: 1.0, zip_codes: "" });
        fetchAreas();
      }
    } catch (error) {
      console.error("Failed to create area:", error);
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold text-white mb-4">Geographic Areas</h2>
        <div className="space-y-4">
          {areas.map((area) => (
            <div key={area.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{area.name}</h3>
                <span className="text-sm text-blue-400">
                  {area.multiplier.toFixed(2)}x multiplier
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                {area.zipCodes.length} ZIP codes
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="bg-gray-800 p-6 rounded-lg sticky top-20">
          <h3 className="text-lg font-bold text-white mb-4">Add Area</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Area name (e.g., New York, NY)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm"
              required
            />
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Price Multiplier: {formData.multiplier.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={formData.multiplier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    multiplier: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
            <textarea
              placeholder="ZIP codes (comma-separated)"
              value={formData.zip_codes}
              onChange={(e) =>
                setFormData({ ...formData, zip_codes: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm"
              rows={3}
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
            >
              Add Area
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
