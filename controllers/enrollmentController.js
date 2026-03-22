const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

exports.enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (existingEnrollment) return res.status(400).json({ message: 'Already enrolled' });

        const enrollment = new Enrollment({ user: userId, course: courseId });
        await enrollment.save();

        // Add to user's enrolledCourses
        await User.findByIdAndUpdate(userId, { $push: { enrolledCourses: courseId } });

        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user: req.user.id }).populate('course');
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCourseEnrollments = async (req, res) => {
    try {
        const { courseId } = req.params;
        const enrollments = await Enrollment.find({ course: courseId })
            .populate('user', 'username email');
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.unenrollCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Find the enrollment
        const enrollment = await Enrollment.findOneAndDelete({ user: userId, course: courseId });

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Remove from user's enrolledCourses
        await User.findByIdAndUpdate(userId, { $pull: { enrolledCourses: courseId } });

        res.json({ message: 'Successfully unenrolled from the course' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
