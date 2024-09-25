const express = require('express');
const router = express.Router();
const { signUpValidation , loginValidation ,emailValidation  } = require('../helpers/validation');
const { register,login ,getAllDeveloper,getAllUsers,validateEmail,convertFile ,verifyEmail } = require('../controller/userController'); // Check this import
const path = require('path');
const multer = require('multer');

const storage= multer.diskStorage({
    destination:function(req, file, cb){
        cb(null,path.join(__dirname, '../public/images'));

    },
    filename:function (req, file, cb){
        const name = Date.now()+'-'+ file.originalname;
        cb(null, name); // Passing the generated filename to the callback
    }
})
const fileFilter = (req, file, cb)=>{
 (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png')?cb(null, true): cb(null, false);
}
const upload = multer({
    storage:storage,
    fileFilter:fileFilter
})

router.post('/auth/register',upload.single('image'),signUpValidation, register);
router.post('/auth/admin/login',loginValidation, login);
router.get('/admin/get-developers', getAllDeveloper);
router.get('/admin/get-users', getAllUsers);
router.get('/admin/get-user', getAllUsers);
router.post('/auth/customer/login',loginValidation, login);
router.post('/validate-email', emailValidation,  validateEmail);
router.post('/verify-email', emailValidation,  verifyEmail);
router.post('/convert-file', upload.single('image'),convertFile );
// router.post('/convert-file', upload.single('file'), convertFile);

module.exports = router;