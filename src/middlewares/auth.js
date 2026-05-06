const adminAuth = (req, res, next) => {
    console.log('Admin auth is getting checked');
    const token = true;
    const isAdminAuthorized = token === true;
    if (!isAdminAuthorized) {
        return res.status(401).send('Unauthorized Access');
    } else {
        next();
    }
}

const userAuth = (req, res, next) => {
    console.log('User auth is getting checked');
    const token = true;
    const isAdminAuthorized = token === true;
    if (!isAdminAuthorized) {
        return res.status(401).send('Unauthorized Access');
    } else {
        next();
    }
}
module.exports = { adminAuth, userAuth };