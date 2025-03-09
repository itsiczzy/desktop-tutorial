import React, { useState } from "react";


function AssignmentDetail({ assignment, onClose, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAssignment, setEditedAssignment] = useState({
    ...assignment,
    duedate: formatDate(assignment.duedate),
    reminder_date: formatDate(assignment.reminder_date),
  });

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // แปลงเป็น YYYY-MM-DD
  }

  const getReminderStatus = (stage) => {
    const stageNum = Number(stage);
    if (stageNum === 1) return { color: "white", text: "Normal" };
    if (stageNum === 2) return { color: "orange", text: "Warning" };
    if (stageNum === 3) return { color: "red", text: "Urgent" };
    return { color: "black", text: "" };
  };

  const { color, text } = getReminderStatus(assignment.stage);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
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

      const url = `http://localhost:8080/update_homework_detail?user_id=${user_id}&assign_id=${editedAssignment.assign_id}&subject_id=${editedAssignment.subject_id}&title=${encodeURIComponent(editedAssignment.title)}&description=${encodeURIComponent(editedAssignment.description)}&duedate=${editedAssignment.duedate}&reminder_date=${editedAssignment.reminder_date}`;

      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      if (data.message === "success") {
        onSave(editedAssignment);
        setIsEditing(false);
      } else {
        console.error("Failed to update assignment");
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
    }
  };

  const handleChange = (e) => {
    setEditedAssignment({ ...editedAssignment, [e.target.name]: e.target.value });
  };

  return (
    <div className="assignment-detail-container">
      <h2>Assignment Detail</h2>
      {isEditing ? (
        <form className="form-grid">
          <label>Title:</label>
          <input type="text" name="title" value={editedAssignment.title} onChange={handleChange} required />

          <label>Description:</label>
          <textarea name="description" value={editedAssignment.description} onChange={handleChange} required />

          <label>Due Date:</label>
          <input type="date" name="duedate" value={editedAssignment.duedate} onChange={handleChange} required />

          <label>Reminder Date:</label>
          <input type="date" name="reminder_date" value={editedAssignment.reminder_date} onChange={handleChange} required />

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
          <p><strong>Title:</strong> {assignment.title}</p>
          <p><strong>Description:</strong> {assignment.description}</p>
          <p>
            <strong>Reminder:</strong> 
            {assignment.reminder_date 
              ? new Date(assignment.reminder_date).toLocaleDateString("th-TH", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "-"}
          </p>
          <p>
            <strong>Due Date:</strong> 
            {new Date(assignment.duedate).toLocaleDateString("th-TH", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p>
            <strong>Reminder Status:</strong> 
            <span style={{ color }}>{text}</span>
          </p>
          <p><strong>Status:</strong> {assignment.status}</p>

          <div className="button-group">
            <button className="edit-btn" onClick={handleEditClick}>Edit</button>
            <button className="delete-btn" onClick={() => onDelete(assignment.assign_id)}>Delete</button>
            <button className="cancel-btn" onClick={onClose}>Back to List</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentDetail;
