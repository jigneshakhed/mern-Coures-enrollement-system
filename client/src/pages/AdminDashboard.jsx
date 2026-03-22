import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        title: '', description: '', price: 0, videoUrl: '', contentType: 'video', file: null, image: null
    });
    const [editingId, setEditingId] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [viewingEnrollmentsFor, setViewingEnrollmentsFor] = useState(null); // Course Title

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    // Note: For FormData, we let axios set the Content-Type automatically or set it explicitly
    const multipartConfig = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/courses');
            setCourses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEnrollments = async (courseId, courseTitle) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/enrollments/course/${courseId}`, config);
            setEnrollments(res.data);
            setViewingEnrollmentsFor(courseTitle);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch enrollments');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('contentType', formData.contentType);

            if (formData.file) {
                data.append('file', formData.file);
            } else if (formData.videoUrl) {
                data.append('videoUrl', formData.videoUrl);
            }

            if (formData.image) {
                data.append('image', formData.image);
            }

            if (editingId) {
                await axios.put(`http://localhost:5000/api/courses/${editingId}`, data, multipartConfig);
                setEditingId(null);
            } else {
                await axios.post('http://localhost:5000/api/courses', data, multipartConfig);
            }

            setFormData({ title: '', description: '', price: 0, videoUrl: '', contentType: 'video', file: null });
            fetchCourses();
        } catch (err) {
            console.error(err);
            alert('Failed to save course');
        }
    };

    const handleEdit = (course) => {
        setEditingId(course._id);
        const content = course.content[0] || {};
        setFormData({
            title: course.title,
            description: course.description,
            price: course.price,
            videoUrl: content.videoUrl || '',
            contentType: content.type || 'video',
            file: null,
            image: null
        });
        window.scrollTo(0, 0);
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/courses/${id}`, config);
            fetchCourses();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Course' : 'Create New Course'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Course Title"
                        className="border p-2 rounded"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        className="border p-2 rounded"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    <textarea
                        placeholder="Description"
                        className="border p-2 rounded md:col-span-2"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                    <div className="md:col-span-2 flex gap-4 items-center">
                        <select
                            className="border p-2 rounded"
                            value={formData.contentType}
                            onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                        >
                            <option value="video">Video URL</option>
                            <option value="pdf">PDF File/URL</option>
                        </select>

                        {formData.contentType === 'pdf' ? (
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="border p-2 rounded w-full"
                                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Or leave empty to keep existing/use URL below (if editing)</p>
                            </div>
                        ) : (
                            <input
                                type="text"
                                placeholder="Video URL (YouTube/Vimeo)"
                                className="border p-2 rounded flex-1"
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            />
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Thumbnail Image</label>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            className="border p-2 rounded w-full"
                            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional. Upload a high-quality image for the course listing.</p>
                    </div>

                    <div className="md:col-span-2 flex gap-2">
                        <button type="submit" className="bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800 transition-colors">
                            {editingId ? 'Update Course' : 'Create Course'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ title: '', description: '', price: 0, videoUrl: '', contentType: 'video', file: null, image: null });
                                }}
                                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {viewingEnrollmentsFor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Enrollments: {viewingEnrollmentsFor}</h3>
                            <button onClick={() => setViewingEnrollmentsFor(null)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                        </div>
                        {enrollments.length === 0 ? (
                            <p>No students enrolled yet.</p>
                        ) : (
                            <ul className="divide-y">
                                {enrollments.map(enrollment => (
                                    <li key={enrollment._id} className="py-2">
                                        <p className="font-semibold">{enrollment.user.username}</p>
                                        <p className="text-sm text-gray-500">{enrollment.user.email}</p>
                                        <p className="text-xs text-gray-400">Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-bold mb-4">Manage Courses</h2>
            <div className="bg-white shadow overflow-hidden rounded-md">
                <ul className="divide-y divide-gray-200">
                    {courses.map(course => (
                        <li key={course._id} className="px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                                <p className="text-gray-500">{course.description}</p>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-sm font-bold text-gray-700">₹{course.price}</span>
                                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600 capitalize">
                                        {course.content[0]?.type || 'video'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => fetchEnrollments(course._id, course.title)}
                                    className="text-emerald-700 hover:text-emerald-900 border border-emerald-700 px-3 py-1 rounded hover:bg-emerald-50 transition-colors"
                                >
                                    View Students
                                </button>
                                <button
                                    onClick={() => handleEdit(course)}
                                    className="text-green-700 hover:text-green-900 border border-green-700 px-3 py-1 rounded hover:bg-green-50 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteCourse(course._id)}
                                    className="text-red-600 hover:text-red-900 border border-red-600 px-3 py-1 rounded hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
