"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, SPECIALTIES, type CountryCode, type SpecialtyId } from "@/lib/constants";

type Ad = {
  id: string;
  image_url: string;
  link_url: string;
  title: string;
  active: boolean;
};

type ManualOffer = {
  id: string;
  title_original: string;
  company: string;
  country_code: CountryCode;
  city: string;
  specialty: SpecialtyId;
  url: string;
  description: string | null;
  expires_at: string | null;
  published_at: string;
};

type VisibilityChoice = "" | "7" | "15" | "30";

type FormState = {
  title: string;
  company: string;
  countryCode: CountryCode | "";
  city: string;
  specialty: SpecialtyId | "";
  contact: string;
  description: string;
  visibility: VisibilityChoice;
};

const EMPTY_FORM: FormState = {
  title: "",
  company: "",
  countryCode: "",
  city: "",
  specialty: "",
  contact: "",
  description: "",
  visibility: "",
};

// The stored url is always mailto:/tel:/https: (see lib/manual-offers.ts's
// normalizeContact) — this reverses that just for re-editing, so the form
// shows back roughly what was typed instead of the raw scheme-prefixed value.
function contactFromUrl(url: string): string {
  if (url.startsWith("mailto:")) return url.slice("mailto:".length);
  if (url.startsWith("tel:")) return url.slice("tel:".length);
  return url;
}

function closestVisibility(expiresAt: string | null): VisibilityChoice {
  if (!expiresAt) return "";
  const remainingDays = (new Date(expiresAt).getTime() - Date.now()) / 86_400_000;
  if (remainingDays <= 0) return "";
  const options: [number, VisibilityChoice][] = [[7, "7"], [15, "15"], [30, "30"]];
  options.sort((a, b) => Math.abs(a[0] - remainingDays) - Math.abs(b[0] - remainingDays));
  return options[0][1];
}

export function AdminDashboard() {
  const router = useRouter();
  const [offers, setOffers] = useState<ManualOffer[] | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [adForm, setAdForm] = useState({ imageUrl: "", linkUrl: "", title: "" });
  const [adSaving, setAdSaving] = useState(false);

  const loadOffers = useCallback(async () => {
    const res = await fetch("/api/admin/offers");
    if (res.ok) {
      const data = await res.json();
      setOffers(data.offers);
    }
  }, []);

  const loadAds = useCallback(async () => {
    const res = await fetch("/api/admin/ads");
    if (res.ok) {
      const data = await res.json();
      setAds(data.ads);
    }
  }, []);

  useEffect(() => {
    loadOffers();
    loadAds();
  }, [loadOffers, loadAds]);

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  function startEdit(offer: ManualOffer) {
    setEditingId(offer.id);
    setForm({
      title: offer.title_original,
      company: offer.company,
      countryCode: offer.country_code,
      city: offer.city,
      specialty: offer.specialty,
      contact: contactFromUrl(offer.url),
      description: offer.description ?? "",
      visibility: closestVisibility(offer.expires_at),
    });
    setNotice(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function onDelete(offer: ManualOffer) {
    if (!window.confirm(`¿Borrar "${offer.title_original}"? Esto no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/offers/${encodeURIComponent(offer.id)}`, { method: "DELETE" });
    if (res.ok) {
      setNotice("Oferta borrada.");
      if (editingId === offer.id) cancelEdit();
      loadOffers();
    } else {
      setError("No se pudo borrar la oferta.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    const payload = {
      title: form.title,
      company: form.company,
      countryCode: form.countryCode,
      city: form.city,
      specialty: form.specialty,
      contact: form.contact,
      description: form.description,
      visibilityDays: form.visibility ? Number(form.visibility) : null,
    };

    const url = editingId ? `/api/admin/offers/${encodeURIComponent(editingId)}` : "/api/admin/offers";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setNotice(editingId ? "Cambios guardados." : "Oferta publicada.");
      cancelEdit();
      loadOffers();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(
        data.error === "duplicate"
          ? "Ya existe una oferta igual (misma empresa, puesto y ciudad)."
          : "Faltan datos o hay un error. Revisa el formulario."
      );
    }
    setSaving(false);
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-panel px-4 py-3 text-base text-foreground outline-none focus:border-accent-amber/50";
  const labelClass = "mb-1 block text-sm font-medium text-muted";

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Panel de administración</h1>
        <button type="button" onClick={onLogout} className="text-sm text-muted underline">
          Cerrar sesión
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-panel p-4">
        <h2 className="text-base font-semibold">
          {editingId ? "Editar oferta" : "Añadir oferta"}
        </h2>

        <div>
          <label className={labelClass}>Título del puesto</label>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Ej: Camarero/a"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Empresa</label>
          <input
            className={inputClass}
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            placeholder="Nombre de la empresa"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>País</label>
            <select
              className={inputClass}
              value={form.countryCode}
              onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value as CountryCode }))}
              required
            >
              <option value="" disabled>
                Elige un país
              </option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name.es}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Ciudad</label>
            <input
              className={inputClass}
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="Ej: Berlín"
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Categoría</label>
          <select
            className={inputClass}
            value={form.specialty}
            onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value as SpecialtyId }))}
            required
          >
            <option value="" disabled>
              Elige una categoría
            </option>
            {SPECIALTIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name.es}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Enlace o contacto (email o teléfono)</label>
          <input
            className={inputClass}
            value={form.contact}
            onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
            placeholder="https://... o correo@empresa.com o +34 600 000 000"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Descripción breve (opcional)</label>
          <textarea
            className={inputClass}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Un par de frases sobre el puesto"
            rows={3}
          />
        </div>

        <div>
          <label className={labelClass}>¿Cuánto tiempo debe verse?</label>
          <select
            className={inputClass}
            value={form.visibility}
            onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value as VisibilityChoice }))}
          >
            <option value="">48 horas (normal, como las demás)</option>
            <option value="7">7 días</option>
            <option value="15">15 días</option>
            <option value="30">30 días</option>
          </select>
        </div>

        {error && <p className="text-sm text-accent-red">{error}</p>}
        {notice && <p className="text-sm text-accent-amber">{notice}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-accent-amber px-4 py-3 text-base font-semibold text-background transition-opacity disabled:opacity-50"
          >
            {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Publicar oferta"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-border px-4 py-3 text-base font-medium text-foreground"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-panel p-4">
        <h2 className="text-base font-semibold">Publicidad</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className={labelClass}>Subir imagen desde tu ordenador</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  setAdForm((f) => ({ ...f, imageUrl: reader.result as string }));
                };
                reader.readAsDataURL(file);
              }}
              className="w-full rounded-xl border border-border bg-panel px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-accent-amber file:px-4 file:py-2 file:text-sm file:font-semibold file:text-background"
            />
            {adForm.imageUrl && adForm.imageUrl.startsWith("data:") && (
              <img src={adForm.imageUrl} alt="Preview" className="mt-2 h-20 w-20 rounded-lg object-cover" />
            )}
          </div>
          <div>
            <label className={labelClass}>URL de la imagen (alternativa)</label>
            <input
              className={inputClass}
              value={adForm.imageUrl.startsWith("data:") ? "" : adForm.imageUrl}
              onChange={(e) => setAdForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
          <div>
            <label className={labelClass}>URL del enlace</label>
            <input
              className={inputClass}
              value={adForm.linkUrl}
              onChange={(e) => setAdForm((f) => ({ ...f, linkUrl: e.target.value }))}
              placeholder="https://empresa.com/oferta"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Título (opcional)</label>
            <input
              className={inputClass}
              value={adForm.title}
              onChange={(e) => setAdForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Nombre de la empresa"
            />
          </div>
          <button
            type="button"
            disabled={adSaving}
            onClick={async () => {
              setAdSaving(true);
              const res = await fetch("/api/admin/ads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: adForm.imageUrl, linkUrl: adForm.linkUrl, title: adForm.title }),
              });
              if (res.ok) {
                setAdForm({ imageUrl: "", linkUrl: "", title: "" });
                loadAds();
              }
              setAdSaving(false);
            }}
            className="rounded-xl bg-accent-amber px-4 py-3 text-base font-semibold text-background transition-opacity disabled:opacity-50"
          >
            {adSaving ? "Guardando…" : "Añadir anuncio"}
          </button>
        </div>

        {ads.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-muted">Anuncios activos</h3>
            {ads.map((ad) => (
              <div key={ad.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-2">
                <img src={ad.image_url} alt={ad.title} className="h-12 w-12 rounded object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{ad.title || "Anuncio"}</p>
                  <p className="text-xs text-muted">{ad.link_url}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Mis ofertas manuales</h2>
        {offers === null && <p className="text-sm text-muted">Cargando…</p>}
        {offers !== null && offers.length === 0 && (
          <p className="text-sm text-muted">Todavía no has añadido ninguna oferta.</p>
        )}
        {offers?.map((offer) => (
          <div
            key={offer.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{offer.title_original}</p>
              <p className="text-sm text-muted">
                {offer.company} · {offer.city} · {offer.country_code}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startEdit(offer)}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium sm:flex-none"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(offer)}
                className="flex-1 rounded-lg border border-accent-red/40 px-3 py-2 text-sm font-medium text-accent-red sm:flex-none"
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
