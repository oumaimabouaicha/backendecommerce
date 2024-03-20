const express = require('express');
const router = express.Router();
const User=require("../models/user")
const nodemailer=require('nodemailer');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
var transporter =nodemailer.createTransport({
    service:'gmail',
    auth:{
    user:'safabid95@gmail.com',
    pass:'bvaq ycow ejhx vbom'
    },
    tls:{
    rejectUnauthorized:false
    }
    })
// créer un nouvel utilisateur
router.post('/register', async (req, res) => {
    try {
    let { email, password, role, firstname, lastname,isActive, avatar } = req.body
    const user = await User.findOne({ email })
    if (user) return res.status(404).send({ success: false, message:"User already exists" }) 
    
    const newUser = new User({
 email:email,
 password:password,
 role:role||"user",
 firstname:firstname ||"myfirstname",
 lastname:lastname ||"mylastname",
isActive:isActive ||false,
avatar:avatar||"https://res.cloudinary.com/dcex70obk/image/upload/v1708986671/image/jouets.png.png"
 })
    const createdUser = await newUser.save()

    // Envoyer l'e-mail de confirmation de l'inscription
    var mailOption ={
    from: 'safabid95@gmail.com',
    to: newUser.email,
    subject: 'vérification your email ',
    html:`<h2>${newUser.firstname}! thank you for registreting on our website</h2>
    <h4>please verify your email to procced.. </h4>
    <a
    href="http://${req.headers.host}/api/user/status/edit?email=${newUser.email}">click
    here</a>`
    }
    transporter.sendMail(mailOption,function(error,info){
    if(error){
    console.log(error)
    }
    else{
    console.log('verification email sent to your gmail account ')
    }
    })
    return res.status(201).send({ success: true, message: "Accountcreated successfully", user: createdUser })
    } catch (err) {
    console.log(err)
    res.status(404).send({ success: false, message: err })
    }
    });
    // afficher la liste des utilisateurs.
router.get('/', async (req, res, )=> {
    try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
    } catch (error) {
    res.status(404).json({ message: error.message });
    }
    
    });
    router.get('/status/edit/', async (req, res) => {
        try {
        let email = req.query.email
        let user = await User.findOne({email})
        user.isActive = !user.isActive
        user.save()
        res.status(200).send({ success: true, user })
        } catch (err) {
        return res.status(404).send({ success: false, message: err })
        }
    })

// se connecter
router.post('/login', async (req, res) => {
    try {
    let { email, password } = req.body
    
    if (!email || !password) {
    return res.status(404).send({ success: false, message: "Allfields are required" })
  
    }
    
    let user = await User.findOne({ email
    }).select('+password').select('+isActive')
    
    if (!user) {
    
    return res.status(404).send({ success: false, message: "Account doesn't exists" })
    
    } else {
    
    let isCorrectPassword = await bcrypt.compare(password, user.password)
    if (isCorrectPassword) {
    
    delete user._doc.password
    if (!user.isActive) return res.status(200).send({ success:false, message: 'Your account is inactive, Please contact your administrator' })

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    
    
    return res.status(200).send({ success: true, user, token, refreshToken })
    
    } else {
    
    return res.status(404).send({ success: false, message:
    
    "Please verify your credentials" })
    
    }

    }
    } catch (err) {
    return res.status(404).send({ success: false, message: err.message
    
    })
    } 
    });

    //Access Token
const generateAccessToken=(user) =>{
    return jwt.sign ({ iduser: user._id, role: user.role }, process.env.SECRET, {
    expiresIn: '60s'})
    }
    // Refresh
    function generateRefreshToken(user) {
    return jwt.sign ({ iduser: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1y'})
    }
    //Refresh Route
    router.post('/refreshToken', async (req, res, )=> {
    console.log(req.body.refreshToken)
    const refreshtoken = req.body.refreshToken;
if (!refreshtoken) {
return res.status(404).send({success: false, message: 'Token Not Found' });
}
else {
jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
if (err) { console.log(err)
return res.status(406).send({ success: false,message: 'Unauthorized' });
}
else {
const token = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);
console.log("token-------",token);
res.status(200).send({success: true,
token,
refreshToken
})
}
});
}

});

    /*
Forgot password
*/

router.post('/forgot-password', (req, res) => {
    const {email} = req.body;
    User.findOne({email: email})
    .then(user => {
    if(!user) {
    return res.send({Status: "User not existed"})
    }
    const token = jwt.sign({id: user._id}, "jwt_secret_key", {expiresIn:
    "1d"})
    var transporter =nodemailer.createTransport({
        service:'gmail',
        auth:{
        user:'safabid95@gmail.com',
        pass:'bvaq ycow ejhx vbom'
        },
        tls:{
        rejectUnauthorized:false
        }
        })
    var mailOptions = {
    from: '"verify your email " <safabid95@gmail.com>',
    to: email,
    subject: 'Reset Password Link',
    text: `http://localhost:3000/reset_password/${user._id}/${token}`
    };
    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
    console.log(error);
    } else { console.log(info)
    return res.send({Status: "Success"})
    
    }
    });
    })
    })
    
    /*
    Reset Password
    */
    router.post('/reset_password/:id/:token', async(req, res) => {
    const {id, token} = req.params
    const {password} = req.body
    jwt.verify(token, "jwt_secret_key", async (err, decoded) => {
    if(err) {
    return res.json({Status: "Error with token"})
    } else {
    const salt=await bcrypt.genSalt(10);
    await bcrypt.hash(password,salt)
    .then(hash => {
    User.findByIdAndUpdate({_id: id}, {password: hash})
    .then(u => res.send({Status: "Success"}))
    .catch(err => res.send({Status: err}))
    })
    .catch(err => res.send({Status: err}))
    }
    })
    })
    module.exports = router;