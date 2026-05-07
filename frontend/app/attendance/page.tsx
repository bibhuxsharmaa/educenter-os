"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Student = {
  id: number;
  name: string;
  phone: string;
  course: string;
  monthlyFee: number;
};

type AttendanceStatus = "present" | "absent";

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>(
    {}
  );

  const today = new Date().toLocaleDateString("en-CA");
  const attendanceKey = `educenter-attendance-${today}`;

  useEffect(() => {
    const savedStudents = localStorage.getItem("educenter-students");
    const savedAttendance = localStorage.getItem(attendanceKey);

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }

    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance));
    }
  }, [attendanceKey]);

  function markAttendance(studentId: number, status: AttendanceStatus) {
    const updatedAttendance = {
      ...attendance,
      [studentId]: status,
    };

    setAttendance(updatedAttendance);
    localStorage.setItem(attendanceKey, JSON.stringify(updatedAttendance));
  }

  const presentCount = Object.values(attendance).filter(
    (status) => status === "present"
  ).length;

  const totalStudents = students.length;

  const attendancePercentage =
    totalStudents === 0 ? 0 : Math.round((presentCount / totalStudents) * 100);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <section className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black">
          ← Back to Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-2 text-gray-600">
            Mark today&apos;s attendance for your students.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Total Students
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {totalStudents}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">Present Today</h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {presentCount}
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

          {students.length === 0 ? (
            <div className="mt-4">
              <p className="text-gray-600">No students found.</p>
              <Link
                href="/students"
                className="mt-4 inline-block rounded-lg bg-black px-5 py-3 text-white"
              >
                Add Student First
              </Link>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-3">Name</th>
                    <th className="py-3">Course / Batch</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b text-gray-900">
                      <td className="py-3">{student.name}</td>
                      <td className="py-3">{student.course}</td>
                      <td className="py-3">
                        {attendance[student.id] ? (
                          <span className="font-semibold capitalize">
                            {attendance[student.id]}
                          </span>
                        ) : (
                          <span className="text-gray-500">Not marked</span>
                        )}
                      </td>
                      <td className="flex gap-3 py-3">
                        <button
                          type="button"
                          onClick={() => markAttendance(student.id, "present")}
                          className="rounded-lg bg-black px-4 py-2 text-white"
                        >
                          Present
                        </button>

                        <button
                          type="button"
                          onClick={() => markAttendance(student.id, "absent")}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
                        >
                          Absent
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}