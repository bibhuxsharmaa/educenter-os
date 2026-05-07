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
type AttendanceStatus = "present" | "absent";

type MessageType = "fee" | "attendance" | "class" | "exam";

export default function MessagesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("fee");
  const [customMessage, setCustomMessage] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [messagesSent, setMessagesSent] = useState(0);

  const today = new Date().toLocaleDateString("en-CA");
  const attendanceKey = `educenter-attendance-${today}`;

  const now = new Date();
  const feeKey = `educenter-fees-${now.getFullYear()}-${now.getMonth() + 1}`;
  const messagesSentKey = `educenter-messages-sent-${now.getFullYear()}-${
    now.getMonth() + 1
  }`;

  const [fees, setFees] = useState<Record<number, FeeStatus>>({});
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>(
    {}
  );

  useEffect(() => {
    const savedStudents = localStorage.getItem("educenter-students");
    const savedFees = localStorage.getItem(feeKey);
    const savedAttendance = localStorage.getItem(attendanceKey);
    const savedMessagesSent = localStorage.getItem(messagesSentKey);

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }

    if (savedFees) {
      setFees(JSON.parse(savedFees));
    }

    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance));
    }

    if (savedMessagesSent) {
      setMessagesSent(Number(savedMessagesSent));
    }
  }, [feeKey, attendanceKey, messagesSentKey]);

  const selectedStudent = students.find(
    (student) => student.id === Number(selectedStudentId)
  );

  function generateMessage() {
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }

    let message = "";

    if (messageType === "fee") {
      const status = fees[selectedStudent.id] || "unpaid";

      if (status === "paid") {
        message = `Hello ${selectedStudent.name}, your monthly fee of ₹${selectedStudent.monthlyFee} is already marked as paid. Thank you.`;
      } else {
        message = `Hello ${selectedStudent.name}, this is a reminder that your monthly fee of ₹${selectedStudent.monthlyFee} for ${selectedStudent.course} is pending. Please pay it soon.`;
      }
    }

    if (messageType === "attendance") {
      const status = attendance[selectedStudent.id];

      if (status === "present") {
        message = `Hello ${selectedStudent.name}, your attendance for today is marked as present.`;
      } else if (status === "absent") {
        message = `Hello ${selectedStudent.name}, you were marked absent today in ${selectedStudent.course}. Please contact the institute if this is incorrect.`;
      } else {
        message = `Hello ${selectedStudent.name}, your attendance for today has not been marked yet.`;
      }
    }

    if (messageType === "class") {
      message = `Hello ${selectedStudent.name}, this is an update regarding your ${selectedStudent.course} class. Please check with the institute for details.`;
    }

    if (messageType === "exam") {
      message = `Hello ${selectedStudent.name}, this is an exam notice for ${selectedStudent.course}. Please prepare accordingly and contact the institute for schedule details.`;
    }

    if (customMessage.trim()) {
      message = customMessage;
    }

    setGeneratedMessage(message);
  }

  function openWhatsApp() {
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }

    if (!generatedMessage) {
      alert("Please generate a message first");
      return;
    }

    const cleanedPhoneNumber = selectedStudent.phone.replace(/\D/g, "");

    const finalPhoneNumber =
      cleanedPhoneNumber.length === 10
        ? `91${cleanedPhoneNumber}`
        : cleanedPhoneNumber;

    const whatsappUrl = `https://wa.me/${finalPhoneNumber}?text=${encodeURIComponent(
      generatedMessage
    )}`;

    const updatedMessagesSent = messagesSent + 1;

    setMessagesSent(updatedMessagesSent);
    localStorage.setItem(messagesSentKey, String(updatedMessagesSent));

    window.open(whatsappUrl, "_blank");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <section className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black">
          ← Back to Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-bold text-gray-900">Messages</h1>
          <p className="mt-2 text-gray-600">
            Generate WhatsApp reminders for fees, attendance, classes, and exams.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Messages Sent This Month
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {messagesSent}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Total Students
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {students.length}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">
            Create Message
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
            <div className="mt-6 grid gap-4">
              <select
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.course}
                  </option>
                ))}
              </select>

              <select
                value={messageType}
                onChange={(event) =>
                  setMessageType(event.target.value as MessageType)
                }
                className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
              >
                <option value="fee">Fee Reminder</option>
                <option value="attendance">Attendance Reminder</option>
                <option value="class">Class Update</option>
                <option value="exam">Exam Notice</option>
              </select>

              <textarea
                placeholder="Optional custom message. Leave empty to auto-generate."
                value={customMessage}
                onChange={(event) => setCustomMessage(event.target.value)}
                className="min-h-32 rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
              />

              <button
                type="button"
                onClick={generateMessage}
                className="rounded-lg bg-black px-5 py-3 text-white"
              >
                Generate Message
              </button>
            </div>
          )}
        </div>

        {generatedMessage && (
          <div className="mt-8 rounded-xl bg-white p-6 shadow">
            <h2 className="text-2xl font-semibold text-gray-900">
              Generated Message
            </h2>

            <p className="mt-4 rounded-lg bg-gray-100 p-4 text-gray-800">
              {generatedMessage}
            </p>

            <button
              type="button"
              onClick={openWhatsApp}
              className="mt-5 rounded-lg bg-green-600 px-5 py-3 text-white"
            >
              Open in WhatsApp
            </button>
          </div>
        )}
      </section>
    </main>
  );
}