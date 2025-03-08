import React, { useState, useEffect } from 'react';
import AssignmentDetail from './AssignmentDetail';
import './AssignmentList.css';

function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    const { result } = JSON.parse(userData); // ดึงข้อมูล result จาก userData
    const user_id = result?.id; // ดึง id จาก result

    if (!user_id) {
      setError('User ID not found');
      setLoading(false);
      return;
    }

    const loadAssignments = async () => {
      try {
        const response = await fetch(`http://localhost:8080/homework_list?user_id=${encodeURIComponent(user_id)}`);
        if (!response.ok) throw new Error('Failed to fetch assignments');
        const data = await response.json();
        setAssignments(data.result);  // สมมติว่า data.result เก็บรายการการบ้าน
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadAssignments();
  }, []);  // ใช้ [] ทำให้ useEffect รันแค่ครั้งเดียวเมื่อ component ถูก mount

  const getReminderStatus = (reminderDate) => {
    const currentDate = new Date();
    const reminder = new Date(reminderDate);
    const diffTime = reminder - currentDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // คำนวณจำนวนวัน

    if (diffDays >= 3) {
      return { color: 'orange', text: 'เร่งด่วน' };
    } else if (diffDays === 1) {
      return { color: 'red', text: 'ทันที' };
    } else if (diffDays <= 0) {
      return { color: 'red', text: 'เลยกำหนด' };
    } else {
      return { color: 'black', text: '' }; // กรณีที่ reminderDate ยังห่างจากวันนี้มากกว่า 3 วัน
    }
  };

  if (loading) return <p>Loading assignments...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="assignment-list-container">
      <div className="header">
        <h2>Assignment List</h2>
      </div>

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
                  <th>Description</th>
                  <th>Due Date</th>
                  <th>Reminder</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, index) => {
                  const { color, text } = getReminderStatus(assignment.reminder_date);
                  return (
                    <tr key={assignment.id} onClick={() => setSelectedAssignment(assignment)}>
                      <td>{index + 1}</td>
                      <td>{assignment.title}</td>
                      <td>{assignment.description}</td>
                      <td>{new Date(assignment.duedate).toLocaleDateString()}</td>
                      <td style={{ color: color }}>
                        {text && <span>{text}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default AssignmentList;
