"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function MotionEnhancer() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      const heroes = gsap.utils.toArray<HTMLElement>(".workspace-hero, .readiness-hero");
      if (heroes.length > 0) {
        gsap.fromTo(
          heroes,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
        );
      }

      gsap.utils.toArray<HTMLElement>(".panel").forEach((panel) => {
        gsap.fromTo(
          panel,
          { y: 18, opacity: 0.88 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              start: "top 92%",
              once: true
            }
          }
        );
      });

      gsap.utils.toArray<HTMLElement>(".audit-card").forEach((card) => {
        gsap.fromTo(
          card,
          { scale: 0.97, opacity: 0.65 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "center center",
              scrub: true
            }
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return null;
}
