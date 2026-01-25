const mongoose = require("mongoose");

const SCHEMA = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        lowercase: true,
        minlength: [3, 'Name must be at leaset 5 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, 'Duplicate Email Adress'],
        trim: true,
        lowercase: true,
        minlength: [5, "Email must be at least 5 characters"],
        maxlength: [254, "Email cannot exceed 254 characters"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        // minlength: [3, 'Password must be at leaset 5 characters'],
        // maxlength: [100, 'Password cannot exceed 50 characters'],
        // validate: {
        //     validator: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value),
        //     message: "Invalid Password format"
        // },
    },
    phone_number: {
        type: String,
        required: [true, "Phone number is required"],
        unique: [true, 'Duplicate Phone number'],
        trim: true,
        lowercase: true,
        minlength: [7, "Phone number must be at least 7 characters"],
        maxlength: [15, "Phone number cannot exceed 15 characters"],
    },
    address: {
        type: String,
        required: false,
        trim: true,
        minlength: [3, "Address must be at least 3 characters"],
        maxlength: [50, "Address cannot exceed 50 characters"],
    },
    user_type: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, "Address must be at least 3 characters"],
        maxlength: [50, "Address cannot exceed 50 characters"],
    }
})

const USERS_SCHEMA = mongoose.model("users", SCHEMA, "users");

module.exports = { USERS_SCHEMA }


/*
email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  validate: {
    validator: v => EMAIL_REGEX.test(v),
    message: "Invalid email format"
  }
}
  */