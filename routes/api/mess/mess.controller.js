const Mess = require('../../../Models/mess')
const config = require("../../../config")
const nodemailer = require("nodemailer")
const crypto = require('crypto')

var request = require('request');

var sesTransport = require('nodemailer-ses-transport');

var SESCREDENTIALS = {
    accessKeyId: "accesskey",
    secretAccessKey: "secretkey"
};

var transporter = nodemailer.createTransport(sesTransport({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
}));


exports.count = (req, res) => {

    // refuse if not an admin
    // if(!req.decoded.admin) {
    //     return res.status(403).json({
    //         message: 'you are not an admin'
    //     })
    // }

    Mess.find({ admin: false }).count({}).then(data =>
        res.status(200).json({ status: true, data })
    ).catch(error => {
        res.status(400).json({ status: false, message: error })
    })
}


/* 
    GET /api/user/list
*/

exports.list = (req, res) => {
    // refuse if not an admin
    // if(!req.decoded.admin) {
    //     return res.status(403).json({
    //         message: 'you are not an admin'
    //     })
    // }

    Mess.find({}, '-password').exec()
        .then(
            users => {
                res.json({ users })
            }
        )

}


/*
    POST /api/user/assign-admin/:username
*/
exports.assignAdmin = (req, res) => {
    // refuse if not an admin
    if (!req.decoded.admin) {
        return res.status(403).json({
            message: 'you are not an admin'
        })
    }

    Mess.findOneByUsername(req.params.username)
        .then(
            mess => {
                if (!mess) throw new Error('mess not found')
                mess.assignAdmin()
            }
        ).then(
            res.json({
                success: true
            })
        ).catch(
            (err) => { res.status(404).json({ message: err.message }) }
        )
}

exports.resetpassword = (req, res) => {


    Mess.findOne({ emailAddress: req.body.emailAddress }, function (err, mess) {
        if (err) {
            res.json({ 'success': false, 'message': err });
        }
        if (!mess) {
            res.status(404).json({ status: false, message: 'No mess found' });
        } else {
            var url = "https://precedentonline.com" + '/setpassword/?token=' + user._id;
            var userEmail = user.emailAddress;
            // var emailText = 'please click on the below link for the forget password link';
            emailText += '<p><a href="' + url + '">click here</a>';
            var emailText = `<p>Hi ${user.firstName}</p><p>Please <a href="${url}">click here</a> to reset your password and continue using our portal</p><p>Regards</p>Precedent Team`

            var mailOptions = {
                from: 'Precedent Online <admin@precedentonline.com>',
                to: userEmail,
                subject: 'Forget Password Link',
                html: emailText
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.json({ 'success': false, 'message': error });
                } else {
                    res.json({ 'success': true, 'message': 'email sent successfully' });
                }
            });
        }
    });

}


exports.setpassword = (req, res) => {

    User.findById(req.body.userid, function (err, user) {
        if (err) {
            res.json({ 'success': false, 'message': err });
        }
        if (!user) {
            res.json({ 'success': false, 'message': 'No user found' });
        } else {
            // bcrypt.genSalt(10, function(err, salt){
            //   bcrypt.hash(req.body.newpassword, salt, function(err, hash){
            //     if(err){
            //       res.json({ 'success': false, 'message': err });
            //     }
            const encrypted = crypto.createHmac('sha1', config.secret)
                .update(req.body.newPassword)
                .digest('base64')

            let userobject = {};
            userobject.password = encrypted;
            let query = { _id: req.body.userid }
            User.update(query, userobject, function (err) {
                if (err) {
                    res.json({ 'success': false, 'message': err });
                    return;
                } else {
                    res.json({ 'success': true, 'message': 'Password Successfully Changed' });
                }
            });
            //   });
            // });
        }
    });

}
// };



exports.verify = (req, res) => {

    User.findByIdAndUpdate(req.body.userid, { $set: { verified: true } }).then(data => {
        res.json({ 'success': true, 'message': 'Profile verified' });
    }).catch(err => {
        res.json({ 'success': false, 'message': err });
    })

}



exports.deleteMess = (req, res) => {
    Mess.findByIdAndRemove(req.params.id).then(data => {
        res.status(200).json({ 'success': true, 'message': 'Mess removed' });
    }).catch(err => {
        res.status(400).json({ 'success': false, 'message': err });
    })

}


exports.updateMess = (req, res) => {

    Mess.findByIdAndUpdate(req.params.id, req.body, { new: true }).then(data => {

        res.status(200).json({ 'success': true, 'message': 'Mess Updated', data });
    }).catch(err => {


        res.status(400).json({ 'success': false, 'message': err });


    })

}


exports.viewMess = (req, res) => {

    Mess.findById(req.params.id).then(data => {
        res.status(200).json({ 'success': true, 'message': 'Mess fetched', data });
    }).catch(err => {


        res.status(400).json({ 'success': false, 'message': err });


    })

}


exports.register = (req, res) => {
    const { password,
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

        admin } = req.body

    // let admin = req.body.admin ? true:false
    let newMess = null

    // create a new user if does not exist
    const create = (mess) => {
        if (mess) {
            throw new Error('Email Address exists')
        } else {
            return Mess.create(password,
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

                admin,

            )

        }
    }


    /*
    // count the number of the user
    const count = (mess) => {
        console.log({ mess })


        //var url = "https://precedentonline.com" +'/verified/?token='+user._id;

        var userEmail = user.emailAddress;
        var emailText = `<p>Hi ${user.firstName}</p><p>Please <a href="${"http://localhost:8000"}">click here</a> to verify your account and start using our portal.</p><p>Regards</p>Precedent Team`



        //   emailText += '<p><a href="'+url+'">click here</a>';
        var mailOptions = {
            from: 'Testifier  <admin@testifier.com>',
            to: userEmail,
            subject: 'Testifier | Verify Your Account',
            html: emailText
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                //   res.json({ 'success': false, 'message': error });
            }
            console.log({ 'success': true, 'message': 'email sent successfully' })

        });


        newUser = user
        return User.count({}).exec()
    }
    */

    // assign admin if count is 1
    const assign = (count) => {
        if (count === 1) {
          //  return newMess.assignAdmin()
         return  Promise.resolve(true)
        } else {
            // if not, return a promise that returns false
            return Promise.resolve(false)
        }
    }

    // respond to the client
    const respond = (isAdmin) => {
        res.json({
            message: 'Registered successfully',
            admin: isAdmin ? true : false
        })
    }

    // run when there is an error (username exists)
    const onError = (error) => {
        res.status(409).json({
            message: error.message
        })
    }

    // check username duplication
    Mess.findOneByEmailAddress(emailAddress)
        .then(create)
        .then(count)
        .then(assign)
        .then(respond)
        .catch(onError)
}
