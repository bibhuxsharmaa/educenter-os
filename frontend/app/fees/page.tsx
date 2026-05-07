"use client";

import { useEffect, useState } from "react";

type FeeSummary = {
  fee_month: number;
  fee_year: number;
  total_enrollments: number;
  total_due: number;
  total_paid: number;
  pending_amount: number;
  paid_students: number;
  pending_students: number;
};

type StudentFee = {
  payment_id: number | null;
  enrollment_id: number;
  student_id: number;
  student_name: string;
  course_id: number;
  course_name: string;
  batch_id: number;
  batch_name: string;
  fee_month: number;
  fee_year: number;
  amount_due: number;
  amount_paid: number;
  status: string;
  paid_at: string | null;
  notes: string | null;
};

const API_BASE_URL = "http://localhost:8000";

export default function FeesPage() {
  const [feeMonth, setFeeMonth] = useState(5);
  const [feeYear, setFeeYear] = useState(2026);

  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadFees() {
    try {
      setLoading(true);
      setError("");

      const summaryResponse = await fetch(
        `${API_BASE_URL}/fees/summary?fee_month=${feeMonth}&fee_year=${feeYear}`
      );

      if (!summaryResponse.ok) {
        throw new Error("Failed to load fee summary");
      }

      const summaryData = await summaryResponse.json();

      const studentsResponse = await fetch(
        `${API_BASE_URL}/fees/monthly-students?fee_month=${feeMonth}&fee_year=${feeYear}`
      );

      if (!studentsResponse.ok) {
        throw new Error("Failed to load student fees");
      }

      const studentsData = await studentsResponse.json();

      setSummary(summaryData);
      setStudentFees(studentsData);
    } catch (err) {
      console.error(err);
      setError("Could not load fees. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function markAsPaid(studentFee: StudentFee) {
    try {
      setActionLoadingId(studentFee.enrollment_id);
      setError("");

      const response = await fetch(`${API_BASE_URL}/fees/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollment_id: studentFee.enrollment_id,
          fee_month: feeMonth,
          fee_year: feeYear,
          amount_due: studentFee.amount_due,
          amount_paid: studentFee.amount_due,
          status: "paid",
          notes: "Paid from frontend",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark fee as paid");
      }

      await loadFees();
    } catch (err) {
      console.error(err);
      setError("Could not mark fee as paid.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function markAsPending(studentFee: StudentFee) {
    try {
      setActionLoadingId(studentFee.enrollment_id);
      setError("");

      const response = await fetch(`${API_BASE_URL}/fees/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollment_id: studentFee.enrollment_id,
          fee_month: feeMonth,
          fee_year: feeYear,
          amount_due: studentFee.amount_due,
          amount_paid: 0,
          status: "pending",
          notes: "Marked pending from frontend",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark fee as pending");
      }

      await loadFees();
    } catch (err) {
      console.error(err);
      setError("Could not mark fee as pending.");
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    loadFees();
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

  const thStyle: React.CSSProperties = {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: 700,
    color: "#374151",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  };

  const tdStyle: React.CSSProperties = {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#111827",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "middle",
  };

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, margin: 0 }}>
            Fees Management
          </h1>
          <p style={{ marginTop: "6px", color: "#4b5563", fontSize: "16px" }}>
            Track monthly fees, paid students, and pending payments.
          </p>
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
                  fontWeight: 600,
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
                  fontWeight: 600,
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

            <button
              type="button"
              onClick={loadFees}
              disabled={loading}
              style={{
                padding: "11px 16px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: loading ? "#93c5fd" : "#2563eb",
                color: "white",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
              }}
            >
              {loading ? "Loading..." : "Load Fees"}
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
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {summary && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div style={cardStyle}>
              <p style={{ color: "#6b7280", margin: 0 }}>Total Due</p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  margin: "8px 0 0",
                }}
              >
                ₹{summary.total_due}
              </p>
            </div>

            <div style={cardStyle}>
              <p style={{ color: "#6b7280", margin: 0 }}>Total Paid</p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#16a34a",
                  margin: "8px 0 0",
                }}
              >
                ₹{summary.total_paid}
              </p>
            </div>

            <div style={cardStyle}>
              <p style={{ color: "#6b7280", margin: 0 }}>Pending Amount</p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#dc2626",
                  margin: "8px 0 0",
                }}
              >
                ₹{summary.pending_amount}
              </p>
            </div>

            <div style={cardStyle}>
              <p style={{ color: "#6b7280", margin: 0 }}>Paid Students</p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  margin: "8px 0 0",
                }}
              >
                {summary.paid_students}
              </p>
            </div>

            <div style={cardStyle}>
              <p style={{ color: "#6b7280", margin: 0 }}>Pending Students</p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  margin: "8px 0 0",
                }}
              >
                {summary.pending_students}
              </p>
            </div>
          </div>
        )}

        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: 0 }}>
              Student Fee Status
            </h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: "1000px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Student</th>
                  <th style={thStyle}>Course</th>
                  <th style={thStyle}>Batch</th>
                  <th style={thStyle}>Due</th>
                  <th style={thStyle}>Paid</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {studentFees.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                        color: "#6b7280",
                        padding: "24px",
                      }}
                    >
                      No fee records found for this month.
                    </td>
                  </tr>
                )}

                {studentFees.map((studentFee) => {
                  const isPaid = studentFee.status === "paid";
                  const isUpdating =
                    actionLoadingId === studentFee.enrollment_id;

                  return (
                    <tr key={studentFee.enrollment_id}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>
                        {studentFee.student_name}
                      </td>

                      <td style={tdStyle}>{studentFee.course_name}</td>

                      <td style={tdStyle}>{studentFee.batch_name}</td>

                      <td style={{ ...tdStyle, fontWeight: 700 }}>
                        ₹{studentFee.amount_due}
                      </td>

                      <td style={{ ...tdStyle, fontWeight: 700 }}>
                        ₹{studentFee.amount_paid}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 800,
                            backgroundColor: isPaid ? "#dcfce7" : "#fee2e2",
                            color: isPaid ? "#15803d" : "#b91c1c",
                            textTransform: "uppercase",
                          }}
                        >
                          {studentFee.status}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {isPaid ? (
                          <button
                            type="button"
                            onClick={() => markAsPending(studentFee)}
                            disabled={isUpdating}
                            style={{
                              backgroundColor: isUpdating
                                ? "#fca5a5"
                                : "#dc2626",
                              color: "white",
                              padding: "9px 14px",
                              borderRadius: "8px",
                              border: "none",
                              fontWeight: 800,
                              cursor: isUpdating ? "not-allowed" : "pointer",
                              minWidth: "130px",
                            }}
                          >
                            {isUpdating ? "Updating..." : "Mark Pending"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => markAsPaid(studentFee)}
                            disabled={isUpdating}
                            style={{
                              backgroundColor: isUpdating
                                ? "#86efac"
                                : "#16a34a",
                              color: "white",
                              padding: "9px 14px",
                              borderRadius: "8px",
                              border: "none",
                              fontWeight: 800,
                              cursor: isUpdating ? "not-allowed" : "pointer",
                              minWidth: "130px",
                            }}
                          >
                            {isUpdating ? "Updating..." : "Mark Paid"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}