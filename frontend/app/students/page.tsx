"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Student = {
  id: number;
  name: string;
  phone: string;
  course: string;
  monthlyFee: number;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");

  useEffect(() => {
    const savedStudents = localStorage.getItem("educenter-students");

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("educenter-students", JSON.stringify(students));
    }
  }, [students, hasLoaded]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name || !phone || !course || !monthlyFee) {
      alert("Please fill all fields");
      return;
    }

    const newStudent: Student = {
      id: Date.now(),
      name,
      phone,
      course,
      monthlyFee: Number(monthlyFee),
    };

    setStudents((currentStudents) => [newStudent, ...currentStudents]);

    setName("");
    setPhone("");
    setCourse("");
    setMonthlyFee("");
  }

  function deleteStudent(id: number) {
    setStudents((currentStudents) =>
      currentStudents.filter((student) => student.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <section className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black">
          ← Back to Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-bold text-gray-900">Students</h1>
          <p className="mt-2 text-gray-600">
            Add and manage students in your institute.
          </p>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">
            Add New Student
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <input
              type="text"
              placeholder="Student name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <input
              type="text"
              placeholder="Phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <input
              type="text"
              placeholder="Course / Batch"
              value={course}
              onChange={(event) => setCourse(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <input
              type="number"
              placeholder="Monthly fee"
              value={monthlyFee}
              onChange={(event) => setMonthlyFee(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <button
              type="submit"
              className="mt-2 rounded-lg bg-black px-5 py-3 text-white"
            >
              Save Student
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">
            Student List
          </h2>

          {students.length === 0 ? (
            <p className="mt-4 text-gray-600">No students added yet.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-3">Name</th>
                    <th className="py-3">Phone</th>
                    <th className="py-3">Course / Batch</th>
                    <th className="py-3">Monthly Fee</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b text-gray-900">
                      <td className="py-3">{student.name}</td>
                      <td className="py-3">{student.phone}</td>
                      <td className="py-3">{student.course}</td>
                      <td className="py-3">₹{student.monthlyFee}</td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => deleteStudent(student.id)}
                          className="rounded-lg border border-red-300 px-3 py-2 text-red-600 hover:bg-red-50"
                        >
                          Delete
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