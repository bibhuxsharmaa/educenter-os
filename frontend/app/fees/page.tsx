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

type FeeStatus = "paid" | "unpaid";

export default function FeesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<Record<number, FeeStatus>>({});

  const now = new Date();
  const currentMonth = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const feeKey = `educenter-fees-${now.getFullYear()}-${now.getMonth() + 1}`;

  useEffect(() => {
    const savedStudents = localStorage.getItem("educenter-students");
    const savedFees = localStorage.getItem(feeKey);

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }

    if (savedFees) {
      setFees(JSON.parse(savedFees));
    }
  }, [feeKey]);

  function updateFeeStatus(studentId: number, status: FeeStatus) {
    const updatedFees = {
      ...fees,
      [studentId]: status,
    };

    setFees(updatedFees);
    localStorage.setItem(feeKey, JSON.stringify(updatedFees));
  }

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

  const paidStudents = students.filter(
    (student) => fees[student.id] === "paid"
  ).length;

  const pendingStudents = students.length - paidStudents;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black">
          ← Back to Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-bold text-gray-900">Fees</h1>
          <p className="mt-2 text-gray-600">
            Track monthly fee collection and pending payments.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Total Monthly Fees
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              ₹{totalMonthlyFees}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Collected Fees
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              ₹{collectedFees}
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
              Pending Students
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {pendingStudents}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">
            {currentMonth} Fee Status
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
                    <th className="py-3">Monthly Fee</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => {
                    const status = fees[student.id] || "unpaid";

                    return (
                      <tr key={student.id} className="border-b text-gray-900">
                        <td className="py-3">{student.name}</td>
                        <td className="py-3">{student.course}</td>
                        <td className="py-3">₹{student.monthlyFee}</td>
                        <td className="py-3">
                          {status === "paid" ? (
                            <span className="font-semibold text-green-700">
                              Paid
                            </span>
                          ) : (
                            <span className="font-semibold text-red-600">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="flex gap-3 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              updateFeeStatus(student.id, "paid")
                            }
                            className="rounded-lg bg-black px-4 py-2 text-white"
                          >
                            Mark Paid
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateFeeStatus(student.id, "unpaid")
                            }
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
                          >
                            Mark Pending
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