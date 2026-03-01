// src/components/LiveDate.tsx
"use client";
import { useEffect, useState } from "react";

type Props = { className?: string };

export default function LiveDate({ className = "" }: Props) {
  const [text, setText] = useState<string | null>(null); // null on SSR

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const update = () => setText(fmt.format(new Date()));

    update();                             // first paint on client
    const id = setInterval(update, 60_000); // update every minute
    return () => clearInterval(id);
  }, []);

  // Avoid SSR/client mismatch
  return (
    <span className={className} suppressHydrationWarning>
      {text ?? ""}
    </span>
  );
}
