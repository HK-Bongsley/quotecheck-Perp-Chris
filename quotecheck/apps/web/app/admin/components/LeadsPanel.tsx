"use client";

import { useState, useEffect } from "react";

interface Lead {
  id: string;
  email: string;
  name: string;
  phone?: string;
  status: string;
  createdAt: string;
  categoryName?: string;
}

export function LeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("new");

  useEffect(() => {
    fetchLeads();
  }, [selectedStatus]);

  async function fetchLeads() {
    try {
      const res = await fetch(`/api/leads?status=${selectedStatus}`);
      const data = await res.json();
      setLeads(data.leads);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateLeadStatus(leadId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error("Failed to update lead:", error);
    }
  }

  if (isLoading) return <div>Loading...</div>;

  const statusCounts = {
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    quoted: leads.filter((l) => l.status === "quoted").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Lead Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`p-4 rounded-lg text-center cursor-pointer transition ${
              selectedStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-sm capitalize">{status}</div>
          </button>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-gray-300">
          <thead className="border-b border-gray-700 bg-gray-900">
            <tr>
              <th className="text-left px-6 py-3">Email</th>
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Job</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Created</th>
              <th className="text-left px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-700">
                <td className="px-6 py-3">{lead.email}</td>
                <td className="px-6 py-3">{lead.name || "-"}</td>
                <td className="px-6 py-3">{lead.categoryName || "-"}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      lead.status === "converted"
                        ? "bg-green-900 text-green-200"
                        : lead.status === "quoted"
                        ? "bg-blue-900 text-blue-200"
                        : lead.status === "contacted"
                        ? "bg-yellow-900 text-yellow-200"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-xs text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  <select
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    value={lead.status}
                    className="px-2 py-1 bg-gray-700 text-white rounded text-xs"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="converted">Converted</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
