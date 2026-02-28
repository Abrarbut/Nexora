"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainImage = images[selectedIndex] || null;

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl text-slate-600">📦</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative aspect-square overflow-hidden rounded-lg border transition ${
                selectedIndex === i
                  ? "border-blue-500 ring-2 ring-blue-500/30"
                  : "border-slate-700/50 hover:border-slate-500"
              }`}
            >
              <Image src={img} alt={`${title} ${i + 1}`} fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
