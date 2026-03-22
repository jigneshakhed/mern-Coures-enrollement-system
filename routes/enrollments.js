const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');

router.post('/', auth(), enrollmentController.enrollCourse);
router.delete('/course/:courseId', auth(), enrollmentController.unenrollCourse);
router.get('/my', auth(), enrollmentController.getMyEnrollments);
router.get('/course/:courseId', auth(['admin']), enrollmentController.getCourseEnrollments);

module.exports = router;
