"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  IndianRupee,
  MessageCircle,
  Plus,
  Send,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import PremiumShell from "./components/PremiumShell";

type DashboardStats = {
  students: { total: number; active: number };
  courses: { total: number; active: number };
  batches: { total: number; active: number };
  enrollments: { total: number; active: number };
  attendance: {
    date: string;
    present: number;
    absent: number;
    unmarked: number;
  };
  fees: {
    month: number;
    year: number;
    total_due: number;
    total_paid: number;
    pending_amount: number;
  };
  messages: {
    total?: number;
    sent: number;
    draft?: number;
    failed?: number;
  };
};

const API_BASE_URL = "http://192.168.1.18:30081";

function getLocalTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function StatCard({
  title,
  value,
  trend,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <p>{title}</p>
        <h3>{value}</h3>
        <span>{trend}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const today = new Date();

  const [feeMonth, setFeeMonth] = useState(today.getMonth() + 1);
  const [feeYear, setFeeYear] = useState(today.getFullYear());
  const [attendanceDate, setAttendanceDate] = useState(getLocalTodayDate());

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboardStats() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/dashboard/stats?fee_month=${feeMonth}&fee_year=${feeYear}&attendance_date=${attendanceDate}`
      );

      if (!response.ok) {
        throw new Error("Failed to load dashboard stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError("Could not load live dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const attendanceTotal =
    (stats?.attendance.present || 0) +
    (stats?.attendance.absent || 0) +
    (stats?.attendance.unmarked || 0);

  const presentPercent = attendanceTotal
    ? Math.round(((stats?.attendance.present || 0) / attendanceTotal) * 100)
    : 0;

  const absentPercent = attendanceTotal
    ? Math.round(((stats?.attendance.absent || 0) / attendanceTotal) * 100)
    : 0;

  const donutStyle = useMemo(() => {
    const present = presentPercent * 3.6;
    const absent = absentPercent * 3.6;

    return {
      background: `conic-gradient(#20d98b 0deg ${present}deg, #ff4d6d ${present}deg ${
        present + absent
      }deg, #f5c542 ${present + absent}deg 360deg)`,
    };
  }, [presentPercent, absentPercent]);

  return (
    <PremiumShell>
      <div className="dashboard-page">
        <section className="hero-card">
          <div className="hero-content">
            <span className="eyebrow">Welcome back, Admin</span>
            <h1>Good morning! 👋</h1>
            <p>Here&apos;s what&apos;s happening at EduCenter OS today.</p>

            <div className="hero-meta">
              <span>
                <CalendarDays size={18} />
                {today.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span>
                <Zap size={18} />
                Live homelab system
              </span>
            </div>
          </div>

          <div className="hologram">
            <div className="holo-orbit"></div>
            <div className="holo-card">
              <BookOpen size={58} />
            </div>
            <div className="holo-base"></div>
          </div>
        </section>

        <section className="filter-card">
          <div>
            <label>Fee Month</label>
            <input
              type="number"
              min="1"
              max="12"
              value={feeMonth}
              onChange={(e) => setFeeMonth(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Fee Year</label>
            <input
              type="number"
              value={feeYear}
              onChange={(e) => setFeeYear(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Attendance Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>

          <button onClick={loadDashboardStats} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </section>

        {error && <div className="premium-error">{error}</div>}

        <section className="stats-grid">
          <StatCard
            title="Total Students"
            value={stats?.students.total ?? 0}
            trend={`${stats?.students.active ?? 0} active`}
            icon={<Users size={24} />}
            tone="violet"
          />

          <StatCard
            title="Active Courses"
            value={stats?.courses.active ?? 0}
            trend={`${stats?.courses.total ?? 0} total courses`}
            icon={<BookOpen size={24} />}
            tone="cyan"
          />

          <StatCard
            title="Active Batches"
            value={stats?.batches.active ?? 0}
            trend={`${stats?.batches.total ?? 0} total batches`}
            icon={<CalendarDays size={24} />}
            tone="green"
          />

          <StatCard
            title="Enrollments"
            value={stats?.enrollments.total ?? 0}
            trend={`${stats?.enrollments.active ?? 0} active`}
            icon={<UserCheck size={24} />}
            tone="orange"
          />

          <StatCard
            title="Monthly Fees"
            value={formatMoney(stats?.fees.total_due ?? 0)}
            trend={`${formatMoney(stats?.fees.total_paid ?? 0)} paid`}
            icon={<IndianRupee size={24} />}
            tone="pink"
          />

          <StatCard
            title="Messages Sent"
            value={stats?.messages.sent ?? 0}
            trend={`${stats?.messages.total ?? stats?.messages.sent ?? 0} total`}
            icon={<MessageCircle size={24} />}
            tone="blue"
          />
        </section>

        <section className="insight-grid">
          <div className="premium-panel attendance-panel">
            <div className="panel-head">
              <h2>Attendance Summary</h2>
              <span>Today</span>
            </div>

            <div className="attendance-body">
              <div className="donut" style={donutStyle}>
                <div>
                  <strong>{attendanceTotal}</strong>
                  <small>Total</small>
                </div>
              </div>

              <div className="legend-list">
                <div>
                  <span className="legend-dot present"></span>
                  Present
                  <strong>{stats?.attendance.present ?? 0}</strong>
                </div>
                <div>
                  <span className="legend-dot absent"></span>
                  Absent
                  <strong>{stats?.attendance.absent ?? 0}</strong>
                </div>
                <div>
                  <span className="legend-dot unmarked"></span>
                  Unmarked
                  <strong>{stats?.attendance.unmarked ?? 0}</strong>
                </div>
              </div>
            </div>

            <Link href="/attendance" className="panel-link">
              View Attendance <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="premium-panel">
            <div className="panel-head">
              <h2>Fees Summary</h2>
              <span>
                {feeMonth}/{feeYear}
              </span>
            </div>

            <div className="money-list">
              <div>
                <p>Total Due</p>
                <strong>{formatMoney(stats?.fees.total_due ?? 0)}</strong>
              </div>
              <div>
                <p>Total Paid</p>
                <strong className="money-green">
                  {formatMoney(stats?.fees.total_paid ?? 0)}
                </strong>
              </div>
              <div>
                <p>Pending Amount</p>
                <strong className="money-red">
                  {formatMoney(stats?.fees.pending_amount ?? 0)}
                </strong>
              </div>
            </div>

            <Link href="/fees" className="panel-link">
              View Fees <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="premium-panel">
            <div className="panel-head">
              <h2>Quick Actions</h2>
              <span>Fast tools</span>
            </div>

            <div className="quick-grid">
              <Link href="/students">
                <Plus size={24} />
                Add Student
              </Link>
              <Link href="/courses">
                <BookOpen size={24} />
                Create Course
              </Link>
              <Link href="/batches">
                <CalendarDays size={24} />
                New Batch
              </Link>
              <Link href="/attendance">
                <UserCheck size={24} />
                Mark Attendance
              </Link>
              <Link href="/fees">
                <IndianRupee size={24} />
                Record Payment
              </Link>
              <Link href="/messages">
                <Send size={24} />
                Send Message
              </Link>
            </div>
          </div>
        </section>

        <section className="recent-panel">
          <div className="panel-head">
            <h2>Recent Activity</h2>
            <span>Live updates</span>
          </div>

          <div className="activity-row">
            <div className="activity-dot"></div>
            <p>EduCenter OS dashboard connected to live Kubernetes backend.</p>
            <strong>Healthy</strong>
          </div>
        </section>
      </div>
    </PremiumShell>
  );
}
