"use client";

import { FormEvent, useEffect, useState } from "react";
import { Trash2, UserPlus, Users } from "lucide-react";
import PremiumShell from "../components/PremiumShell";

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
    <PremiumShell>
      <main className="module-page">
        <section className="module-hero">
          <div>
            <div className="module-badge">
              <Users size={16} /> Student Registry
            </div>
            <h1>Students</h1>
            <p>Add, manage, and track student profiles from one premium console.</p>
          </div>

          <div className="module-badge">{students.length} Students</div>
        </section>

        <section className="module-grid">
          <div className="module-panel">
            <h2>
              <UserPlus size={20} /> Add New Student
            </h2>

            <form onSubmit={handleSubmit} className="module-form">
              <div className="form-row">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Example: Demo Student"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>

              <div className="form-row">
                <label>Student Phone</label>
                <input
                  type="text"
                  placeholder="Example: 9999999999"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>

              <div className="form-row">
                <label>Parent Name</label>
                <input
                  type="text"
                  placeholder="Example: Demo Parent"
                  value={parentName}
                  onChange={(event) => setParentName(event.target.value)}
                />
              </div>

              <div className="form-row">
                <label>Parent Phone</label>
                <input
                  type="text"
                  placeholder="Example: 8888888888"
                  value={parentPhone}
                  onChange={(event) => setParentPhone(event.target.value)}
                />
              </div>

              <div className="form-row">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="form-row">
                <label>Address</label>
                <textarea
                  placeholder="Student address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "92px",
                    paddingTop: "12px",
                    resize: "vertical",
                  }}
                />
              </div>

              <button type="submit" className="primary-action">
                Save Student
              </button>
            </form>
          </div>

          <div className="module-panel">
            <h2>
              <Users size={20} /> Student List
            </h2>

            {isLoading ? (
              <div className="empty-state">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="empty-state">No students found in database.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Parent</th>
                      <th>Parent Phone</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>{student.full_name}</td>
                        <td>{student.phone || "-"}</td>
                        <td>{student.parent_name || "-"}</td>
                        <td>{student.parent_phone || "-"}</td>
                        <td>
                          <span className="status-pill">{student.status}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="danger-action"
                            onClick={() => deleteStudent(student.id)}
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
