"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, Layers3, Plus, Trash2 } from "lucide-react";
import PremiumShell from "../components/PremiumShell";

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

const API_URL = "http://192.168.1.18:30081";

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
    <PremiumShell>
      <main className="module-page">
        <section className="module-hero">
          <div>
            <div className="module-badge">
              <CalendarDays size={16} /> Batch Operations
            </div>
            <h1>Batches</h1>
            <p>Create polished schedules and manage course batches.</p>
          </div>

          <div className="module-badge">
            {batches.length} Active Batches
          </div>
        </section>

        <section className="module-grid">
          <div className="module-panel">
            <h2>
              <Plus size={20} /> Add New Batch
            </h2>

            {courses.length === 0 && !isLoading ? (
              <div className="empty-state">
                <p>No courses found. Create a course before creating a batch.</p>
                <Link href="/courses" className="panel-link">
                  Add Course First
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="module-form">
                <div className="form-row">
                  <label>Batch Name</label>
                  <input
                    type="text"
                    placeholder="Example: Morning Batch"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>

                <div className="form-row">
                  <label>Course</label>
                  <select
                    value={courseId}
                    onChange={(event) => setCourseId(event.target.value)}
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label>Start Time</label>
                  <input
                    type="text"
                    placeholder="Example: 10:00 AM"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  />
                </div>

                <div className="form-row">
                  <label>End Time</label>
                  <input
                    type="text"
                    placeholder="Example: 11:30 AM"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                  />
                </div>

                <div className="form-row">
                  <label>Days</label>
                  <input
                    type="text"
                    placeholder="Example: Mon, Wed, Fri"
                    value={days}
                    onChange={(event) => setDays(event.target.value)}
                  />
                </div>

                <button type="submit" className="primary-action">
                  Save Batch
                </button>
              </form>
            )}
          </div>

          <div className="module-panel">
            <h2>
              <Layers3 size={20} /> Batch List
            </h2>

            {isLoading ? (
              <div className="empty-state">Loading batches...</div>
            ) : batches.length === 0 ? (
              <div className="empty-state">No batches found in database.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Batch</th>
                      <th>Course</th>
                      <th>Time</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {batches.map((batch) => (
                      <tr key={batch.id}>
                        <td>{batch.name}</td>
                        <td>{getCourseName(batch.course_id)}</td>
                        <td>
                          {batch.start_time || "-"} to {batch.end_time || "-"}
                        </td>
                        <td>{batch.days || "-"}</td>
                        <td>
                          <span className="status-pill">{batch.status}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="danger-action"
                            onClick={() => deleteBatch(batch.id)}
                          >
                            <Trash2 size={15} /> Delete
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
    </PremiumShell>
  );
}
