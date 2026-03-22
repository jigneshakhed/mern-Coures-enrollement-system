const jwt = require('jsonwebtoken');

module.exports = (roles = []) => {
    return (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({ message: 'Access Denied' });
            }

            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            next();
        } catch (err) {
            res.status(400).json({ message: 'Invalid Token' });
        }
    };
};
