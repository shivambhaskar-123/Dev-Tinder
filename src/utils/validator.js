const validator = require('validator');

const validateSignUpData = (reqBody) => {
    const { firstName, lastName, email, password, age } = reqBody;

    if (!firstName || !email || !password) {
        throw new Error("Please provide all the required fields");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Please provide a valid email");
    }

    if (!validator.isStrongPassword(password)) {
        throw new Error("Please provide a strong password");
    }

    if (age > 999) {
        throw new Error("Please Enter valid age of 18 - 60");
    }
};

const validateLoginApi = (req) => {
    const { email, password } = req;
    if (!email || !password) {
        throw new Error('Email and password are required');
    } else if (!validator.isEmail(email)) {
        throw new Error('Please provide a valid email');
    }
}

const validateProfileEditData = (reqBody) => {
    if (!reqBody || Object.keys(reqBody).length === 0) {
        throw new Error('Please provide data to update');
    }
    const { firstName, lastName, email, age } = reqBody;
    const allowedFields = [
        'firstName', 'lastName', 'age', 'photoUrl', 'about', 'skills', 'gender'];
    const isUpdateAllowed = Object.keys(reqBody).every(field => allowedFields.includes(field));
    if (!isUpdateAllowed) {
        throw new Error('Invalid update fields');
    }
}

module.exports = {
    validateSignUpData,
    validateLoginApi,
    validateProfileEditData
}