const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new Schema(
    {
        firstName: {
            type: String,
            // required: true,
            required: [true, 'First name is required'],
            minlength: [2, 'First name atleat of 2 characters'],
            maxlength: [50, 'First name cannot exceed 50 characters'],
            trim: true,
            validate(value) {
                if (!validator.isAlpha(value, 'en-US', { ignore: ' -' })) {
                    throw new Error('First name can only contain letters, spaces, or hyphens');
                }
            }
        },
        lastName: {
            type: String,
            maxlength: [50, 'Last name cannot exceed 50 characters'],
            validate(value) {
                // only run if value is actually provided (field is optional)
                if (value && !validator.isAlpha(value, 'en-US', { ignore: ' -' })) {
                    throw new Error('Last name can only contain letters, spaces, or hyphens');
                }
            },
            trim: true
        },
        email: {
            type: String,
            // required: true,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: [254, 'Email cannot exceed 254 characters'], // RFC 5321 standard limit
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error(value);
                }
            }
        },
        age: {
            type: Number,
            min: [18, 'User must be at least 18 years old'],
            // max: [120, 'Please enter a valid age'],  // catches garbage like age: 9999
            validate(value) {
                if (!Number.isInteger(value)) {
                    throw new Error('Age must be a whole number');
                }
            }
        },
        gender: {
            type: String,
            lowercase: true,
            // validate(value) {
            //     const allowedValues = ['male', 'female', 'others'];
            //     if (!allowedValues.includes(value)) {
            //         throw new Error('Invalid gender value');
            //     }
            // }
            /**
             * This validator will always run when we will create new user instance
             * But in update it will not for that in findOneAndUpdate in there option we have to pass {runValidators :true} to run the validate function
             */
            enum: {              // NOTE use enum instead of custom validate for fixed value lists
                values: ['male', 'female', 'others'],
                message: 'Gender must be male, female, or others'
            }
        },
        photoUrl: {
            type: String,
            trim: true,
            default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
            validate(value) {
                if (value && !validator.isURL(value, {
                    protocols: ['http', 'https'],   // block ftp://, javascript:// etc
                    require_protocol: true          // must have https:// — not just 'google.com'
                })) {
                    throw new Error('Photo URL must be a valid URL');
                }
            }
        },
        about: {
            type: String,
            default: "This is a default about for a user",
            maxlength: [500, 'About section cannot exceed 500 characters']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            validate(value) {
                if (!validator.isStrongPassword(value, {
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                })) {
                    throw new Error('Password must contain uppercase, lowercase, number, and special character');
                }
            }
        },
        skills: {
            type: [String],
            default: [],
            validate(value) {
                if (value.length > 20) {
                    throw new Error('Cannot have more than 20 skills');
                }
                // each skill should be a reasonable string
                value.forEach(skill => {
                    if (skill.trim().length < 1 || skill.trim().length > 50) {
                        throw new Error('Each skill must be between 1 and 50 characters');
                    }
                });
            }
        }
    },
    {
        timestamps: true // automatically add the createdAt, and updatedAt
    }
);

// ─────────────────────────────────────────
// INSTANCE METHODS  (called on one document) of that particular instance
// ─────────────────────────────────────────

// 1. Compare password — used in login, change-password

UserSchema.methods.isPasswordValid = async function (passwordEnteredByUSer) {
    // 'this' refers to the current user document
    const user = this;
    return await bcrypt.compare(passwordEnteredByUSer, user.password);
    // return await bcrypt.compare(candidatePassword, this.password); // same as above
}

// 2. Generate JWT — used in login, signup

UserSchema.methods.getJWT = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token;
}

// 3. Get public profile — strip sensitive fields before sending response
// instead of remembering to do select('-password') everywhere
UserSchema.methods.toPublicProfile = function () {
    const user = this.toObject();   // convert mongoose doc to plain object
    delete user.password;
    delete user.__v;
    return user;
};

// ─────────────────────────────────────────
// STATIC METHODS  (called on Model directly)
// ─────────────────────────────────────────

// 1. Find by credentials — login logic lives here, not in route
UserSchema.statics.findByCredentials = async function (email, password) {
    // 'this' refers to the User Model
    const user = await this.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
        // same message for wrong email and wrong password — don't leak which one
        throw new Error('AUTH_FAILED');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('AUTH_FAILED');
    }

    return user;
};

// 2. Find by email — used in multiple places
UserSchema.statics.findByEmail = async function (email) {
    return await this.findOne({ email: email.toLowerCase().trim() });
};

// ─────────────────────────────────────────
// VIRTUALS  (computed fields, not stored in DB)
// ─────────────────────────────────────────

// 1. Full name — derived from firstName + lastName
UserSchema.virtual('fullName').get(function () {
    // return `${this.firstName} ${this.lastName}`.trim();
    return this.lastName
        ? `${this.firstName} ${this.lastName}`
        : this.firstName;
});

// 2. Profile completion percentage
UserSchema.virtual('profileCompletion').get(function () {
    const fields = ['firstName', 'lastName', 'email', 'age', 'gender', 'photoUrl', 'about', 'skills'];
})

// ─────────────────────────────────────────
// PRE HOOKS  (runs before DB operations)
// ─────────────────────────────────────────

// hash password before save — you already have this
// UserSchema.pre('save', async function (next) {
//     if (this.isModified('password')) {
//         this.password = await bcrypt.hash(this.password, 10);
//     }
//     next();
// });



/** User Schema methods:
 * statics:    available on the Model (User.find(), User.create())
 * methods:    available on the Instance (user.save(), user.remove())
 * virtuals:   computed properties (user.fullName)
 * getters:    modify how a field is retrieved (user.email -> lowercase)
 * setters:    modify how a field is set (user.email = 'FOO@BAR.COM' -> 'foo@bar.com')
 * middleware: functions that run before/after certain operations (pre/post hooks)
 */

/**
 * Every String field   →  trim, maxlength (prevent DB bloat)
Every required field →  custom error message ['required', 'Your message']
Email                →  isEmail + lowercase + unique + maxlength:254
Password             →  isStrongPassword + minlength:8 (never store plain — always hash with bcrypt)
Fixed value lists    →  enum (not custom validate)
URLs                 →  isURL with require_protocol:true
Arrays               →  validate array length + validate each item
Numbers              →  min + max both (not just min)
 */

module.exports = mongoose.model('User', UserSchema);
// module.exports = mongoose.models.User || mongoose.model('User', UserSchema);