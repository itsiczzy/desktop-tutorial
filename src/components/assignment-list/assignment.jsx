import React, { useState, useEffect } from 'react';
import AssignmentDetail from './AssignmentDetail';
import './AssignmentList.css';

function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/assignments');
        if (!response.ok) throw new Error('Failed to fetch assignments');
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadAssignments();
  }, []);

  if (loading) return <p>Loading assignments...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="assignment-list-container">
      <h2>Assignment List</h2>
      {selectedAssignment ? (
        <AssignmentDetail assignment={selectedAssignment} onClose={() => setSelectedAssignment(null)} />
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
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, index) => (
                  <tr key={assignment.id} onClick={() => setSelectedAssignment(assignment)}>
                    <td>{index + 1}</td>
                    <td>{assignment.title}</td>
                    <td>{assignment.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default AssignmentList;
