const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')
const config = require('../config')
const schemaOptions = {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};
const Mess = new Schema({
    messName: { type: String, unique: true },
    messAgentName:String,
    password: String,
    city: String,
    state: String,
    pincode:String,
    address:String,
    aadharNumber: String,
    phoneNumber: String,
    messPhoto:String,
    monthlyCharge:Number,
    daysCharge:Number,
    tiffinService:{type:Boolean,default:false},
    ratings:Number,
    blocked: { type: Boolean, default: false },
    verified: { type: Boolean, default: true },
    admin: { type: Boolean, default: false },
}, schemaOptions)


// crypto.createHmac('sha1', 'secret')
//              .update('mypasswssord')
//              .digest('base64')


// create new User document
Mess.statics.create = function (password,
    messName,
    messAgentName,
    password,
    city,
    state,
    pincode,
    address,
    aadharNumber,
    phoneNumber,
    messPhoto,
    monthlyCharge,
    daysCharge,
    tiffinService,
    ratings,
    admin) {
    const encrypted = crypto.createHmac('sha1', config.secret)
        .update(password)
        .digest('base64')

    const mess = new this({
        messName,
        messAgentName,
        password,
        city,
        state,
        pincode,
        address,
        aadharNumber,
        phoneNumber,
        messPhoto,
        monthlyCharge,
        daysCharge,
        tiffinService,
        ratings,
        password: encrypted,
        admin
    })

    // return the Promise
    return mess.save()
}


// find one user by using username
Mess.statics.findOneByEmailAddress = function (emailAddress) {
    return this.findOne({
        emailAddress
    }).exec()
}
// verify the password of the User documment
Mess.methods.verify = function (password) {
    const encrypted = crypto.createHmac('sha1', config.secret)
        .update(password)
        .digest('base64')
    console.log(this.password === encrypted)

    return this.password === encrypted
}

    Mess.methods.assignAdmin = function () {
    this.admin = true
    return this.save()
}

module.exports = mongoose.model('Mess', Mess)