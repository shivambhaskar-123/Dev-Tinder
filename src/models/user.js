const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            // required:true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        age: {
            type: Number,
            min: 18
        },
        gender: {
            type: String,
            validate(value) {
                const allowedValues = ['male', 'female', 'others'];
                if (!allowedValues.includes(value)) {
                    throw new Error('Invalid gender value');
                }
            }
            /**
             * This validator will always run when we will create new user instance
             * But in update it will not for that in findOneAndUpdate in there option we have to pass {runValidators :true} to run the validate function
             */
        },
        photoUrl: {
            type: String,
            default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
        },
        about: {
            type: String,
            default: "This is a default about for a user"
        },
        password: {
            type: String,
            required: true,
            minlength: 5
        },
        skills: {
            type: [String]
        }
    },
    {
        timestamps: true // automatically add the createdAt, and updatedAt
    }
);

module.exports = mongoose.model('User', UserSchema);