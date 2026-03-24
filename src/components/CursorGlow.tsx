"use client";

import { useEffect } from "react";

export default function CursorGlow() {
  useEffect(() => {
    const finePointer = matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (!finePointer) return;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = 0,
      my = 0;
    let rx = 0,
      ry = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    window.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      },
      { passive: true },
    );

    const tick = () => {
      if (!reduceMotion) {
        rx = lerp(rx, mx, 0.18);
        ry = lerp(ry, my, 0.18);
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      } else {
        ring.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      }
      requestAnimationFrame(tick);
    };
    tick();

    const hoverSelector =
      "a, button, [role='button'], input, textarea, select, [data-cursor='hover']";
    const setHover = (on: boolean) => {
      if (on) {
        ring.classList.add('is-active');
      } else {
        ring.classList.remove('is-active');
      }
    };

    document.addEventListener("mouseover", (e: MouseEvent) => {
      if (e.target && (e.target as Element).closest && (e.target as Element).closest(hoverSelector))
        setHover(true);
    });
    document.addEventListener("mouseout", (e: MouseEvent) => {
      if (e.target && (e.target as Element).closest && (e.target as Element).closest(hoverSelector))
        setHover(false);
    });

    return () => {
      window.removeEventListener("mousemove", () => {});
      document.removeEventListener("mouseover", () => {});
      document.removeEventListener("mouseout", () => {});
      dot.remove();
      ring.remove();
    };
  }, []);

  return null;
}
