import React, { useState } from "react";

function AssignmentDetail({ assignment, onClose, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAssignment, setEditedAssignment] = useState({ ...assignment });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onSave(editedAssignment); // ส่งข้อมูลที่แก้ไขไปให้ parent
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditedAssignment({ ...editedAssignment, [e.target.name]: e.target.value });
  };

  return (
    <div className="assignment-detail-container">
      {isEditing ? (
        <>
          <input
            type="text"
            name="title"
            value={editedAssignment.title}
            onChange={handleChange}
          />
          <textarea
            name="description"
            value={editedAssignment.description}
            onChange={handleChange}
          />
          <input
            type="date"
            name="dueDate"
            value={editedAssignment.duedate}
            onChange={handleChange}
          />
          <button onClick={handleSaveClick}>Save</button>
        </>
      ) : (
        <>
          <p><strong>Title:</strong></p>
          <p>{assignment.title}</p>
          <p><strong>Description:</strong></p>
          <p>{assignment.description}</p>
          <p><strong>Reminder</strong> {assignment.reminder_date}</p>
          <p><strong>Due Date:</strong> {assignment.duedate}</p>
          <p><strong>Status:</strong></p>
          <p><strong>Reminder Status</strong> {assignment.stage}</p>
          <button onClick={handleEditClick}>Edit</button>
        </>
      )}
      
      <button onClick={() => onDelete(assignment.id)}>Delete</button>
      <button onClick={onClose}>Back to List</button>
    </div>
  );
}

export default AssignmentDetail;
