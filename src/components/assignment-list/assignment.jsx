import React, { useState, useEffect } from "react";
import AssignmentDetail from "./AssignmentDetail";
import "./AssignmentList.css";

function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    subject_id: "",
    title: "",
    description: "",
    duedate: "",
    reminder_date: "",
  });

  useEffect(() => {
    loadAssignments();
    loadSubjects();
  }, []);

  const getReminderStatus = (stage) => {
    const stageNum = Number(stage);
    if (stageNum === 1) return { color: "white", text: "Normal" };
    if (stageNum === 2) return { color: "orange", text: "Warning" };
    if (stageNum === 3) return { color: "red", text: "Urgent" };
    return { color: "black", text: "" };
  };

  const updateAssignmentStatus = async (assign_id, newStatus) => {
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) return;

      const { result } = JSON.parse(userData);
      const user_id = result?.id;
      if (!user_id) return;

      if (newStatus === "complete") {
        const confirmComplete = window.confirm(
          "Are you sure you want to mark this assignment as complete? It will be removed from the table."
        );
        if (!confirmComplete) return;
      }

      const url = `http://localhost:8080/update_homework_status?user_id=${user_id}&assign_id=${assign_id}&status_assign=${newStatus}`;
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      if (data.message === "success") {
        loadAssignments();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const loadAssignments = async () => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      setError("User not logged in");
      setLoading(false);
      return;
    }
    const { result } = JSON.parse(userData);
    const user_id = result?.id;
    if (!user_id) {
      setError("User ID not found");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/homework_list?user_id=${encodeURIComponent(user_id)}`
      );
      const data = await response.json();
      if (
        data.message === "fail" &&
        data.result?.error_msg === "no user profile found."
      ) {
        setAssignments([]);
      } else {
        setAssignments(data.result);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddAssignmentChange = (e) => {
    setNewAssignment({ ...newAssignment, [e.target.name]: e.target.value });
  };

  const handleAddAssignmentSubmit = async (e) => {
    e.preventDefault();
    const userData = localStorage.getItem("userData");
    const { result } = JSON.parse(userData);
    const user_id = result?.id;
    if (!user_id) {
      setError("User ID not found");
      return;
    }
    const url = `http://localhost:8080/add_homework?user_id=${user_id}&subject_id=${newAssignment.subject_id}&title=${encodeURIComponent(newAssignment.title)}&description=${encodeURIComponent(newAssignment.description)}&duedate=${newAssignment.duedate}&reminder_date=${newAssignment.reminder_date}`;
    try {
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      if (data.message === "success") {
        setShowAddAssignment(false);
        setNewAssignment({
          subject_id: "",
          title: "",
          description: "",
          duedate: "",
          reminder_date: "",
        });
        loadAssignments();
      } else {
        setError("Failed to add assignment");
      }
    } catch (error) {
      setError(error.message);
    }
  };


  const handleSaveAssignment = (updatedAssignment) => {
    loadAssignments();
    setSelectedAssignment(updatedAssignment);
  };


  const handleDeleteAssignment = (assign_id) => {
    loadAssignments();
    setSelectedAssignment(null);
  };

  if (loading) return <p>Loading assignments...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="assignment-list-container">
      <div className="header">
        <h2>Assignment List</h2>
        <button
          className="add-btn"
          onClick={() => setShowAddAssignment(!showAddAssignment)}
        >
          {showAddAssignment ? "Close Form" : "Add Assignment"}
        </button>
      </div>
      {selectedAssignment ? (
        <AssignmentDetail
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onSave={handleSaveAssignment}
          onDelete={handleDeleteAssignment} 
        />
      ) : (
        <>
          {assignments.length === 0 ? (
            <p>No assignments found.</p>
          ) : (
            <table className="assignment-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Subject</th>
                  <th>Due Date</th>
                  <th>Reminder</th>
                  <th>Reminder Status</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, index) => {
                  const { color, text } = getReminderStatus(assignment.stage);
                  return (
                    <tr
                      key={assignment.assign_id}
                      onClick={() => setSelectedAssignment(assignment)}
                    >
                      <td>{index + 1}</td>
                      <td>{assignment.title}</td>
                      <td>{assignment.description}</td>
                      <td>{assignment.subject || "-"}</td>
                      <td>
                        {new Date(assignment.duedate).toLocaleDateString("th-TH", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        {assignment.reminder_date
                          ? new Date(assignment.reminder_date).toLocaleDateString("th-TH", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td style={{ color }}>{text}</td>
                      <td>
                        <select
                          value={assignment.status || "pending"}
                          onChange={(e) =>
                            updateAssignmentStatus(assignment.assign_id, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="complete">Complete</option>
                          <option value="inprogress">In Progress</option>
                          <option value="panding">Pending</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {showAddAssignment && (
            <div className="add-assignment-form">
              <h3>Add Assignment</h3>
              <form onSubmit={handleAddAssignmentSubmit} className="form-grid">
                <label>Title:</label>
                <input
                  type="text"
                  name="title"
                  value={newAssignment.title}
                  onChange={handleAddAssignmentChange}
                  required
                />
                <label>Description:</label>
                <textarea
                  name="description"
                  value={newAssignment.description}
                  onChange={handleAddAssignmentChange}
                  required
                />
                <label>Due Date:</label>
                <input
                  type="date"
                  name="duedate"
                  value={newAssignment.duedate}
                  onChange={handleAddAssignmentChange}
                  required
                />
                <label>Reminder Date:</label>
                <input
                  type="date"
                  name="reminder_date"
                  value={newAssignment.reminder_date}
                  onChange={handleAddAssignmentChange}
                  required
                />
                <label>Subject:</label>
                <select
                  name="subject_id"
                  value={newAssignment.subject_id}
                  onChange={handleAddAssignmentChange}
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <div className="button-group">
                  <button type="submit" className="submit-btn">
                    Add Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAssignment(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AssignmentList;
