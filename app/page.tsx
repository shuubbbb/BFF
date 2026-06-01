"use client";
import { useState } from "react";

export default function Page() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Test: {count}</h1>
      <button onClick={() => setCount((c) => c + 1)}>click</button>
    </div>
  );
}
