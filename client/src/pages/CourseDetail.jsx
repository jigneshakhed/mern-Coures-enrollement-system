import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CourseDetail({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [enrolled, setEnrolled] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
                setCourse({ error: true });
                return;
            }
            try {
                const res = await axios.get(`http://localhost:5000/api/courses/${id}`);
                setCourse(res.data);
            } catch (err) {
                console.error(err);
                setCourse({ error: true });
            }
        };
        fetchCourse();

        // Always check enrollment status if user is present, because the user object from local storage does not contain enrolledCourses
        if (user || localStorage.getItem('token')) {
            checkEnrollment();
        }
    }, [id, user]);

    const checkEnrollment = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get('http://localhost:5000/api/enrollments/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const isEnrolled = res.data.some(e => e.course && e.course._id === id);
            setEnrolled(isEnrolled);
        } catch (err) {
            console.error('Check enrollment error:', err);
            if (err.response?.status === 401 || err.response?.status === 400) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    };

    const handleEnroll = async () => {
        const token = localStorage.getItem('token');

        if (!user || !token) {
            navigate('/login');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/enrollments', { courseId: id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnrolled(true);
            alert('Enrolled successfully!');
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 400) {
                if (err.response?.data?.message === 'Invalid Token') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }
            }
            alert(err.response?.data?.message || 'Enrollment failed');
        }
    };

    const handleUnenroll = async () => {
        const token = localStorage.getItem('token');
        if (!user || !token) {
            navigate('/login');
            return;
        }
        if (!window.confirm("Are you sure you want to unenroll from this course?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/enrollments/course/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnrolled(false);
            alert('Unenrolled successfully!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Unenrollment failed');
        }
    };

    if (course && course.error) return <div className="text-center mt-10 p-10 text-xl font-bold text-red-600 bg-red-50 rounded-lg shadow-sm border border-red-100 max-w-2xl mx-auto">Course not found or invalid course ID.</div>;
    if (!course) return <div className="text-center mt-10 text-lg text-gray-600">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white p-0 rounded-lg shadow-lg overflow-hidden border border-gray-100 mb-12">
            {/* Course Banner */}
            <div className="w-full h-64 bg-green-900 relative">
                <img
                    src={course.imageUrl || "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=1200"}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-8 w-full">
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-wide drop-shadow-md">{course.title}</h1>
                        <span className="inline-block px-3 py-1 bg-green-700/80 text-green-50 text-xs font-bold uppercase tracking-widest rounded border border-green-500/30">
                            Premium Course
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">{course.description}</p>

                <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-200">
                    <span className="text-3xl font-bold text-green-800 tracking-wider">
                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                    </span>
                    {enrolled ? (
                        <button onClick={handleUnenroll} className="bg-red-50 text-red-600 px-8 py-3 rounded font-semibold tracking-wide hover:bg-red-100 border border-red-200 transition-colors">
                            Unenroll
                        </button>
                    ) : (
                        <button onClick={handleEnroll} className="bg-green-700 text-white px-8 py-3 rounded hover:bg-green-800 text-lg font-bold tracking-wide transition-colors shadow-md border border-green-800">
                            Enroll Now
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Course Content</h2>
                    {enrolled ? (
                        <div className="space-y-4">
                            {course.content && course.content.map((section, index) => (
                                <div key={index} className="border p-4 rounded bg-gray-50">
                                    <h3 className="font-bold text-lg mb-2">{section.title}</h3>
                                    <p className="mb-2">{section.text}</p>

                                    {section.type === 'pdf' ? (
                                        <div className="mt-4">
                                            <a href={section.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold border border-red-200 bg-red-50 p-3 rounded w-fit">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                View/Download PDF Material
                                            </a>
                                        </div>
                                    ) : (
                                        section.videoUrl && section.videoUrl.trim() !== '' && section.videoUrl !== 'http://localhost:5000/uploads/undefined' && (
                                            <div className="aspect-w-16 aspect-h-9 mt-4">
                                                {/* Responsive iframe wrapper */}
                                                <div className="relative pb-[56.25%] h-0">
                                                    <iframe
                                                        src={section.videoUrl.replace('watch?v=', 'embed/')}
                                                        className="absolute top-0 left-0 w-full h-full rounded shadow"
                                                        frameBorder="0"
                                                        allowFullScreen
                                                        title="Course Video"
                                                    ></iframe>
                                                </div>
                                                <p className="mt-2 text-sm text-gray-500">
                                                    Note: If video doesn't play, <a href={section.videoUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">click here to watch on source</a>.
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            ))}
                            {(!course.content || course.content.length === 0) && <p>No content uploaded yet.</p>}
                        </div>
                    ) : (
                        <div className="bg-yellow-50 p-4 border border-yellow-200 rounded text-yellow-800">
                            Enroll to view course content.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
