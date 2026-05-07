"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Student = {
  id: number;
  full_name: string;
  phone: string | null;
  status: string;
};

type Course = {
  id: number;
  name: string;
  monthly_fee: string | number;
  status: string;
};

type Batch = {
  id: number;
  name: string;
  course_id: number;
  start_time: string | null;
  end_time: string | null;
  days: string | null;
  status: string;
};

type EnrollmentDetail = {
  id: number;
  student_id: number;
  student_name: string;
  course_id: number;
  course_name: string;
  batch_id: number;
  batch_name: string;
  monthly_fee: string | number;
  status: string;
  created_at: string;
};

const API_URL = "http://192.168.1.18:30081";

export default function EnrollmentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");

  async function fetchStudents() {
    const response = await fetch(`${API_URL}/students/`);

    if (!response.ok) {
      throw new Error("Failed to fetch students");
    }

    const data = await response.json();
    setStudents(data);
  }

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

  async function fetchEnrollments() {
    const response = await fetch(`${API_URL}/enrollments/details`);

    if (!response.ok) {
      throw new Error("Failed to fetch enrollments");
    }

    const data = await response.json();
    setEnrollments(data);
  }

  async function loadPageData() {
    try {
      await Promise.all([
        fetchStudents(),
        fetchCourses(),
        fetchBatches(),
        fetchEnrollments(),
      ]);
    } catch (error) {
      console.error(error);
      alert("Could not load enrollment data from backend");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  const filteredBatches = batches.filter(
    (batch) => batch.course_id === Number(courseId)
  );

  function handleCourseChange(selectedCourseId: string) {
    setCourseId(selectedCourseId);
    setBatchId("");

    const selectedCourse = courses.find(
      (course) => course.id === Number(selectedCourseId)
    );

    if (selectedCourse) {
      setMonthlyFee(String(Number(selectedCourse.monthly_fee)));
    } else {
      setMonthlyFee("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!studentId || !courseId || !batchId || !monthlyFee) {
      alert("Please select student, course, batch, and monthly fee");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/enrollments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: Number(studentId),
          course_id: Number(courseId),
          batch_id: Number(batchId),
          monthly_fee: Number(monthlyFee),
          status: "active",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create enrollment");
      }

      setStudentId("");
      setCourseId("");
      setBatchId("");
      setMonthlyFee("");

      await fetchEnrollments();
    } catch (error) {
      console.error(error);
      alert("Could not save enrollment to backend");
    }
  }

  async function deleteEnrollment(id: number) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this enrollment?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/enrollments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete enrollment");
      }

      await fetchEnrollments();
    } catch (error) {
      console.error(error);
      alert("Could not delete enrollment from backend");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black">
          ← Back to Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-bold text-gray-900">Enrollments</h1>
          <p className="mt-2 text-gray-600">
            Connect students with courses and batches.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Total Students
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {students.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Total Courses
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {courses.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Total Batches
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {batches.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Total Enrollments
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {enrollments.length}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">
            Add New Enrollment
          </h2>

          {students.length === 0 || courses.length === 0 || batches.length === 0 ? (
            <div className="mt-4">
              <p className="text-gray-600">
                You need at least one student, one course, and one batch before
                creating an enrollment.
              </p>

              <div className="mt-4 flex flex-wrap gap-4">
                <Link
                  href="/students"
                  className="rounded-lg bg-black px-5 py-3 text-white"
                >
                  Add Student
                </Link>

                <Link
                  href="/courses"
                  className="rounded-lg border border-gray-300 px-5 py-3 text-gray-800"
                >
                  Add Course
                </Link>

                <Link
                  href="/batches"
                  className="rounded-lg border border-gray-300 px-5 py-3 text-gray-800"
                >
                  Add Batch
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <select
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>

              <select
                value={courseId}
                onChange={(event) => handleCourseChange(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} - ₹{Number(course.monthly_fee)}
                  </option>
                ))}
              </select>

              <select
                value={batchId}
                onChange={(event) => setBatchId(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                disabled={!courseId}
              >
                <option value="">
                  {courseId ? "Select batch" : "Select course first"}
                </option>

                {filteredBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>

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
                Save Enrollment to Database
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">
            Enrollment List
          </h2>

          {isLoading ? (
            <p className="mt-4 text-gray-600">Loading enrollments...</p>
          ) : enrollments.length === 0 ? (
            <p className="mt-4 text-gray-600">
              No enrollments found in database.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-3">Student</th>
                    <th className="py-3">Course</th>
                    <th className="py-3">Batch</th>
                    <th className="py-3">Monthly Fee</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b text-gray-900">
                      <td className="py-3">{enrollment.student_name}</td>
                      <td className="py-3">{enrollment.course_name}</td>
                      <td className="py-3">{enrollment.batch_name}</td>
                      <td className="py-3">
                        ₹{Number(enrollment.monthly_fee)}
                      </td>
                      <td className="py-3 capitalize">{enrollment.status}</td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => deleteEnrollment(enrollment.id)}
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