"use client";

import { useState, useEffect } from "react";

export function SettingsPanel() {
  const [emailService, setEmailService] = useState("sendgrid");
  const [settings, setSettings] = useState({
    apiKey: "",
    fromEmail: "",
    notificationEmail: "",
    dailyDigest: true,
    digestTime: "09:00",
  });
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: emailService,
          ...settings,
        }),
      });

      if (res.ok) {
        alert("Settings saved successfully");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-6">Settings</h2>

      <div className="bg-gray-800 p-6 rounded-lg space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Email Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Service
              </label>
              <select
                value={emailService}
                onChange={(e) => setEmailService(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              >
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
                <option value="aws_ses">AWS SES</option>
                <option value="resend">Resend</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                placeholder="Enter your API key"
                value={settings.apiKey}
                onChange={(e) =>
                  setSettings({ ...settings, apiKey: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your API key is encrypted and never logged
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                From Email Address
              </label>
              <input
                type="email"
                placeholder="noreply@quotecheck.com"
                value={settings.fromEmail}
                onChange={(e) =>
                  setSettings({ ...settings, fromEmail: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notification Email
              </label>
              <input
                type="email"
                placeholder="admin@yourcompany.com"
                value={settings.notificationEmail}
                onChange={(e) =>
                  setSettings({ ...settings, notificationEmail: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Receive lead notifications here
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <label className="text-sm font-medium text-gray-300">
                Daily Digest Email
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dailyDigest}
                  onChange={(e) =>
                    setSettings({ ...settings, dailyDigest: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.dailyDigest && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Digest Time (UTC)
                </label>
                <input
                  type="time"
                  value={settings.digestTime}
                  onChange={(e) =>
                    setSettings({ ...settings, digestTime: e.target.value })
                  }
                  className="px-4 py-2 bg-gray-700 text-white rounded"
                />
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700 flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
          <button className="px-6 py-2 border border-gray-600 text-gray-300 hover:border-gray-400 rounded font-medium">
            Test Email
          </button>
        </div>
      </div>
    </div>
  );
}
