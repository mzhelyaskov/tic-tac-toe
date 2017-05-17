module.exports = function (req, res, next) {
    var loggedInUser = req.session.loggedInUser;
    if (loggedInUser) {
        req.loggedInUser = res.locals.loggedInUser = loggedInUser;
    }
    next();
};