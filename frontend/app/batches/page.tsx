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

const API_URL = "http://localhost:8000";

export default function BatchesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [days, setDays] = useState("");

  async function fetchCourses() {
    const response = await fetch(`${API_URL}/courses/`);

    if (!response.ok) {
      throw new Error("Failed to fetch courses");
    }

    const data = await response.json();
    setCourses(data);
  }

  async function fetchBatches() {
    const response = await fetch(`${API_URL}/batches/`);

    if (!response.ok) {
      throw new Error("Failed to fetch batches");
    }

    const data = await response.json();
    setBatches(data);
  }

  async function loadPageData() {
    try {
      await Promise.all([fetchCourses(), fetchBatches()]);
    } catch (error) {
      console.error(error);
      alert("Could not load batches data from backend");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name || !courseId) {
      alert("Please enter batch name and select a course");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/batches/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          course_id: Number(courseId),
          start_time: startTime || null,
          end_time: endTime || null,
          days: days || null,
          status: "active",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create batch");
      }

      setName("");
      setCourseId("");
      setStartTime("");
      setEndTime("");
      setDays("");

      await fetchBatches();
    } catch (error) {
      console.error(error);
      alert("Could not save batch to backend");
    }
  }

  async function deleteBatch(id: number) {
    const confirmDelete = confirm("Are you sure you want to delete this batch?");

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/batches/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete batch");
      }

      await fetchBatches();
    } catch (error) {
      console.error(error);
      alert("Could not delete batch from backend");
    }
  }

  function getCourseName(courseIdValue: number) {
    const course = courses.find((courseItem) => courseItem.id === courseIdValue);
    return course ? course.name : `Course ID: ${courseIdValue}`;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black">
          ← Back to Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-bold text-gray-900">Batches</h1>
          <p className="mt-2 text-gray-600">
            Create and manage batches for your courses.
          </p>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">
            Add New Batch
          </h2>

          {courses.length === 0 && !isLoading ? (
            <div className="mt-4">
              <p className="text-gray-600">
                No courses found. Please create a course before creating a batch.
              </p>

              <Link
                href="/courses"
                className="mt-4 inline-block rounded-lg bg-black px-5 py-3 text-white"
              >
                Add Course First
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <input
                type="text"
                placeholder="Batch name, example: Morning Batch"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
              />

              <select
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Start time, example: 10:00 AM"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
              />

              <input
                type="text"
                placeholder="End time, example: 11:30 AM"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
              />

              <input
                type="text"
                placeholder="Days, example: Mon, Wed, Fri"
                value={days}
                onChange={(event) => setDays(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400"
              />

              <button
                type="submit"
                className="mt-2 rounded-lg bg-black px-5 py-3 text-white"
              >
                Save Batch to Database
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">Batch List</h2>

          {isLoading ? (
            <p className="mt-4 text-gray-600">Loading batches...</p>
          ) : batches.length === 0 ? (
            <p className="mt-4 text-gray-600">No batches found in database.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-3">Batch Name</th>
                    <th className="py-3">Course</th>
                    <th className="py-3">Time</th>
                    <th className="py-3">Days</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch.id} className="border-b text-gray-900">
                      <td className="py-3">{batch.name}</td>
                      <td className="py-3">{getCourseName(batch.course_id)}</td>
                      <td className="py-3">
                        {batch.start_time || "-"}{" "}
                        {batch.end_time ? `to ${batch.end_time}` : ""}
                      </td>
                      <td className="py-3">{batch.days || "-"}</td>
                      <td className="py-3 capitalize">{batch.status}</td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => deleteBatch(batch.id)}
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