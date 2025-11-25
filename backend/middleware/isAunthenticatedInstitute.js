const isAuthenticatedInstitute = (req, res, next) => {
    if (req.session && req.session.instituteId) {
        return next();
    }

    // Return JSON so frontend can parse and show a helpful message
    res.status(403).json({ success: false, message: 'Not authenticated as an institute' });
};

module.exports = isAuthenticatedInstitute;
  