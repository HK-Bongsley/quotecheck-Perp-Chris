"use client";

import { useState } from "react";

interface EmailCaptureFormProps {
  estimateId: string;
  onSuccess?: () => void;
}

export function EmailCaptureForm({
  estimateId,
  onSuccess,
}: EmailCaptureFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    city: "",
    state: "",
    preferredContact: "email" as const,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimateId,
          ...formData,
        }),
      });

      if (res.ok) {
        setMessage("✓ Email saved! We'll be in touch soon.");
        setFormData({
          email: "",
          name: "",
          phone: "",
          city: "",
          state: "",
          preferredContact: "email",
        });
        onSuccess?.();
      } else {
        setMessage("Failed to save. Please try again.");
      }
    } catch (error) {
      console.error("Email capture failed:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Get Connected with Local Contractors
      </h3>
      <p className="text-gray-600 mb-6">
        Share your contact info and we'll connect you with qualified contractors
        in your area
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Contact
            </label>
            <select
              value={formData.preferredContact}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  preferredContact: e.target.value as "email" | "phone",
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Get Connected"}
          </button>
        </div>

        {message && (
          <p
            className={`text-sm ${
              message.startsWith("✓")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
