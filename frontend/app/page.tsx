"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DashboardStats = {
  students: {
    total: number;
    active: number;
  };
  courses: {
    total: number;
    active: number;
  };
  batches: {
    total: number;
    active: number;
  };
  enrollments: {
    total: number;
    active: number;
  };
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
    sent: number;
  };
};

const API_BASE_URL = "http://localhost:8000";

function getLocalTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
      setError("Could not load dashboard. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    padding: "24px",
    color: "#111827",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "16px",
    color: "#111827",
    backgroundColor: "white",
  };

  const navLinkStyle: React.CSSProperties = {
    display: "block",
    padding: "14px 16px",
    backgroundColor: "white",
    borderRadius: "12px",
    color: "#111827",
    textDecoration: "none",
    fontWeight: 700,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  };

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "34px", fontWeight: 900, margin: 0 }}>
            EduCenter OS Dashboard
          </h1>
          <p style={{ marginTop: "6px", color: "#4b5563", fontSize: "16px" }}>
            Live overview of students, courses, batches, fees, and attendance.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <Link href="/students" style={navLinkStyle}>
            Students
          </Link>
          <Link href="/courses" style={navLinkStyle}>
            Courses
          </Link>
          <Link href="/batches" style={navLinkStyle}>
            Batches
          </Link>
          <Link href="/enrollments" style={navLinkStyle}>
            Enrollments
          </Link>
          <Link href="/fees" style={navLinkStyle}>
            Fees
          </Link>
          <Link href="/attendance" style={navLinkStyle}>
            Attendance
          </Link>
          <Link href="/messages" style={navLinkStyle}>
            Messages
          </Link>
        </div>

        <div style={{ ...cardStyle, marginBottom: "24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#374151",
                }}
              >
                Fee Month
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={feeMonth}
                onChange={(e) => setFeeMonth(Number(e.target.value))}
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#374151",
                }}
              >
                Fee Year
              </label>
              <input
                type="number"
                value={feeYear}
                onChange={(e) => setFeeYear(Number(e.target.value))}
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#374151",
                }}
              >
                Attendance Date
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              type="button"
              onClick={loadDashboardStats}
              disabled={loading}
              style={{
                padding: "11px 16px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: loading ? "#93c5fd" : "#2563eb",
                color: "white",
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
              }}
            >
              {loading ? "Loading..." : "Refresh Dashboard"}
            </button>
          </div>

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {stats && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div style={cardStyle}>
                <p style={{ color: "#6b7280", margin: 0 }}>Total Students</p>
                <p
                  style={{
                    fontSize: "30px",
                    fontWeight: 900,
                    margin: "8px 0 0",
                  }}
                >
                  {stats.students.total}
                </p>
                <p style={{ color: "#16a34a", margin: "6px 0 0" }}>
                  Active: {stats.students.active}
                </p>
              </div>

              <div style={cardStyle}>
                <p style={{ color: "#6b7280", margin: 0 }}>Total Courses</p>
                <p
                  style={{
                    fontSize: "30px",
                    fontWeight: 900,
                    margin: "8px 0 0",
                  }}
                >
                  {stats.courses.total}
                </p>
                <p style={{ color: "#16a34a", margin: "6px 0 0" }}>
                  Active: {stats.courses.active}
                </p>
              </div>

              <div style={cardStyle}>
                <p style={{ color: "#6b7280", margin: 0 }}>Total Batches</p>
                <p
                  style={{
                    fontSize: "30px",
                    fontWeight: 900,
                    margin: "8px 0 0",
                  }}
                >
                  {stats.batches.total}
                </p>
                <p style={{ color: "#16a34a", margin: "6px 0 0" }}>
                  Active: {stats.batches.active}
                </p>
              </div>

              <div style={cardStyle}>
                <p style={{ color: "#6b7280", margin: 0 }}>Enrollments</p>
                <p
                  style={{
                    fontSize: "30px",
                    fontWeight: 900,
                    margin: "8px 0 0",
                  }}
                >
                  {stats.enrollments.total}
                </p>
                <p style={{ color: "#16a34a", margin: "6px 0 0" }}>
                  Active: {stats.enrollments.active}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div style={cardStyle}>
                <h2 style={{ fontSize: "20px", fontWeight: 900, margin: 0 }}>
                  Attendance
                </h2>
                <p style={{ color: "#6b7280", marginTop: "6px" }}>
                  Date: {stats.attendance.date}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                    marginTop: "16px",
                  }}
                >
                  <div>
                    <p style={{ color: "#6b7280", margin: 0 }}>Present</p>
                    <p
                      style={{
                        color: "#16a34a",
                        fontSize: "28px",
                        fontWeight: 900,
                        margin: "6px 0 0",
                      }}
                    >
                      {stats.attendance.present}
                    </p>
                  </div>

                  <div>
                    <p style={{ color: "#6b7280", margin: 0 }}>Absent</p>
                    <p
                      style={{
                        color: "#dc2626",
                        fontSize: "28px",
                        fontWeight: 900,
                        margin: "6px 0 0",
                      }}
                    >
                      {stats.attendance.absent}
                    </p>
                  </div>

                  <div>
                    <p style={{ color: "#6b7280", margin: 0 }}>Unmarked</p>
                    <p
                      style={{
                        color: "#ca8a04",
                        fontSize: "28px",
                        fontWeight: 900,
                        margin: "6px 0 0",
                      }}
                    >
                      {stats.attendance.unmarked}
                    </p>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h2 style={{ fontSize: "20px", fontWeight: 900, margin: 0 }}>
                  Fees
                </h2>
                <p style={{ color: "#6b7280", marginTop: "6px" }}>
                  Month: {stats.fees.month}/{stats.fees.year}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                    marginTop: "16px",
                  }}
                >
                  <div>
                    <p style={{ color: "#6b7280", margin: 0 }}>Due</p>
                    <p
                      style={{
                        fontSize: "26px",
                        fontWeight: 900,
                        margin: "6px 0 0",
                      }}
                    >
                      ₹{stats.fees.total_due}
                    </p>
                  </div>

                  <div>
                    <p style={{ color: "#6b7280", margin: 0 }}>Paid</p>
                    <p
                      style={{
                        color: "#16a34a",
                        fontSize: "26px",
                        fontWeight: 900,
                        margin: "6px 0 0",
                      }}
                    >
                      ₹{stats.fees.total_paid}
                    </p>
                  </div>

                  <div>
                    <p style={{ color: "#6b7280", margin: 0 }}>Pending</p>
                    <p
                      style={{
                        color: "#dc2626",
                        fontSize: "26px",
                        fontWeight: 900,
                        margin: "6px 0 0",
                      }}
                    >
                      ₹{stats.fees.pending_amount}
                    </p>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h2 style={{ fontSize: "20px", fontWeight: 900, margin: 0 }}>
                  Messages
                </h2>
                <p style={{ color: "#6b7280", marginTop: "6px" }}>
                  WhatsApp/SMS placeholder
                </p>

                <p
                  style={{
                    fontSize: "30px",
                    fontWeight: 900,
                    margin: "16px 0 0",
                  }}
                >
                  {stats.messages.sent}
                </p>
                <p style={{ color: "#6b7280", margin: "6px 0 0" }}>
                  Sent messages
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}