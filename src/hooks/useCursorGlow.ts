"use client";

import { useEffect } from "react";

export function useCursorGlow(selector = ".cursor-glow") {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(selector));
    const handlers = new Map();

    els.forEach((el) => {
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        (el as HTMLElement).style.setProperty("--mx", x + "%");
        (el as HTMLElement).style.setProperty("--my", y + "%");
      };
      (el as HTMLElement).addEventListener("mousemove", onMove as EventListener);
      handlers.set(el, onMove);
    });

    return () => {
      handlers.forEach((fn, el) => (el as HTMLElement).removeEventListener("mousemove", fn as EventListener));
    };
  }, [selector]);
}
