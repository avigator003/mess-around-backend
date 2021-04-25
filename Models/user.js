const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')
const config = require('../config')
const schemaOptions = {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};
const User = new Schema({
    name: String,
    emailAddress: { type: String, unique: true },
    password: String,
    city: String,
    state: String,
    aadharNumber: String,
    phoneNumber: String,
    messRegistered: { type: Schema.Types.ObjectId, ref: "Mess" },
    blocked: { type: Boolean, default: false },
    verified: { type: Boolean, default: true },
    admin: { type: Boolean, default: false },
}, schemaOptions)


// crypto.createHmac('sha1', 'secret')
//              .update('mypasswssord')
//              .digest('base64')


// create new User document
User.statics.create = function (password,
    name,
    emailAddress,
    phoneNumber,
    city,
    state,
    aadharNumber,
    phoneNumber,
    messRegistered,

    admin) {
    const encrypted = crypto.createHmac('sha1', config.secret)
        .update(password)
        .digest('base64')

    const user = new this({
        name,
        emailAddress,
        phoneNumber,
        city,
        state,
        aadharNumber,
        phoneNumber,
        messRegistered,
        password: encrypted,
        admin
    })

    // return the Promise
    return user.save()
}

// find one user by using username
User.statics.findOneByEmailAddress = function (emailAddress) {
    return this.findOne({
        emailAddress
    }).exec()
}

// verify the password of the User documment
User.methods.verify = function (password) {
    const encrypted = crypto.createHmac('sha1', config.secret)
        .update(password)
        .digest('base64')
    console.log(this.password === encrypted)

    return this.password === encrypted
}

User.methods.assignAdmin = function () {
    this.admin = true
    return this.save()
}

module.exports = mongoose.model('User', User)