const nodemailer = require('nodemailer');
const {SMTP_MAIL, SMTP_PASSWORD,HOST } = process.env ;

const sendMail = async(email, mailOptions)=>{
  console.log("ddd",email, mailOptions );
    try{
        const transporter = nodemailer.createTransport({
            host:HOST,
            port: 587,
            secure:false,
            requireTLS: true,
            auth:{
                user: SMTP_MAIL,
                pass: SMTP_PASSWORD
            }
        });  
        
        // const mailOptions={
        //     from: SMTP_MAIL,
        //     to:email,
        //     subject:mailSubject,
        //     html: content
        // }
        transporter.sendMail(mailOptions, function (error,info){
          if(error){
            console.log(error);
          }
          else{
            console.log("Mail is send :-", info.response);
          }
        });
    }
    catch (error){
        console.log(error.message);
    }
}
module.exports =sendMail;