"use client";
import { useSession } from "next-auth/react";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { data: session } = useSession();
  const initials = session?.user?.name
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "A";

  return (
    <header  className="fixed top-0 right-0 lg:left-64 h-16 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-20 backdrop-blur-xl"
  style={{ background: "rgba(15,23,42,0.85)" }}>
      <div >
        <h1 className="text-xl font-bold text-white lg:ml-0 ml-10">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5 lg:ml-0 ml-10">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-slate-200 leading-tight">{session?.user?.name}</p>
          <p className="text-xs text-slate-500">{session?.user?.email}</p>
        </div>
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex-shrink-0">
          {initials}
        </div>
      </div>
    </header>
  );
}
