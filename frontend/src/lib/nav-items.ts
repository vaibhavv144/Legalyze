import {
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Upload,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const workspaceNavItems: NavItem[] = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Legal chat", href: "/app/chat", icon: MessageSquare },
  { label: "Upload contract", href: "/app/upload", icon: Upload },
  { label: "Documents", href: "/app/documents", icon: FileText },
  { label: "Profile", href: "/app/profile", icon: UserRound },
  { label: "Settings", href: "/app/settings", icon: Settings },
];
