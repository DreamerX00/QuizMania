import React, { useState } from "react";

type SchemaField = {
  type: string;
  items?: any;
  optional?: boolean;
};

type Schema = Record<string, SchemaField>;

export default function SchemaForm({ schema }: { schema: Schema }) {
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [apiResult, setApiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: any) => {
    setForm((f: any) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simple local validation
    for (const key in schema) {
      if (
        !schema[key]?.optional &&
        (form[key] === undefined || form[key] === "")
      ) {
        setError(`Missing required field: ${key}`);
        setApiResult(null);
        return;
      }
    }
    setError(null);
    setResult(form);
    setLoading(true);
    setApiResult(null);
    try {
      const res = await fetch("/api/admin/game-mode-preview/validate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema, data: form }),
      });
      const data = await res.json();
      setApiResult(data);
    } catch (err) {
      setApiResult({ error: "API validation failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded">
      {Object.entries(schema).map(([key, field]) => (
        <div key={key}>
          <label className="block font-semibold mb-1">{key}</label>
          {field.type === "string" && (
            <input
              type="text"
              value={form[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              className="border p-2 rounded w-full"
            />
          )}
          {field.type === "number" && (
            <input
              type="number"
              value={form[key] || ""}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              className="border p-2 rounded w-full"
            />
          )}
          {field.type === "array" && field.items?.type === "string" && (
            <textarea
              value={form[key]?.join("\n") || ""}
              onChange={(e) => handleChange(key, e.target.value.split("\n"))}
              className="border p-2 rounded w-full"
              placeholder="One item per line"
            />
          )}
        </div>
      ))}
      {error && <div className="text-red-500">{error}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Validating..." : "Validate (API)"}
      </button>
      {result && (
        <div className="mt-4 bg-green-50 p-2 rounded">
          <div className="font-semibold">Form Data (local):</div>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      {apiResult && (
        <div className="mt-4 bg-gray-100 p-2 rounded">
          <div className="font-semibold">API Validation Result:</div>
          {apiResult.error && (
            <div className="text-red-500">{apiResult.error}</div>
          )}
          {apiResult.valid && <div className="text-green-600">Valid!</div>}
          {apiResult.valid === false && (
            <div className="text-red-600">
              Invalid. Errors:
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(apiResult.errors, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
