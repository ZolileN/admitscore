"use client";

import { useEffect, useState } from "react";

interface AdminProgram {
  id: number;
  name: string;
  slug: string;
  universityName?: string;
  faculty: string;
  minAps: number | null;
  description: string | null;
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [programs, setPrograms] = useState<AdminProgram[]>([]);
  const [stats, setStats] = useState<{ universities: number; programs: number } | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const loadPrograms = async (adminToken: string) => {
    const response = await fetch("/api/admin/programs", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!response.ok) {
      setAuthenticated(false);
      setMessage("Invalid admin token.");
      return;
    }

    const data = await response.json();
    setPrograms(data.programs);
    setStats(data.stats);
    setAuthenticated(true);
    setMessage(null);
  };

  useEffect(() => {
    const savedToken = sessionStorage.getItem("admin_token");
    if (savedToken) {
      setToken(savedToken);
      loadPrograms(savedToken);
    }
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    sessionStorage.setItem("admin_token", token);
    await loadPrograms(token);
  };

  const updateProgram = async (program: AdminProgram, updates: { minAps?: number; description?: string }) => {
    const response = await fetch(`/api/admin/programs/${program.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      setMessage(`Failed to update ${program.name}.`);
      return;
    }

    setMessage(`Updated ${program.name}.`);
    await loadPrograms(token);
  };

  const filteredPrograms = programs.filter((program) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;
    return (
      program.name.toLowerCase().includes(normalizedQuery) ||
      program.universityName?.toLowerCase().includes(normalizedQuery) ||
      program.faculty.toLowerCase().includes(normalizedQuery)
    );
  });

  if (!authenticated) {
    return (
      <main className="min-h-screen container-app pt-20 max-w-lg">
        <div className="glass-card-static p-8">
          <h1 className="text-2xl font-bold mb-2">Admin</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Enter your admin secret to manage programme APS scores and descriptions.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Admin secret"
              className="input-field"
            />
            <button type="submit" className="btn-primary w-full">Sign in</button>
          </form>
          {message && <p className="text-sm mt-4" style={{ color: "var(--accent-rose)" }}>{message}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen container-wide pt-8 pb-16">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          {stats && (
            <p style={{ color: "var(--text-secondary)" }}>
              {stats.universities} universities · {stats.programs} programmes
            </p>
          )}
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search programmes..."
          className="input-field max-w-md"
        />
      </div>

      {message && (
        <div className="mb-4 text-sm" style={{ color: "var(--accent-emerald)" }}>{message}</div>
      )}

      <div className="space-y-4">
        {filteredPrograms.map((program) => (
          <AdminProgramRow key={program.id} program={program} onSave={updateProgram} />
        ))}
      </div>
    </main>
  );
}

function AdminProgramRow({
  program,
  onSave,
}: {
  program: AdminProgram;
  onSave: (program: AdminProgram, updates: { minAps?: number; description?: string }) => Promise<void>;
}) {
  const [minAps, setMinAps] = useState(String(program.minAps ?? ""));
  const [description, setDescription] = useState(program.description ?? "");

  return (
    <div className="glass-card-static p-5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{program.universityName}</div>
          <div className="font-semibold">{program.name}</div>
          <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{program.faculty}</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <input
            type="number"
            value={minAps}
            onChange={(event) => setMinAps(event.target.value)}
            className="input-field sm:w-28"
            placeholder="APS"
          />
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="input-field flex-1"
            placeholder="Description"
          />
          <button
            onClick={() => onSave(program, {
              minAps: minAps ? parseInt(minAps, 10) : undefined,
              description,
            })}
            className="btn-primary !py-2 !px-4 !text-xs"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
