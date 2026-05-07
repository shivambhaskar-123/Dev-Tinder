const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
            // required:true,
            // trim:true
        },
        email: {
            type: String,
            // required:true,
            // unique:true,
            // lowercase:true
        },
        age: {
            type: Number
        },
        gender: {
            type: String
        },
        password: {
            type: String,
            // required:true,
            // minlength:5
        }
    }
);

module.exports = mongoose.model('User', UserSchema);