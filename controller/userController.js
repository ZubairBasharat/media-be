const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../config/dbConnecation');
const randomstring = require('randomstring');
const sendMail = require('../helpers/sendMail');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken module
const fs = require("fs");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");

const register = (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    db.query(`SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(req.body.email)});`, (err, result) => {
        if (result && result.length) {
            return res.status(409).json({
                msg: 'This user is already in use'
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(400).json({
                        msg: err
                    });
                } else {
                    let imageSql = '';
                    if (req.file) {
                        imageSql = `, 'images/${req.file.filename}'`;
                    }
                    db.query(
                        `INSERT INTO users (email, name, password,image) VALUES (${db.escape(req.body.email)}, '${req.body.name}', ${db.escape(hash)},
                        'images/${imageSql}'
                        )`,
                        (err, result) => {
                            if (err) {
                                return res.status(400).json({
                                    msg: err
                                });
                            }
                            // let mailSubject = "Mail Verification ";
                             const randomToken = randomstring.generate();
                             let content = `<p>Hi ${req.body.name} please <a href= "${process.env.BASED_URL}/mail-verification?token=${randomToken}"> verify</a>`;
                            // sendMail(req.body.email, mailSubject, content);
                            const mailOptions = {
                                from: "media@pronoor.com",
                                to: req.body.email,
                                subject: "Mail Verification ",
                                html: content ,
                            };
                            sendMail(req.body.email, mailOptions );

                            db.query('UPDATE users SET token=? WHERE email=?', [randomToken, req.body.email], function (error, result, fields) {
                                if (error) {
                                    return res.status(400).send({
                                        msg: error
                                    });
                                }

                                // Send response after the update is completed
                                return res.status(201).json({
                                    msg: "The user has been registered",
                                    status: 201
                                });
                            });
                        }
                    );
                }
            });
        }
    });
};

const verifyMail = (req, res) => {
    var token = req.query.token;

    db.query("SELECT * FROM users WHERE token = ? LIMIT 1", [token], (error, result, fields) => {
        // Rest of your code
        if (error) {
            console.log(error.message);
        } else if (result && result.length > 0) {
            db.query(`UPDATE users SET token = null, is_verified = true WHERE id = ${result[0].id}`, (error, result, fields) => {
                if (error) {
                    console.log(error.message);
                } else {
                    return res.render('mail-verification', { message: 'Mail Verified Successfully' });
                }
            });
        } else {
            return res.render("404");
        }
    });
}



getAllDeveloper = (req, res) => {
    // Pagination parameters
    const page = req.query.page || 1; // Default page is 1
    const limit = req.query.limit || 10; // Default limit is 10

    // Calculate offset based on page number
    const offset = (page - 1) * limit;

    // Select developers from the database with pagination
    const sql = `SELECT * FROM developers LIMIT ${limit} OFFSET ${offset}`;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({
                error: "Failed to get developers",
            });
        }

        res.json({
            data: result,
            currentPage: page,
            totalPages: Math.ceil(result.length / limit),
        });
    });
}


getAllUsers = (req, res) => {
    // Pagination parameters
    const page = req.query.page || 1; // Default page is 1
    const limit = req.query.limit || 10; // Default limit is 10

    // Calculate offset based on page number
    const offset = (page - 1) * limit;

    // Select developers from the database with pagination
    const sql = `SELECT * FROM users LIMIT ${limit} OFFSET ${offset}`;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({
                error: "Failed to get users",
            });
        }

        res.json({
            data: result,
            currentPage: page,
            totalPages: Math.ceil(result.length / limit),
        });
    });
}


login = (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    db.query(`SELECT * FROM users WHERE email = ${db.escape(req.body.email)} AND is_admin = 0;`,
        (err, result) => {
            if (err) {
                return res.status(400).send({
                    message: err
                })
            }

            if (result.length === 0) {
                return res.status(401).send({
                    msg: "Email or password is incorrect "
                });
            }

            bcrypt.compare(
                req.body.password,
                result[0]['password'],
                (bErr, bResult) => {
                    if (err) {
                        return res.status(400).send({
                            message: bErr
                        })
                    }

                    if (bResult) {
                        const token = jwt.sign({
                            id: result[0]['id'],
                            is_admin: result[0]['is_admin'],
                        }, process.env.JWT_SECRET, {
                            expiresIn: '1h'
                        })
                        db.query(`UPDATE users SET last_login = now() WHERE id = ${result[0]['id']}`)
                        return res.status(200).json({
                            msg: "Login In ",
                            token,
                            user: result[0],
                            code: 200
                        });

                    }

                    else {
                        return res.status(401).json({ msg: "Email or password is incorrect" });
                    }
                }
            )

        }

    )
}

const jwtSecretKey = process.env.JWT_SECRET; // Make sure this is a secure key and store it in an environment variable

const yourTokenGenerationLogic = (email) => {
    return jwt.sign({ email }, jwtSecretKey, { expiresIn: "24h" }); // Token expires in 24 hours
};


const validateEmail = async (req, res) => {
    const { email } = req.body; // Assuming email is passed in the request body

    const uniqueURL = `${process.env.FRONTEND_BASE_URL}/email-verification?token=${yourTokenGenerationLogic(email)}`;

    const mailOptions = {
        from: "media@pronoor.com",
        to: email,
        subject: "Welcome!",
        text: `Welcome! Please verify your email by clicking on this link: ${uniqueURL}`,
        html: `<p>Welcome! Please verify your email by clicking on this <a href="${uniqueURL}">link</a>.</p>`,
    };

    try {
        await sendMail(email, mailOptions); // Pass email and mailOptions
        res.json({ message: "Email is valid and welcome email sent." });
    } catch (error) {
        res.status(500).json({ message: "Failed to send welcome email." });
    }
};



//verify-email

 const verifyEmail = (req, res) => {
    const { token } = req.body;
  
    if (!token) {
      return res.status(400).json({ message: "No token provided." });
    }
  
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
      }
  
      // Token is valid. You can perform additional actions here,
      // like updating the user's verification status in your database.
  
      // For this example, we'll just return a success message.
      res.json({
        message: `Email ${decoded.email} has been successfully verified.`,
        status: "success",
      });
    });

};



const convertFile = async (req, res) => {
    const file = req.file;
    const selectedFormat = req.body.format; // Get selected format from request body
    let fileType = file.mimetype.split("/")[0];

    try {
        if (fileType === "video" || fileType === "audio") {
            await new Promise((resolve, reject) => {
                ffmpeg(file.path)
                    .format(selectedFormat) // Use format() to set the output format
                    .save(
                        `${file.destination}${file.filename}_compressed.${selectedFormat}`
                    )
                    .on("end", resolve)
                    .on("error", reject);
            });
        } else if (fileType === "image") {
            await sharp(file.path)
                .toFormat(selectedFormat) // Use selected format
                .toFile(
                    `${file.destination}${file.filename}_compressed.${selectedFormat}`
                );
        } else {
            return res.status(400).json({ message: "Unsupported file type." });
        }

        const originalFilePath = file.path;
        const convertedFilePath = `${file.destination}${file.filename}_compressed.${selectedFormat}`;

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${file.filename}_compressed.${selectedFormat}`
        );
        res.download(convertedFilePath);

        res.on("finish", () => {
            // Delete original file
            fs.unlink(originalFilePath, (err) => {
                if (err) {
                    console.error(`Failed to delete original file: ${err}`);
                } else {
                    console.log(
                        `Successfully deleted original file: ${originalFilePath}`
                    );
                }
            });

            // Delete converted file
            fs.unlink(convertedFilePath, (err) => {
                if (err) {
                    console.error(`Failed to delete converted file: ${err}`);
                } else {
                    console.log(
                        `Successfully deleted converted file: ${convertedFilePath}`
                    );
                }
            });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to convert file." });
    }
}




module.exports = { register, verifyMail, login, getAllDeveloper, getAllUsers, validateEmail,convertFile,verifyEmail };

