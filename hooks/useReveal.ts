"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 뷰포트에 들어온 순간 한 번만 켜지는 플래그.
 * 이미 화면 안에 있으면 옵저버를 기다리지 않고 즉시 켠다.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (node === null) return;

    // 첫 화면에 이미 걸쳐 있는 회차는 진입 연출을 기다릴 이유가 없다.
    if (node.getBoundingClientRect().top < window.innerHeight) {
      setRevealed(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}
