'use client';
import { useEffect, useState } from "react";

export default function MinimalTest() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/portfolio")
      .then(r => r.json())
      .then(setData)
      .catch(setError);
  }, []);

  return (
    <div>
      <h1>Minimal Test</h1>
      {error && <p>Error: {String(error)}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
