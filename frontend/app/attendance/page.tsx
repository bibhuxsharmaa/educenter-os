"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type EnrollmentDetail = {
  id: number;
  student_id: number;
  student_name: string;
  course_id: number;
  course_name: string;
  batch_id: number;
  batch_name: string;
  monthly_fee: string | number;
  status: string;
  created_at: string;
};

type AttendanceDetail = {
  id: number;
  enrollment_id: number;
  attendance_date: string;
  status: "present" | "absent";
  notes: string | null;
  student_name: string;
  course_name: string;
  batch_name: string;
  created_at: string;
};

type AttendanceStatus = "present" | "absent";

const API_URL = "http://localhost:8000";

export default function AttendancePage() {
  const [enrollments, setEnrollments] = useState<EnrollmentDetail[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<number, AttendanceDetail>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-CA");

  async function fetchEnrollments() {
    const response = await fetch(`${API_URL}/enrollments/details`);

    if (!response.ok) {
      throw new Error("Failed to fetch enrollments");
    }

    const data = await response.json();
    setEnrollments(data);
  }

  async function fetchTodayAttendance() {
    const response = await fetch(
      `${API_URL}/attendance/details?attendance_date=${today}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch attendance");
    }

    const data: AttendanceDetail[] = await response.json();

    const mappedRecords: Record<number, AttendanceDetail> = {};

    data.forEach((record) => {
      mappedRecords[record.enrollment_id] = record;
    });

    setAttendanceRecords(mappedRecords);
  }

  async function loadPageData() {
    try {
      await Promise.all([fetchEnrollments(), fetchTodayAttendance()]);
    } catch (error) {
      console.error(error);
      alert("Could not load attendance data from backend");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  async function markAttendance(
    enrollmentId: number,
    status: AttendanceStatus
  ) {
    try {
      const response = await fetch(`${API_URL}/attendance/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollment_id: enrollmentId,
          attendance_date: today,
          status,
          notes: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark attendance");
      }

      await fetchTodayAttendance();
    } catch (error) {
      console.error(error);
      alert("Could not mark attendance");
    }
  }

  const presentCount = Object.values(attendanceRecords).filter(
    (record) => record.status === "present"
  ).length;

  const absentCount = Object.values(attendanceRecords).filter(
    (record) => record.status === "absent"
  ).length;

  const totalEnrollments = enrollments.length;

  const attendancePercentage =
    totalEnrollments === 0
      ? 0
      : Math.round((presentCount / totalEnrollments) * 100);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black">
          ← Back to Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-2 text-gray-600">
            Mark attendance using enrollments from PostgreSQL.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Total Enrollments
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {totalEnrollments}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">Present Today</h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {presentCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">Absent Today</h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {absentCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Attendance %
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {attendancePercentage}%
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">
            Today: {today}
          </h2>

          {isLoading ? (
            <p className="mt-4 text-gray-600">Loading attendance...</p>
          ) : enrollments.length === 0 ? (
            <div className="mt-4">
              <p className="text-gray-600">
                No enrollments found. Create an enrollment first.
              </p>

              <Link
                href="/enrollments"
                className="mt-4 inline-block rounded-lg bg-black px-5 py-3 text-white"
              >
                Manage Enrollments
              </Link>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-3">Student</th>
                    <th className="py-3">Course</th>
                    <th className="py-3">Batch</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {enrollments.map((enrollment) => {
                    const attendance = attendanceRecords[enrollment.id];

                    return (
                      <tr key={enrollment.id} className="border-b text-gray-900">
                        <td className="py-3">{enrollment.student_name}</td>
                        <td className="py-3">{enrollment.course_name}</td>
                        <td className="py-3">{enrollment.batch_name}</td>
                        <td className="py-3">
                          {attendance ? (
                            <span className="font-semibold capitalize">
                              {attendance.status}
                            </span>
                          ) : (
                            <span className="text-gray-500">Not marked</span>
                          )}
                        </td>
                        <td className="flex gap-3 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              markAttendance(enrollment.id, "present")
                            }
                            className="rounded-lg bg-black px-4 py-2 text-white"
                          >
                            Present
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              markAttendance(enrollment.id, "absent")
                            }
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
                          >
                            Absent
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}