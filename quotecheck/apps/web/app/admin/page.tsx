"use client";

import { useState, useEffect } from "react";
import { AdminNav } from "./components/AdminNav";
import { CategoriesPanel } from "./components/CategoriesPanel";
import { AreasPanel } from "./components/AreasPanel";
import { PricingPanel } from "./components/PricingPanel";
import { LeadsPanel } from "./components/LeadsPanel";
import { SettingsPanel } from "./components/SettingsPanel";

type AdminTab = "categories" | "areas" | "pricing" | "leads" | "settings";

/**
 * Admin dashboard for QuoteCheck
 * Protected route (placeholder: integrate with Cloudflare Access)
 */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("categories");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Verify admin access via Cloudflare Access or JWT
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "categories" && <CategoriesPanel />}
        {activeTab === "areas" && <AreasPanel />}
        {activeTab === "pricing" && <PricingPanel />}
        {activeTab === "leads" && <LeadsPanel />}
        {activeTab === "settings" && <SettingsPanel />}
      </main>
    </div>
  );
}
