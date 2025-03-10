import React, { useState, useEffect } from "react";

function AssignmentDetail({ assignment, onClose, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [editedAssignment, setEditedAssignment] = useState({
    ...assignment,
    duedate: formatDate(assignment.duedate),
    reminder_date: formatDate(assignment.reminder_date),
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    // เมื่อ assignment prop เปลี่ยน ให้รีเซ็ต editedAssignment และ errors
    setEditedAssignment({
      ...assignment,
      duedate: formatDate(assignment.duedate),
      reminder_date: formatDate(assignment.reminder_date),
    });
    setErrors({});
  }, [assignment]);

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  }

  const loadSubjects = async () => {
    try {
      const response = await fetch("http://localhost:8080/subject_list");
      const data = await response.json();
      if (data.message === "success") {
        setSubjects(data.result);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const loadUpdatedAssignment = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/homework_detail?assign_id=${assignment.assign_id}`
      );
      const data = await response.json();
      if (data.message === "success") {
        if (data.result && data.result.length > 0) {
          const updatedItem = data.result[0];
          setEditedAssignment({
            ...updatedItem,
            duedate: formatDate(updatedItem.duedate),
            reminder_date: formatDate(updatedItem.reminder_date),
          });
          onSave(updatedItem);
        }
      }
    } catch (error) {
      console.error("Error fetching updated assignment:", error);
    }
  };

  const getReminderStatus = (stage) => {
    const stageNum = Number(stage);
    if (stageNum === 1) return { color: "white", text: "Normal" };
    if (stageNum === 2) return { color: "orange", text: "Warning" };
    if (stageNum === 3) return { color: "red", text: "Urgent" };
    return { color: "black", text: "" };
  };

  const { color, text } = getReminderStatus(editedAssignment.stage);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  // ฟังก์ชันสำหรับเล่นเสียงเตือน (ต้องมีไฟล์ error.mp3 อยู่ใน public folder)
  const playErrorSound = () => {
    const audio = new Audio("/error.mp3");
    audio.play();
  };

  // Validate ฟิลด์ต่างๆ และส่งกลับ errors object
  const validateFields = () => {
    const newErrors = {};
    if (!editedAssignment.title.trim()) newErrors.title = "Title is required.";
    if (!editedAssignment.description.trim())
      newErrors.description = "Description is required.";
    if (!editedAssignment.subject_id)
      newErrors.subject_id = "Subject is required.";
    if (!editedAssignment.duedate)
      newErrors.duedate = "Due date is required.";
    if (!editedAssignment.reminder_date)
      newErrors.reminder_date = "Reminder date is required.";
    return newErrors;
  };

  const handleSaveClick = async () => {
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      playErrorSound(); // เล่นเสียงเตือนเมื่อมี error
      return;
    }
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        console.error("User not logged in");
        return;
      }
      const { result } = JSON.parse(userData);
      const user_id = result?.id;
      if (!user_id) {
        console.error("User ID not found");
        return;
      }
      const url = `http://localhost:8080/update_homework_detail?user_id=${user_id}&assign_id=${editedAssignment.assign_id}&subject_id=${editedAssignment.subject_id}&title=${encodeURIComponent(
        editedAssignment.title
      )}&description=${encodeURIComponent(
        editedAssignment.description
      )}&duedate=${editedAssignment.duedate}&reminder_date=${editedAssignment.reminder_date}`;
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      if (data.message === "success") {
        await loadUpdatedAssignment(); // โหลดข้อมูลใหม่หลังจากอัปเดตสำเร็จ
        setIsEditing(false);
        setErrors({});
      } else {
        console.error("Failed to update assignment");
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
    }
  };

  const handleChange = (e) => {
    setEditedAssignment({ ...editedAssignment, [e.target.name]: e.target.value });
    // Clear error for the field when user starts typing
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // ฟังก์ชันสำหรับลบการบ้าน
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this assignment?"
    );
    if (!confirmDelete) return;

    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        console.error("User not logged in");
        return;
      }
      const { result } = JSON.parse(userData);
      const user_id = result?.id;
      if (!user_id) {
        console.error("User ID not found");
        return;
      }
      const url = `http://localhost:8080/delete_homework?user_id=${user_id}&assign_id=${editedAssignment.assign_id}`;
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      if (data.message === "success") {
        // หลังลบสำเร็จ ให้เรียก onDelete callback และปิดหน้ารายละเอียด
        onDelete(editedAssignment.assign_id);
        onClose();
      } else {
        console.error("Failed to delete assignment");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  return (
    <div className="assignment-detail-container">
      <h2>Assignment Detail</h2>
      {isEditing ? (
        <form className="form-grid">
          <label>Title:</label>
          <input
            type="text"
            name="title"
            required
            value={editedAssignment.title}
            onChange={handleChange}
          />
          {errors.title && <span className="error">{errors.title}</span>}

          <label>Description:</label>
          <textarea
            name="description"
            required
            value={editedAssignment.description}
            onChange={handleChange}
          />
          {errors.description && (
            <span className="error">{errors.description}</span>
          )}

          <label>Subject:</label>
          <select
            name="subject_id"
            required
            value={editedAssignment.subject_id}
            onChange={handleChange}
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subject_id && (
            <span className="error">{errors.subject_id}</span>
          )}

          <label>Due Date:</label>
          <input
            type="date"
            name="duedate"
            required
            value={editedAssignment.duedate}
            onChange={handleChange}
          />
          {errors.duedate && <span className="error">{errors.duedate}</span>}

          <label>Reminder Date:</label>
          <input
            type="date"
            name="reminder_date"
            required
            value={editedAssignment.reminder_date}
            onChange={handleChange}
          />
          {errors.reminder_date && (
            <span className="error">{errors.reminder_date}</span>
          )}

          <div className="button-group">
            <button type="button" className="submit-btn" onClick={handleSaveClick}>
              Save
            </button>
            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="detail-view">
          <p>
            <strong>Title:</strong> {editedAssignment.title}
          </p>
          <p>
            <strong>Description:</strong> {editedAssignment.description}
          </p>
          <p>
            <strong>Subject:</strong> {editedAssignment.subject || "-"}
          </p>
          <p>
            <strong>Reminder:</strong>{" "}
            {editedAssignment.reminder_date
              ? new Date(editedAssignment.reminder_date).toLocaleDateString("th-TH", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "-"}
          </p>
          <p>
            <strong>Due Date:</strong>{" "}
            {new Date(editedAssignment.duedate).toLocaleDateString("th-TH", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p>
            <strong>Reminder Status:</strong>{" "}
            <span style={{ color }}>{text}</span>
          </p>
          <p>
            <strong>Status:</strong> {editedAssignment.status}
          </p>
          <div className="button-group">
            <button className="edit-btn" onClick={handleEditClick}>
              Edit
            </button>
            <button className="delete-btn" onClick={handleDelete}>
              Delete
            </button>
            <button className="cancel-btn" onClick={onClose}>
              Back to List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentDetail;
