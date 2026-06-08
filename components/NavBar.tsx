"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Layers, 
  Radar, 
  Sparkles, 
  Mail, 
  Settings, 
  Bot 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NavBar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Pipeline Hub", href: "/pipeline", icon: Layers },
    { name: "Job Radar", href: "/radar", icon: Radar },
    { name: "Resume Shapeshifter", href: "/tailor", icon: Sparkles },
    { name: "The Closer (Outreach)", href: "/closer", icon: Mail },
    { name: "Profile Settings", href: "/profile", icon: Settings },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-slate-950 border-r border-white/5 text-white">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-white/5">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-cyan-500 to-emerald-500 p-[1.2px] shadow-md shadow-indigo-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-slate-950">
            <Bot className="h-4 w-4 text-cyan-400" />
          </div>
        </div>
        <span className="text-lg font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Hunt<span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">OS</span>
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/tailor" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/5 text-indigo-300 border-l-2 border-indigo-500 shadow-md shadow-indigo-500/5"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform group-hover:scale-110 duration-300",
                  isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/5 bg-slate-950/40 text-[10px] text-slate-500 text-center">
        HuntOS v1.0.0 &bull; Local Mode
      </div>
    </div>
  );
}
