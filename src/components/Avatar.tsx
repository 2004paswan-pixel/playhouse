const PALETTE = [
  "bg-rose-500/20 text-rose-300",
  "bg-amber-500/20 text-amber-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-sky-500/20 text-sky-300",
  "bg-violet-500/20 text-violet-300",
  "bg-pink-500/20 text-pink-300",
  "bg-teal-500/20 text-teal-300",
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return PALETTE[hash % PALETTE.length];
}

function initialsFor(name: string) {
  const parts = name.replace(/\(.*?\)/g, "").trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Avatar({ name, size = 26 }: { name: string; size?: number }) {
  const isMe = name === "You";
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${
        isMe ? "bg-accent/25 text-accent" : colorFor(name)
      }`}
    >
      {isMe ? "Y" : initialsFor(name)}
    </span>
  );
}
