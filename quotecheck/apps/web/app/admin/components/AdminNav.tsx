"use client";

interface AdminNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export function AdminNav({ activeTab, onTabChange }: AdminNavProps) {
  const tabs = [
    { id: "categories", label: "Categories" },
    { id: "areas", label: "Areas" },
    { id: "pricing", label: "Pricing" },
    { id: "leads", label: "Leads" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <nav className="border-b border-gray-700 bg-gray-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-white">QuoteCheck Admin</h1>
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
