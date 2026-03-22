import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <Link to="/" className="text-2xl font-bold text-green-800 tracking-wider">EduEnroll</Link>
                    <div className="flex space-x-4 items-center">
                        <Link to="/" className="text-gray-700 font-medium hover:text-green-700 transition">Home</Link>
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-gray-700 font-medium hover:text-green-700 transition">My Dashboard</Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-gray-700 font-medium hover:text-green-700 transition">Admin Panel</Link>
                                )}
                                <button onClick={handleLogout} className="text-red-600 font-medium hover:text-red-800 transition">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 font-medium hover:text-green-700 transition">Login</Link>
                                <Link to="/register" className="bg-green-700 text-white px-5 py-2 rounded-md hover:bg-green-800 shadow-sm transition">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
