import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Dashboard({ user }) {
    const [enrollments, setEnrollments] = useState([]);

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/enrollments/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEnrollments(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchEnrollments();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Welcome, {user.username}!</h2>
                <p className="text-gray-600">Email: {user.email}</p>
                <p className="text-gray-600">Role: {user.role}</p>
            </div>

            <h2 className="text-2xl font-bold mb-6">My Enrolled Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map(enrollment => (
                    <div key={enrollment._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Note: enrollment.course might be null if course was deleted, handle check */}
                        {enrollment.course ? (
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">{enrollment.course.title}</h3>
                                <p className="text-gray-500 text-sm mb-4">Enrolled on: {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                                <Link to={`/course/${enrollment.course._id}`} className="text-green-700 font-medium hover:text-green-900 transition">Continue Learning &rarr;</Link>
                            </div>
                        ) : (
                            <div className="p-6 text-red-500">Course was deleted.</div>
                        )}
                    </div>
                ))}
            </div>
            {enrollments.length === 0 && (
                <p className="text-gray-500">You have not enrolled in any courses yet.</p>
            )}
        </div>
    );
}
