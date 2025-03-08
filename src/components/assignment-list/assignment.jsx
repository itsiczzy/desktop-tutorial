import React, { useState, useEffect } from 'react';
import './AssignmentList.css';

function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const response = await fetch('/api/assignments');
        if (response.ok) {
          const data = await response.json();
          setAssignments(data);
        } else {
          throw new Error('Failed to fetch');
        }
      } catch (error) {
        console.warn('Using mock assignments due to error:', error);
        const savedAssignments = JSON.parse(localStorage.getItem('mockAssignments')) || [
          { id: 1, title: 'Math Homework', description: 'Complete chapter 5 exercises', dueDate: '2024-03-15' },
          { id: 2, title: 'Science Project', description: 'Create a solar system model', dueDate: '2024-03-22' },
          { id: 3, title: 'English Essay', description: 'Write a 5-page research paper', dueDate: '2024-03-20' }
        ];
        localStorage.setItem('mockAssignments', JSON.stringify(savedAssignments));
        setAssignments(savedAssignments);
      }
    };

    loadAssignments();
  }, []);

  const handleAddNewAssignment = async () => {
    if (isAddingNew) {
      const newId = assignments.length > 0 ? Math.max(...assignments.map(a => a.id)) + 1 : 1;
      const assignmentToAdd = { id: newId, ...newAssignment };

      try {
        const response = await fetch('/api/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignmentToAdd)
        });

        if (response.ok) {
          const data = await response.json();
          setAssignments([...assignments, data]);
        } else {
          throw new Error('Failed to save');
        }
      } catch (error) {
        console.warn('Saving to mockAssignments:', error);
        const updatedAssignments = [...assignments, assignmentToAdd];
        localStorage.setItem('mockAssignments', JSON.stringify(updatedAssignments));
        setAssignments(updatedAssignments);
      }

      setNewAssignment({ title: '', description: '', dueDate: '' });
      setIsAddingNew(false);
    } else {
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
            <th>No.</th>
            <th>Title</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment, index) => (
            <tr key={assignment.id}>
              <td>{index + 1}</td>
              <td>{assignment.title}</td>
              <td className="assignment-description">
                {assignment.description.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </td>
              <td>{assignment.dueDate}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
          
          {isAddingNew && (
            <tr>
              <td>{assignments.length + 1}</td>
              <td>
                <input
                  type="text"
                  name="title"
                  value={newAssignment.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                />
              </td>
              <td>
                <textarea
                  name="description"
                  value={newAssignment.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                />
              </td>
              <td>
                <input
                  type="date"
                  name="dueDate"
                  value={newAssignment.dueDate}
                  onChange={handleInputChange}
                />
              </td>
              <td>
                <button onClick={handleAddNewAssignment}>Save</button>
                <button onClick={() => setIsAddingNew(false)}>Cancel</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button onClick={handleAddNewAssignment}>+ Add New Assignment</button>
      </div>
    </div>
  );
}

export default AssignmentList;
