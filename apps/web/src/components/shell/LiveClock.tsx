import { useEffect, useState } from 'react';

function format(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const data = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  const hora = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return { data, hora };
}

export function LiveClock() {
  const [now, setNow] = useState(() => format(new Date()));

  useEffect(() => {
    const interval = setInterval(() => setNow(format(new Date())), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="leading-tight">
      <div className="text-xs text-foreground">{now.data}</div>
      <div className="text-xs text-muted">{now.hora}</div>
    </div>
  );
}
