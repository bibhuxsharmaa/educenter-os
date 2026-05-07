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
type FeeStatus = "paid" | "unpaid";

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>(
    {}
  );
  const [fees, setFees] = useState<Record<number, FeeStatus>>({});
  const [messagesSent, setMessagesSent] = useState(0);

  const today = new Date().toLocaleDateString("en-CA");
  const attendanceKey = `educenter-attendance-${today}`;

  const now = new Date();
  const feeKey = `educenter-fees-${now.getFullYear()}-${now.getMonth() + 1}`;
  const messagesSentKey = `educenter-messages-sent-${now.getFullYear()}-${
    now.getMonth() + 1
  }`;

  useEffect(() => {
    const savedStudents = localStorage.getItem("educenter-students");
    const savedAttendance = localStorage.getItem(attendanceKey);
    const savedFees = localStorage.getItem(feeKey);
    const savedMessagesSent = localStorage.getItem(messagesSentKey);

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }

    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance));
    }

    if (savedFees) {
      setFees(JSON.parse(savedFees));
    }

    if (savedMessagesSent) {
      setMessagesSent(Number(savedMessagesSent));
    }
  }, [attendanceKey, feeKey, messagesSentKey]);

  const totalStudents = students.length;

  const totalMonthlyFees = students.reduce((total, student) => {
    return total + student.monthlyFee;
  }, 0);

  const collectedFees = students.reduce((total, student) => {
    if (fees[student.id] === "paid") {
      return total + student.monthlyFee;
    }

    return total;
  }, 0);

  const pendingFees = totalMonthlyFees - collectedFees;

  const presentCount = Object.values(attendance).filter(
    (status) => status === "present"
  ).length;

  const attendancePercentage =
    totalStudents === 0 ? 0 : Math.round((presentCount / totalStudents) * 100);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">EduCenter OS</h1>
          <p className="mt-2 text-gray-600">
            Manage students, attendance, fees, and communication from one place.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Total Students
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {totalStudents}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Today Attendance
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {attendancePercentage}%
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">Pending Fees</h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              ₹{pendingFees}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Messages Sent
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {messagesSent}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome to your institute dashboard
          </h2>

          <p className="mt-2 text-gray-600">
            This is the control center of EduCenter OS. You can manage students,
            mark attendance, track fees, and send WhatsApp reminders.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/students"
              className="rounded-lg bg-black px-5 py-3 text-white"
            >
              Add Student
            </Link>

            <Link
              href="/attendance"
              className="rounded-lg border border-gray-300 px-5 py-3 text-gray-800"
            >
              Mark Attendance
            </Link>

            <Link
              href="/fees"
              className="rounded-lg border border-gray-300 px-5 py-3 text-gray-800"
            >
              View Fees
            </Link>

            <Link
              href="/messages"
              className="rounded-lg border border-gray-300 px-5 py-3 text-gray-800"
            >
              Send Message
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}