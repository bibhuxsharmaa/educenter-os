"use client";

import { useEffect, useState } from "react";

type Batch = {
  id: number;
  name: string;
  course_id: number;
  start_time: string | null;
  end_time: string | null;
  days: string | null;
  status: string;
  created_at: string;
};

type AttendanceSummary = {
  batch_id: number;
  attendance_date: string;
  total_students: number;
  present_students: number;
  absent_students: number;
  unmarked_students: number;
};

type AttendanceStudent = {
  attendance_id: number | null;
  enrollment_id: number;
  student_id: number;
  student_name: string;
  course_id: number;
  course_name: string;
  batch_id: number;
  batch_name: string;
  attendance_date: string;
  status: string;
  notes: string | null;
  marked_at: string | null;
};

const API_BASE_URL = "http://localhost:8000";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export default function AttendancePage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<number>(1);
  const [attendanceDate, setAttendanceDate] = useState(getTodayDate());

  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [students, setStudents] = useState<AttendanceStudent[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadBatches() {
    try {
      const response = await fetch(`${API_BASE_URL}/batches/`);

      if (!response.ok) {
        throw new Error("Failed to load batches");
      }

      const data = await response.json();
      setBatches(data);

      if (data.length > 0) {
        setSelectedBatchId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Could not load batches.");
    }
  }

  async function loadAttendance(batchId = selectedBatchId, date = attendanceDate) {
    try {
      setLoading(true);
      setError("");

      const studentsResponse = await fetch(
        `${API_BASE_URL}/attendance/batch-students?batch_id=${batchId}&attendance_date=${date}`
      );

      if (!studentsResponse.ok) {
        throw new Error("Failed to load attendance students");
      }

      const studentsData = await studentsResponse.json();

      const summaryResponse = await fetch(
        `${API_BASE_URL}/attendance/summary?batch_id=${batchId}&attendance_date=${date}`
      );

      if (!summaryResponse.ok) {
        throw new Error("Failed to load attendance summary");
      }

      const summaryData = await summaryResponse.json();

      setStudents(studentsData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
      setError("Could not load attendance. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function markAttendance(student: AttendanceStudent, status: "present" | "absent") {
    try {
      setActionLoadingId(student.enrollment_id);
      setError("");

      const response = await fetch(`${API_BASE_URL}/attendance/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollment_id: student.enrollment_id,
          attendance_date: attendanceDate,
          status,
          notes: `Marked ${status} from frontend`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark attendance");
      }

      await loadAttendance();
    } catch (err) {
      console.error(err);
      setError("Could not mark attendance.");
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      loadAttendance(selectedBatchId, attendanceDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId]);

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
            Attendance Management
          </h1>
          <p style={{ marginTop: "6px", color: "#4b5563", fontSize: "16px" }}>
            Select a batch and date, then mark students present or absent.
          </p>
        </div>

        <div style={{ ...cardStyle, marginBottom: "24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
                Batch
              </label>

              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(Number(e.target.value))}
                style={inputStyle}
              >
                {batches.length === 0 && <option value={1}>Batch ID 1</option>}

                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
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
              onClick={() => loadAttendance()}
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
              {loading ? "Loading..." : "Load Attendance"}
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
              <p style={{ color: "#6b7280", margin: 0 }}>Total Students</p>
              <p style={{ fontSize: "28px", fontWeight: 800, margin: "8px 0 0" }}>
                {summary.total_students}
              </p>
            </div>

            <div style={cardStyle}>
              <p style={{ color: "#6b7280", margin: 0 }}>Present</p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#16a34a",
                  margin: "8px 0 0",
                }}
              >
                {summary.present_students}
              </p>
            </div>

            <div style={cardStyle}>
              <p style={{ color: "#6b7280", margin: 0 }}>Absent</p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#dc2626",
                  margin: "8px 0 0",
                }}
              >
                {summary.absent_students}
              </p>
            </div>

            <div style={cardStyle}>
              <p style={{ color: "#6b7280", margin: 0 }}>Unmarked</p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#ca8a04",
                  margin: "8px 0 0",
                }}
              >
                {summary.unmarked_students}
              </p>
            </div>
          </div>
        )}

        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: 0 }}>
              Student Attendance
            </h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: "900px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Student</th>
                  <th style={thStyle}>Course</th>
                  <th style={thStyle}>Batch</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {students.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                        color: "#6b7280",
                        padding: "24px",
                      }}
                    >
                      No students found for this batch.
                    </td>
                  </tr>
                )}

                {students.map((student) => {
                  const isPresent = student.status === "present";
                  const isAbsent = student.status === "absent";
                  const isUnmarked = student.status === "unmarked";
                  const isUpdating = actionLoadingId === student.enrollment_id;

                  return (
                    <tr key={student.enrollment_id}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>
                        {student.student_name}
                      </td>

                      <td style={tdStyle}>{student.course_name}</td>

                      <td style={tdStyle}>{student.batch_name}</td>

                      <td style={tdStyle}>{student.attendance_date}</td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 800,
                            backgroundColor: isPresent
                              ? "#dcfce7"
                              : isAbsent
                              ? "#fee2e2"
                              : "#fef9c3",
                            color: isPresent
                              ? "#15803d"
                              : isAbsent
                              ? "#b91c1c"
                              : "#854d0e",
                            textTransform: "uppercase",
                          }}
                        >
                          {student.status}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            type="button"
                            onClick={() => markAttendance(student, "present")}
                            disabled={isUpdating}
                            style={{
                              backgroundColor: isUpdating ? "#86efac" : "#16a34a",
                              color: "white",
                              padding: "9px 14px",
                              borderRadius: "8px",
                              border: "none",
                              fontWeight: 800,
                              cursor: isUpdating ? "not-allowed" : "pointer",
                              minWidth: "100px",
                              opacity: isPresent ? 0.65 : 1,
                            }}
                          >
                            {isUpdating ? "Updating..." : "Present"}
                          </button>

                          <button
                            type="button"
                            onClick={() => markAttendance(student, "absent")}
                            disabled={isUpdating}
                            style={{
                              backgroundColor: isUpdating ? "#fca5a5" : "#dc2626",
                              color: "white",
                              padding: "9px 14px",
                              borderRadius: "8px",
                              border: "none",
                              fontWeight: 800,
                              cursor: isUpdating ? "not-allowed" : "pointer",
                              minWidth: "100px",
                              opacity: isAbsent ? 0.65 : 1,
                            }}
                          >
                            {isUpdating ? "Updating..." : "Absent"}
                          </button>

                          {isUnmarked && (
                            <span
                              style={{
                                alignSelf: "center",
                                color: "#6b7280",
                                fontSize: "13px",
                                fontWeight: 600,
                              }}
                            >
                              Not marked yet
                            </span>
                          )}
                        </div>
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