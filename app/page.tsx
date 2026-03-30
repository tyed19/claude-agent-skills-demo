"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [competitor, setCompetitor] = useState("Cursor");

  const competitors = [
    "Cursor",
    "GitHub Copilot",
    "OpenAI Codex",
    "Codeium",
  ];

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setDownloadUrl("");

    try {
      const res = await fetch("/api/ci-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          competitor,
          persona: "Engineering Manager",
          dealContext: "AI coding tools evaluation",
        }),
      });

      if (!res.ok) {
        let message = "Something went wrong.";
        try {
          const data = await res.json();
          message = data.error || message;
        } catch {}
        setError(message);
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch {
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            Claude Agent Skills Demo
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Competitive Intelligence Agent
          </h1>
          <p className="mt-4 max-w-2xl text-neutral-300">
            Generate a one-page battlecard artifact using Claude, Agent Skills,
            code execution, and the Files API.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
          <div className="space-y-5">
            <div>
              <p className="text-sm text-neutral-400 mb-2">Select Competitor</p>
              <div className="flex flex-wrap gap-2">
                {competitors.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCompetitor(option)}
                    className={`rounded-lg px-3 py-2 text-sm border transition ${
                      competitor === option
                        ? "bg-white text-black border-white"
                        : "bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-neutral-400">Selected Competitor</p>
              <p className="mt-1 text-lg font-medium">{competitor}</p>
            </div>

            <div>
              <p className="text-sm text-neutral-400">Audience</p>
              <p className="mt-1 text-lg font-medium">Engineering Manager</p>
            </div>

            <div>
              <p className="text-sm text-neutral-400">Context</p>
              <p className="mt-1 text-lg font-medium">
                AI coding tools evaluation
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-2 inline-flex items-center rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Battlecard"}
            </button>

            {downloadUrl && (
              <div className="mt-6 rounded-xl border border-emerald-800 bg-emerald-950 p-4">
                <p className="mb-2 text-emerald-300">
                  Artifact generated successfully.
                </p>
                <a
                  href={downloadUrl}
                  download="battlecard.pdf"
                  className="font-medium text-white underline"
                >
                  Download PDF
                </a>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl border border-red-800 bg-red-950 p-4 text-red-300">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
