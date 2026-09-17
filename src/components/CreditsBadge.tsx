import { Coins } from "lucide-react";

export default function CreditsBadge({ credits }: { credits: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
      <Coins size={14} />
      {credits}
      <span className="text-xs font-normal text-accent/80">credits</span>
    </div>
  );
}
