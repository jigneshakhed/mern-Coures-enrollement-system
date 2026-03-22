import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
    const [courses, setCourses] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/courses');
                setCourses(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCourses();

        const fetchEnrollments = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await axios.get('http://localhost:5000/api/enrollments/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const ids = new Set(res.data.map(e => e.course?._id).filter(Boolean));
                setEnrolledCourseIds(ids);
            } catch (err) {
                console.error('Failed to fetch enrollments for home page:', err);
            }
        };
        fetchEnrollments();
    }, []);

    const handleEnroll = async (courseId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/enrollments', { courseId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnrolledCourseIds(prev => new Set([...prev, courseId]));
            alert('Enrolled successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Enrollment failed');
        }
    };

    const handleUnenroll = async (courseId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        if (!window.confirm("Are you sure you want to unenroll from this course?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/enrollments/course/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnrolledCourseIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(courseId);
                return newSet;
            });
            alert('Unenrolled successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Unenrollment failed');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Hero Section */}
            <div className="relative bg-green-900 text-white overflow-hidden mb-12">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=2000"
                        alt="Luxury Timepiece Collection"
                        className="w-full h-full object-cover opacity-30"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl uppercase tracking-widest text-emerald-50">
                        Master The Craft
                    </h1>
                    <p className="mt-6 max-w-lg mx-auto text-xl text-green-100 sm:max-w-3xl font-light">
                        Discover our exclusive collection of luxury courses and elevate your expertise.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 text-center text-green-900 uppercase tracking-widest">Available Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <div key={course._id} className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
                            {/* Course Image */}
                            <div className="aspect-w-16 aspect-h-9 w-full bg-gray-200 overflow-hidden relative shrink-0">
                                <img
                                    src={course.imageUrl || "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=800"}
                                    alt={course.title}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {course.price === 0 && (
                                    <div className="absolute top-4 right-4 bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        Free Entry
                                    </div>
                                )}
                            </div>

                            <div className="p-6 pb-4 flex flex-col justify-between h-full bg-white">
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-green-900 line-clamp-1">{course.title}</h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm h-10">{course.description}</p>
                                </div>
                                <div className="border-t border-gray-100 pt-4 mt-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-extrabold text-green-800">
                                            {course.price === 0 ? 'Free' : `₹${course.price}`}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {enrolledCourseIds.has(course._id) ? (
                                            <button
                                                onClick={() => handleUnenroll(course._id)}
                                                className="w-full text-center bg-red-50 text-red-600 font-bold py-2.5 rounded border border-red-200 hover:bg-red-100 transition-colors uppercase text-xs tracking-wider"
                                            >
                                                Unenroll
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEnroll(course._id)}
                                                className="w-full text-center bg-green-700 text-white font-bold py-2.5 rounded hover:bg-green-800 transition-colors uppercase text-xs tracking-wider shadow-sm"
                                            >
                                                Enroll
                                            </button>
                                        )}
                                        <Link to={`/course/${course._id}`} className="w-full text-center bg-green-50 text-green-800 font-bold py-2.5 rounded border border-green-200 hover:bg-green-100 hover:text-green-900 transition-colors uppercase text-xs tracking-wider">
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {courses.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500 text-lg">No courses available at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
