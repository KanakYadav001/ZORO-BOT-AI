const mongoose  = require('mongoose');


const userScema = new mongoose.Schema({
    name :{
        firstName : {
            type : String,
            maxlength : [10, 'First name cannot exceed 50 characters'],
            required : [true, 'First name is required']
        },
        lastName : {
            type : String,
            maxlength : [10, 'Last name cannot exceed 50 characters'],
            required : [true, 'Last name is required']
        }
    },
    email : {
        type : String,
        required : [true, 'Email is required'],
        trim : true,
        unique : true,
        lowercase : true,
        match : [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    password : {
        type : String,
        minlength : [6, 'Password must be at least 6 characters long'],
        required : [true, 'Password is required']
    },
    role : {
        type : String,
        enum : ['user', 'modle'],
        default : 'user'
    }

},{    timestamps : true
});


const userModel = mongoose.model('User', userScema);


module.exports = userModel;