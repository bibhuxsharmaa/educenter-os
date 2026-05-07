"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Student = {
  id: number;
  full_name: string;
  phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  email: string | null;
  address: string | null;
  status: string;
  created_at: string;
};

const API_URL = "http://192.168.1.18:30081";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  async function fetchStudents() {
    try {
      const response = await fetch(`${API_URL}/students/`);

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
      alert("Could not load students from backend");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fullName) {
      alert("Please enter student name");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/students/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone || null,
          parent_name: parentName || null,
          parent_phone: parentPhone || null,
          email: email || null,
          address: address || null,
          status: "active",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create student");
      }

      setFullName("");
      setPhone("");
      setParentName("");
      setParentPhone("");
      setEmail("");
      setAddress("");

      await fetchStudents();
    } catch (error) {
      console.error(error);
      alert("Could not save student to backend");
    }
  }

  async function deleteStudent(id: number) {
    const confirmDelete = confirm("Are you sure you want to delete this student?");

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/students/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      await fetchStudents();
    } catch (error) {
      console.error(error);
      alert("Could not delete student from backend");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black">
          ← Back to Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-bold text-gray-900">Students</h1>
          <p className="mt-2 text-gray-600">
            Add and manage students using the FastAPI backend and PostgreSQL.
          </p>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">
            Add New Student
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <input
              type="text"
              placeholder="Student full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <input
              type="text"
              placeholder="Student phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <input
              type="text"
              placeholder="Parent name"
              value={parentName}
              onChange={(event) => setParentName(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <input
              type="text"
              placeholder="Parent phone"
              value={parentPhone}
              onChange={(event) => setParentPhone(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <input
              type="email"
              placeholder="Email optional"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <textarea
              placeholder="Address optional"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="min-h-24 rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <button
              type="submit"
              className="mt-2 rounded-lg bg-black px-5 py-3 text-white"
            >
              Save Student to Database
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">
            Student List
          </h2>

          {isLoading ? (
            <p className="mt-4 text-gray-600">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="mt-4 text-gray-600">No students found in database.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-3">Name</th>
                    <th className="py-3">Phone</th>
                    <th className="py-3">Parent</th>
                    <th className="py-3">Parent Phone</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b text-gray-900">
                      <td className="py-3">{student.full_name}</td>
                      <td className="py-3">{student.phone || "-"}</td>
                      <td className="py-3">{student.parent_name || "-"}</td>
                      <td className="py-3">{student.parent_phone || "-"}</td>
                      <td className="py-3 capitalize">{student.status}</td>
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