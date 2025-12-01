"use client";

import React, { useState, useEffect } from "react";

type SchemaField = {
  type: string;
  items?: {
    type: string;
  };
  optional?: boolean;
};

type Schema = Record<string, SchemaField>;

const schemaList = [
  { name: "Default", file: "default.json" },
  { name: "Premium", file: "premium.json" },
];

const fetchSchema = async (file: string): Promise<Schema> => {
  const res = await fetch(`/schemas/game-modes/v1/${file}`);
  if (!res.ok) throw new Error("Failed to load schema");
  return res.json();
};

export default function GameModePreviewPage() {
  const [selected, setSelected] = useState(
    schemaList[0]?.file || "default.json"
  );
  const [schema, setSchema] = useState<Schema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rollbackVersion, setRollbackVersion] = useState("");
  const [rollbackResult, setRollbackResult] = useState<{
    error?: string;
    success?: boolean;
    message?: string;
  } | null>(null);
  const [rollbackLoading, setRollbackLoading] = useState(false);

  useEffect(() => {
    fetchSchema(selected)
      .then(setSchema)
      .catch((e) => setError(e.message));
  }, [selected]);

  const handleRollback = async () => {
    setRollbackLoading(true);
    setRollbackResult(null);
    try {
      const schemaName = selected.replace(".json", "");
      const res = await fetch("/api/admin/game-mode-preview/rollback-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemaName, version: rollbackVersion }),
      });
      const data = await res.json();
      setRollbackResult(data);
    } catch {
      setRollbackResult({ error: "Rollback failed" });
    } finally {
      setRollbackLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Game Mode Schema Preview</h1>
      <div className="mb-4">
        <label className="font-semibold">Select Schema: </label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border p-2 rounded"
        >
          {schemaList.map((s) => (
            <option key={s.file} value={s.file}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {schema && (
        <React.Suspense fallback={<div>Loading form...</div>}>
          <SchemaForm schema={schema} />
        </React.Suspense>
      )}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Rollback Schema</h2>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder="Target version (e.g. v1)"
            value={rollbackVersion}
            onChange={(e) => setRollbackVersion(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={handleRollback}
            className="bg-red-600 text-white px-4 py-2 rounded"
            disabled={rollbackLoading || !rollbackVersion}
          >
            {rollbackLoading ? "Rolling back..." : "Rollback"}
          </button>
        </div>
        {rollbackResult && (
          <div className="mt-2">
            {rollbackResult.error && (
              <div className="text-red-500">{rollbackResult.error}</div>
            )}
            {rollbackResult.success && (
              <div className="text-green-600">{rollbackResult.message}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Dynamic import for SchemaForm
const SchemaForm = React.lazy(() => import("./SchemaForm"));
