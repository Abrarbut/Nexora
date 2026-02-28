"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    stock: "",
    categoryId: "",
    images: "",
    isActive: true,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/products/${productId}`).then((r) => r.json()),
    ]).then(([catData, prodData]) => {
      setCategories(catData.data || []);
      if (prodData.data) {
        const p = prodData.data;
        setForm({
          name: p.name,
          description: p.description || "",
          price: String(p.price),
          compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
          stock: String(p.stock),
          categoryId: p.categoryId || "",
          images: (p.images || []).join(", "),
          isActive: p.isActive,
        });
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const images = form.images.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch(`/api/vendor/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
          stock: parseInt(form.stock) || 0,
          categoryId: form.categoryId || undefined,
          images,
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      router.push("/vendor/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">Edit Product</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Product Name *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={5} className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Price ($) *</label>
            <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Compare At Price ($)</label>
            <input name="compareAtPrice" type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={handleChange} className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Stock *</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Category</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500">
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Image URLs</label>
          <input name="images" value={form.images} onChange={handleChange} className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
          <p className="mt-1 text-xs text-slate-500">Comma-separated URLs</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800"
          />
          <label htmlFor="isActive" className="text-sm text-slate-300">Product is active and visible</label>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-xl border border-slate-700 px-6 py-3 font-medium text-white transition hover:border-blue-500">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
