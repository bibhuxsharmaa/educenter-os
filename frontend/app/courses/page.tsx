"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Course = {
  id: number;
  name: string;
  description: string | null;
  monthly_fee: string | number;
  duration_months: number | null;
  status: string;
  created_at: string;
};

const API_URL = "http://localhost:8000";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [durationMonths, setDurationMonths] = useState("");

  async function fetchCourses() {
    try {
      const response = await fetch(`${API_URL}/courses/`);

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error(error);
      alert("Could not load courses from backend");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name || !monthlyFee) {
      alert("Please enter course name and monthly fee");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/courses/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || null,
          monthly_fee: Number(monthlyFee),
          duration_months: durationMonths ? Number(durationMonths) : null,
          status: "active",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      setName("");
      setDescription("");
      setMonthlyFee("");
      setDurationMonths("");

      await fetchCourses();
    } catch (error) {
      console.error(error);
      alert("Could not save course to backend");
    }
  }

  async function deleteCourse(id: number) {
    const confirmDelete = confirm("Are you sure you want to delete this course?");

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      await fetchCourses();
    } catch (error) {
      console.error(error);
      alert("Could not delete course from backend");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black">
          ← Back to Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-bold text-gray-900">Courses</h1>
          <p className="mt-2 text-gray-600">
            Add and manage institute courses using FastAPI and PostgreSQL.
          </p>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">
            Add New Course
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <input
              type="text"
              placeholder="Course name, example: Class 10 Maths"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <textarea
              placeholder="Course description optional"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24 rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <input
              type="number"
              placeholder="Monthly fee"
              value={monthlyFee}
              onChange={(event) => setMonthlyFee(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <input
              type="number"
              placeholder="Duration in months optional"
              value={durationMonths}
              onChange={(event) => setDurationMonths(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
            />

            <button
              type="submit"
              className="mt-2 rounded-lg bg-black px-5 py-3 text-white"
            >
              Save Course to Database
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">Course List</h2>

          {isLoading ? (
            <p className="mt-4 text-gray-600">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="mt-4 text-gray-600">No courses found in database.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-3">Name</th>
                    <th className="py-3">Monthly Fee</th>
                    <th className="py-3">Duration</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b text-gray-900">
                      <td className="py-3">{course.name}</td>
                      <td className="py-3">₹{Number(course.monthly_fee)}</td>
                      <td className="py-3">
                        {course.duration_months
                          ? `${course.duration_months} months`
                          : "-"}
                      </td>
                      <td className="py-3 capitalize">{course.status}</td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => deleteCourse(course.id)}
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