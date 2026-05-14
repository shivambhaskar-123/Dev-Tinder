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

module.exports = {
    validateSignUpData
}