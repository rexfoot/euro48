"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-16 flex max-w-sm flex-col gap-4">
      <h1 className="text-center text-xl font-semibold">Panel de administración</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        autoFocus
        className="w-full rounded-xl border border-border bg-panel px-4 py-3 text-base text-foreground outline-none focus:border-accent-amber/50"
      />
      {error && <p className="text-sm text-accent-red">Contraseña incorrecta.</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="rounded-xl bg-accent-amber px-4 py-3 text-base font-semibold text-background transition-opacity disabled:opacity-50"
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
