"use client";

import PremiumShell from "../components/PremiumShell";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type MessageLog = {
  id: number;
  student_id: number | null;
  enrollment_id: number | null;
  student_name: string | null;
  course_name: string | null;
  batch_name: string | null;
  recipient_name: string | null;
  recipient_phone: string;
  message_type: string;
  message_text: string;
  status: string;
  provider: string | null;
  provider_response: string | null;
  sent_at: string | null;
  created_at: string;
};

const API_BASE_URL = "http://192.168.1.18:30081";

function createMessageTemplate(
  messageType: string,
  recipientName: string,
  courseName = "your course"
) {
  const name = recipientName || "Student";

  if (messageType === "fee_reminder") {
    return `Dear ${name}, your monthly fee payment is pending. Please pay your fee as soon as possible. Thank you.`;
  }

  if (messageType === "attendance_warning") {
    return `Dear ${name}, your attendance is low in ${courseName}. Please attend classes regularly to avoid academic issues.`;
  }

  if (messageType === "payment_reminder") {
    return `Dear ${name}, this is a payment reminder from EduCenter. Please clear your pending payment at the earliest.`;
  }

  return `Dear ${name}, this is a message from EduCenter.`;
}

function getWhatsAppPhoneNumber(phone: string) {
  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
    return cleanPhone;
  }

  if (cleanPhone.length === 10) {
    return `91${cleanPhone}`;
  }

  return cleanPhone;
}

function openWhatsApp(phone: string, message: string) {
  const whatsappPhone = getWhatsAppPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);

  window.open(
    `https://wa.me/${whatsappPhone}?text=${encodedMessage}`,
    "_blank"
  );
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageLog[]>([]);

  const [studentId, setStudentId] = useState("3");
  const [enrollmentId, setEnrollmentId] = useState("1");
  const [recipientName, setRecipientName] = useState("asa");
  const [recipientPhone, setRecipientPhone] = useState("9999999999");
  const [messageType, setMessageType] = useState("fee_reminder");
  const [courseName, setCourseName] = useState("Class 10 Mathematics");

  const [messageText, setMessageText] = useState(
    createMessageTemplate("fee_reminder", "asa", "Class 10 Mathematics")
  );

  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  function generateTemplate(type = messageType) {
    const template = createMessageTemplate(type, recipientName, courseName);
    setMessageText(template);
  }

  function handleMessageTypeChange(type: string) {
    setMessageType(type);
    setMessageText(createMessageTemplate(type, recipientName, courseName));
  }

  async function loadMessages() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/messages/details`);

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
      setError("Could not load messages. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function createMessage() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId ? Number(studentId) : null,
          enrollment_id: enrollmentId ? Number(enrollmentId) : null,
          recipient_name: recipientName || null,
          recipient_phone: recipientPhone,
          message_type: messageType,
          message_text: messageText,
          status: "draft",
          provider: "manual",
          provider_response: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create message");
      }

      await loadMessages();
    } catch (err) {
      console.error(err);
      setError("Could not create message.");
    } finally {
      setLoading(false);
    }
  }

  async function markAsSent(messageId: number) {
    try {
      setActionLoadingId(messageId);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/messages/${messageId}/mark-sent`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark message as sent");
      }

      await loadMessages();
    } catch (err) {
      console.error(err);
      setError("Could not mark message as sent.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function deleteMessage(messageId: number) {
    try {
      setActionLoadingId(messageId);
      setError("");

      const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      await loadMessages();
    } catch (err) {
      console.error(err);
      setError("Could not delete message.");
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "transparent",
    padding: "24px",
    color: "#f8fafc",
  };

  const containerStyle: CSSProperties = {
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const cardStyle: CSSProperties = {
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 14px 34px rgba(0,0,0,0.24)",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: "8px",
    fontSize: "16px",
    color: "#f8fafc",
    backgroundColor: "rgba(15, 23, 42, 0.72)",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#cbd5e1",
  };

  const thStyle: CSSProperties = {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: 700,
    color: "#cbd5e1",
    backgroundColor: "rgba(2, 6, 23, 0.45)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
  };

  const tdStyle: CSSProperties = {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#f8fafc",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
    verticalAlign: "top",
  };

  return (
    <PremiumShell>
      <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 900, margin: 0 }}>
            Messages
          </h1>
          <p style={{ marginTop: "6px", color: "#94a3b8", fontSize: "16px" }}>
            Select a message type and EduCenter will auto-create the template.
          </p>
        </div>

        <div style={{ ...cardStyle, marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 900, marginTop: 0 }}>
            Create Message Log
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label style={labelStyle}>Student ID</label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                style={inputStyle}
                placeholder="Example: 3"
              />
            </div>

            <div>
              <label style={labelStyle}>Enrollment ID</label>
              <input
                value={enrollmentId}
                onChange={(e) => setEnrollmentId(e.target.value)}
                style={inputStyle}
                placeholder="Example: 1"
              />
            </div>

            <div>
              <label style={labelStyle}>Recipient Name</label>
              <input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                style={inputStyle}
                placeholder="Student or parent name"
              />
            </div>

            <div>
              <label style={labelStyle}>Recipient Phone</label>
              <input
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                style={inputStyle}
                placeholder="Phone number"
              />
            </div>

            <div>
              <label style={labelStyle}>Course / Batch Name</label>
              <input
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                style={inputStyle}
                placeholder="Example: Class 10 Mathematics"
              />
            </div>

            <div>
              <label style={labelStyle}>Message Type</label>
              <select
                value={messageType}
                onChange={(e) => handleMessageTypeChange(e.target.value)}
                style={inputStyle}
              >
                <option value="general">General</option>
                <option value="fee_reminder">Fee Reminder</option>
                <option value="attendance_warning">Attendance Warning</option>
                <option value="payment_reminder">Payment Reminder</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Message Text</label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: "110px",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => generateTemplate()}
              style={{
                padding: "11px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(148, 163, 184, 0.22)",
                backgroundColor: "rgba(15, 23, 42, 0.72)",
                color: "#f8fafc",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Generate Template
            </button>

            <button
              type="button"
              onClick={createMessage}
              disabled={loading}
              style={{
                padding: "11px 16px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: loading ? "#93c5fd" : "#2563eb",
                color: "white",
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
              }}
            >
              {loading ? "Saving..." : "Create Draft Message"}
            </button>

            <button
              type="button"
              onClick={loadMessages}
              disabled={loading}
              style={{
                padding: "11px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(148, 163, 184, 0.22)",
                backgroundColor: "rgba(15, 23, 42, 0.72)",
                color: "#f8fafc",
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
              }}
            >
              Refresh
            </button>
          </div>

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid rgba(148, 163, 184, 0.18)" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 900, margin: 0 }}>
              Message Logs
            </h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: "1200px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Student</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Message</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Sent At</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {messages.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                        color: "#6b7280",
                        padding: "24px",
                      }}
                    >
                      No messages found.
                    </td>
                  </tr>
                )}

                {messages.map((message) => {
                  const isSent = message.status === "sent";
                  const isUpdating = actionLoadingId === message.id;

                  return (
                    <tr key={message.id}>
                      <td style={{ ...tdStyle, fontWeight: 800 }}>
                        #{message.id}
                      </td>

                      <td style={tdStyle}>
                        <div style={{ fontWeight: 800 }}>
                          {message.student_name || message.recipient_name || "-"}
                        </div>
                        <div style={{ color: "#6b7280", marginTop: "4px" }}>
                          {message.course_name || "-"}
                        </div>
                        <div style={{ color: "#6b7280", marginTop: "4px" }}>
                          {message.batch_name || "-"}
                        </div>
                      </td>

                      <td style={tdStyle}>{message.recipient_phone}</td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 10px",
                            borderRadius: "999px",
                            backgroundColor: "#dbeafe",
                            color: "#1d4ed8",
                            fontSize: "12px",
                            fontWeight: 800,
                            textTransform: "uppercase",
                          }}
                        >
                          {message.message_type}
                        </span>
                      </td>

                      <td style={{ ...tdStyle, maxWidth: "320px" }}>
                        {message.message_text}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 10px",
                            borderRadius: "999px",
                            backgroundColor: isSent ? "#dcfce7" : "#fef9c3",
                            color: isSent ? "#15803d" : "#854d0e",
                            fontSize: "12px",
                            fontWeight: 800,
                            textTransform: "uppercase",
                          }}
                        >
                          {message.status}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {message.sent_at
                          ? new Date(message.sent_at).toLocaleString()
                          : "-"}
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              openWhatsApp(
                                message.recipient_phone,
                                message.message_text
                              )
                            }
                            style={{
                              backgroundColor: "#22c55e",
                              color: "white",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              border: "none",
                              fontWeight: 800,
                              cursor: "pointer",
                              minWidth: "110px",
                            }}
                          >
                            WhatsApp
                          </button>

                          {!isSent && (
                            <button
                              type="button"
                              onClick={() => markAsSent(message.id)}
                              disabled={isUpdating}
                              style={{
                                backgroundColor: isUpdating
                                  ? "#86efac"
                                  : "#16a34a",
                                color: "white",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "none",
                                fontWeight: 800,
                                cursor: isUpdating ? "not-allowed" : "pointer",
                                minWidth: "90px",
                              }}
                            >
                              {isUpdating ? "..." : "Mark Sent"}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteMessage(message.id)}
                            disabled={isUpdating}
                            style={{
                              backgroundColor: isUpdating ? "#fca5a5" : "#dc2626",
                              color: "white",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              border: "none",
                              fontWeight: 800,
                              cursor: isUpdating ? "not-allowed" : "pointer",
                              minWidth: "80px",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </main>
    </PremiumShell>
  );
}
