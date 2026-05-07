"use client";

import PremiumShell from "../components/PremiumShell";
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

const API_URL = "http://192.168.1.18:30081";

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
    <PremiumShell>
      <main className="module-page">
      <section className="module-page">
<div className="module-hero">
          <h1 >Courses</h1>
          <p >
            Add and manage institute courses using FastAPI and PostgreSQL.
          </p>
        </div>

        <div className="module-panel">
          <h2 >
            Add New Course
          </h2>

          <form onSubmit={handleSubmit} className="module-form">
            <input
              type="text"
              placeholder="Course name, example: Class 10 Maths"
              value={name}
              onChange={(event) => setName(event.target.value)}
              
            />

            <textarea
              placeholder="Course description optional"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              
            />

            <input
              type="number"
              placeholder="Monthly fee"
              value={monthlyFee}
              onChange={(event) => setMonthlyFee(event.target.value)}
              
            />

            <input
              type="number"
              placeholder="Duration in months optional"
              value={durationMonths}
              onChange={(event) => setDurationMonths(event.target.value)}
              
            />

            <button
              type="submit"
              className="primary-action"
            >
              Save Course to Database
            </button>
          </form>
        </div>

        <div className="module-panel">
          <h2 >Course List</h2>

          {isLoading ? (
            <p className="empty-state">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="empty-state">No courses found in database.</p>
          ) : (
            <div className="table-wrap">
              <table >
                <thead>
                  <tr >
                    <th >Name</th>
                    <th >Monthly Fee</th>
                    <th >Duration</th>
                    <th >Status</th>
                    <th >Action</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} >
                      <td >{course.name}</td>
                      <td >₹{Number(course.monthly_fee)}</td>
                      <td >
                        {course.duration_months
                          ? `${course.duration_months} months`
                          : "-"}
                      </td>
                      <td >{course.status}</td>
                      <td >
                        <button
                          type="button"
                          onClick={() => deleteCourse(course.id)}
                          className="danger-action"
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
    </PremiumShell>
  );
}
