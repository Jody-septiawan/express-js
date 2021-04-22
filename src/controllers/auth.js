const { user } = require('../../models');
const joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = "0a9sd0asd9mnds";

exports.getUsers = async (req, res) => {
    try {
        const data = await user.findAll({
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'password']
            }
        });
        res.send({
            status: "success",
            data
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: "failed",
            message: "server error"
        })
    }
};

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = req.body;

        const schema = joi.object({
            name: joi.string().min(3).required(),
            email: joi.string().email().min(6).max(50).required(),
            password: joi.string().min(4).required(),
            role: joi.required()
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).send({
                status: "Validation Failed",
                message: error.details[0].message,
            });
        }

        const checkEmail = await user.findOne({
            where: {
                email
            }
        });

        if (checkEmail) {
            return res.status(400).send({
                status: "Failed",
                message: "Email Already Registered"
            });
        }

        const hashStrength = 10;
        const hashedPassword = await bcrypt.hash(password, hashStrength);

        const userData = await user.create({
            ...data,
            password: hashedPassword
        });

        const token = jwt.sign({
            id: 1
        }, secretKey);

        res.send({
            status: "success",
            data: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                token
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: "failed",
            message: "server error"
        })
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const schema = joi.object({
            email: joi.string().email().min(6).max(50).required(),
            password: joi.string().min(4).required()
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).send({
                status: "Validation Failed",
                message: error.details[0].message,
            });
        }

        const checkEmail = await user.findOne({
            where: {
                email
            }
        });

        if (!checkEmail) {
            return res.status(404).send({
                status: "Failed",
                message: "Login failed"
            });
        };

        const isValidPass = await bcrypt.compare(password, checkEmail.password);

        if (!isValidPass) {
            return res.status(400).send({
                status: "Login Failed",
                message: "Email and password don't match"
            })
        };

        const token = jwt.sign({
            id: checkEmail.id
        }, secretKey);

        res.send({
            status: "Success",
            data: {
                user: {
                    id: checkEmail.id,
                    email: checkEmail.email,
                    name: checkEmail.name,
                    token
                }
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: "failed",
            message: "server error"
        })
    }
}