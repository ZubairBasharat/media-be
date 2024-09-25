const {check }  =require('express-validator');
exports.signUpValidation = [
    // check('name', 'Name is Require').not().isEmpty(),
    check('email','Please Enter a Valid Email').isEmail().normalizeEmail({
        gmail_remove_dots:true
    }),
    // check('password','Password is require').isLength({min:6}),
    // check('image').custom((value,{req})=>{
    //     if(req.file.mimetype == 'image/jpeg' || req.file.mimetype == 'image/png'){
    //         return true;
    //     }else{
    //         return false
    //     }
    // }).withMessage("Please  Select PNG or JPG ")
]
exports.loginValidation = [
    check('email','Please Enter a Valid Email').isEmail().normalizeEmail({
        gmail_remove_dots:true
    }),
    check('password', 'Password is required').not().isEmpty().withMessage('Password is required')


  
  
]

exports.emailValidation = [
    check('email','Please Enter a Valid Email').isEmail().normalizeEmail({
        gmail_remove_dots:true
    }),
]