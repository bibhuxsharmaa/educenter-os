"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardStats = {
  total_students: number;
  total_courses: number;
  total_batches: number;
};

const API_URL = "http://localhost:8000";

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    total_students: 0,
    total_courses: 0,
    total_batches: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState("Checking...");

  async function fetchDashboardStats() {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`);

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const data = await response.json();

      setStats(data);
      setApiStatus("Connected");
    } catch (error) {
      console.error(error);
      setApiStatus("Backend not connected");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">EduCenter OS</h1>
          <p className="mt-2 text-gray-600">
            Manage students, courses, batches, enrollments, attendance, fees,
            and communication from one place.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Total Students
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {isLoading ? "..." : stats.total_students}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Total Courses
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {isLoading ? "..." : stats.total_courses}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Total Batches
            </h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {isLoading ? "..." : stats.total_batches}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Backend Status
            </h2>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {apiStatus}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome to your institute dashboard
          </h2>

          <p className="mt-2 text-gray-600">
            This dashboard is now connected to the FastAPI backend and
            PostgreSQL database. You can manage students, courses, batches, and
            enrollments from here.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/students"
              className="rounded-lg bg-black px-5 py-3 text-white"
            >
              Manage Students
            </Link>

            <Link
              href="/courses"
              className="rounded-lg border border-gray-300 px-5 py-3 text-gray-800"
            >
              Manage Courses
            </Link>

            <Link
              href="/batches"
              className="rounded-lg border border-gray-300 px-5 py-3 text-gray-800"
            >
              Manage Batches
            </Link>

            <Link
              href="/enrollments"
              className="rounded-lg border border-gray-300 px-5 py-3 text-gray-800"
            >
              Manage Enrollments
            </Link>

            <a
              href="http://localhost:8000/docs"
              target="_blank"
              className="rounded-lg border border-gray-300 px-5 py-3 text-gray-800"
            >
              Open Backend Docs
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}