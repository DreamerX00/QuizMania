"use client";

import React, { useEffect, useState } from "react";

const fetchLogs = async () => {
  const res = await fetch("/api/admin/moderation/logs");
  if (!res.ok) return [];
  const data = await res.json();
  return data.logs || [];
};

const performAction = async (action: string, body: Record<string, unknown>) => {
  const res = await fetch(`/api/admin/moderation/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
};

export default function ModerationDashboard() {
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, unknown>>({ action: "mute" });
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLogs()
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((f: Record<string, unknown>) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setResult(null);
    const { action, ...body } = form;
    const res = await performAction(action, body);
    setResult(res);
    setActionLoading(false);
    if (res.success) {
      setLoading(true);
      fetchLogs()
        .then(setLogs)
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Moderation Dashboard</h1>
      <form
        onSubmit={handleAction}
        className="mb-8 bg-gray-50 p-4 rounded space-y-2"
      >
        <div className="flex gap-2 items-center">
          <label className="font-semibold">Action:</label>
          <select
            name="action"
            value={form.action}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="mute">Mute</option>
            <option value="unmute">Unmute</option>
            <option value="block">Block</option>
            <option value="unblock">Unblock</option>
            <option value="report">Report</option>
          </select>
        </div>
        {(form.action === "mute" || form.action === "unmute") && (
          <div className="flex gap-2 items-center">
            <input
              name="roomId"
              placeholder="Room ID"
              value={form.roomId || ""}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              name="userId"
              placeholder="User ID"
              value={form.userId || ""}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              name="byId"
              placeholder="By (Admin) ID"
              value={form.byId || ""}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>
        )}
        {(form.action === "block" || form.action === "unblock") && (
          <div className="flex gap-2 items-center">
            <input
              name="userId"
              placeholder="User ID"
              value={form.userId || ""}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              name="blockedId"
              placeholder="Blocked ID"
              value={form.blockedId || ""}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              name="byId"
              placeholder="By (Admin) ID"
              value={form.byId || ""}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>
        )}
        {form.action === "report" && (
          <div className="flex gap-2 items-center">
            <input
              name="targetId"
              placeholder="Target User ID"
              value={form.targetId || ""}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              name="byId"
              placeholder="By (Admin) ID"
              value={form.byId || ""}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>
        )}
        <textarea
          name="reason"
          placeholder="Reason (optional)"
          value={form.reason || ""}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={actionLoading}
        >
          {actionLoading ? "Processing..." : "Submit Action"}
        </button>
        {result && (
          <div className="mt-2">
            {result.error && <div className="text-red-500">{result.error}</div>}
            {result.success && (
              <div className="text-green-600">Action successful!</div>
            )}
          </div>
        )}
      </form>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Recent Moderation Actions</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full text-sm border">
            <thead>
              <tr>
                <th className="border px-2">Time</th>
                <th className="border px-2">Action</th>
                <th className="border px-2">Target</th>
                <th className="border px-2">By</th>
                <th className="border px-2">Reason</th>
                <th className="border px-2">Context</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="border px-2">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="border px-2">{log.action}</td>
                  <td className="border px-2">{log.targetUserId}</td>
                  <td className="border px-2">{log.performedById}</td>
                  <td className="border px-2">{log.reason || "-"}</td>
                  <td className="border px-2">
                    {log.context ? JSON.stringify(log.context) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
