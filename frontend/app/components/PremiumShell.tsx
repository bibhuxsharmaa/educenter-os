"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  ClipboardList,
  IndianRupee,
  UserCheck,
  MessageCircle,
  Search,
  Bell,
  ChevronDown,
  Layers3,
  Crown,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Students", href: "/students", icon: Users },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Batches", href: "/batches", icon: CalendarDays },
  { label: "Enrollments", href: "/enrollments", icon: ClipboardList },
  { label: "Fees", href: "/fees", icon: IndianRupee },
  { label: "Attendance", href: "/attendance", icon: UserCheck },
  { label: "Messages", href: "/messages", icon: MessageCircle },
];

export default function PremiumShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="premium-app">
      <aside className="premium-sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Layers3 size={24} />
          </div>
          <span>EduCenter OS</span>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? "active" : ""}`}
              >
                <Icon size={21} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-status">
          <div className="status-title">
            <ShieldCheck size={15} />
            System Status
          </div>
          <div className="status-healthy">● Healthy</div>
          <div className="status-version">Version 0.1.0</div>
        </div>

        <div className="pro-card">
          <Crown size={22} />
          <div>
            <strong>Premium Console</strong>
            <p>Modern analytics, automation and smart operations.</p>
          </div>
        </div>
      </aside>

      <section className="premium-main">
        <header className="premium-topbar">
          <div className="search-box">
            <Search size={18} />
            <span>Search students, courses, batches...</span>
            <kbd>⌘K</kbd>
          </div>

          <div className="topbar-right">
            <button className="icon-button">
              <Bell size={20} />
              <span className="notification-dot">3</span>
            </button>

            <div className="profile-box">
              <div className="avatar">LW</div>
              <div>
                <strong>Admin</strong>
                <p>Administrator</p>
              </div>
              <ChevronDown size={18} />
            </div>
          </div>
        </header>

        {children}
      </section>
    </div>
  );
}
