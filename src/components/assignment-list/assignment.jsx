import React, { useState } from 'react';
import './AssignmentList.css';

function AssignmentList() {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Math Homework',
      description: 'Complete chapter 5 exercises',
      dueDate: '2024-03-15'
    },
    {
      id: 2,
      title: 'Science Project',
      description: 'Create a solar system model',
      dueDate: '2024-03-22'
    },
    {
      id: 3,
      title: 'English Essay',
      description: 'Write a 5-page research paper',
      dueDate: '2024-03-20'
    }
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  const handleAddNewAssignment = () => {
    if (isAddingNew) {
      // Save the new assignment
      const newId = assignments.length > 0 
        ? Math.max(...assignments.map(a => a.id)) + 1 
        : 1;
      
      const assignmentToAdd = {
        id: newId,
        ...newAssignment
      };

      setAssignments([...assignments, assignmentToAdd]);
      
      // Reset the new assignment state
      setNewAssignment({
        title: '',
        description: '',
        dueDate: ''
      });
      setIsAddingNew(false);
    } else {
      // Show the input row
      setIsAddingNew(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="assignment-list-container">
      <h2>Assignment List</h2>
      <table className="assignment-table">
        <thead>
          <tr>
            <th className="assignment-table-header">No.</th>
            <th className="assignment-table-header">Title</th>
            <th className="assignment-table-header">Description</th>
            <th className="assignment-table-header">Due Date</th>
            <th className="assignment-table-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment, index) => (
            <tr key={assignment.id} className="assignment-table-row">
              <td className="assignment-table-cell">{index + 1}</td>
              <td className="assignment-table-cell">{assignment.title}</td>
              <td className="assignment-table-cell">{assignment.description}</td>
              <td className="assignment-table-cell">{assignment.dueDate}</td>
              <td className="assignment-table-cell">
                <div className="action-buttons">
                  <button className="action-button">Edit</button>
                  <button className="action-button">Delete</button>
                </div>
              </td>
            </tr>
          ))}
          
          {isAddingNew && (
            <tr className="assignment-table-row">
              <td className="assignment-table-cell">{assignments.length + 1}</td>
              <td className="assignment-table-cell">
                <input
                  type="text"
                  name="title"
                  value={newAssignment.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                />
              </td>
              <td className="assignment-table-cell">
                <input
                  type="text"
                  name="description"
                  value={newAssignment.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                />
              </td>
              <td className="assignment-table-cell">
                <input
                  type="date"
                  name="dueDate"
                  value={newAssignment.dueDate}
                  onChange={handleInputChange}
                />
              </td>
              <td className="assignment-table-cell">
                <div className="action-buttons">
                  <button 
                    className="action-button"
                    onClick={handleAddNewAssignment}
                  >
                    Save
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => setIsAddingNew(false)}
                  >
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button 
          className="add-button"
          onClick={handleAddNewAssignment}
        >
          + Add New Assignment
        </button>
      </div>
    </div>
  );
}

export default AssignmentList;