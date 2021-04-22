const express = require("express");

const router = express.Router();

const { auhtenticated } = require('../middlewares/auth');

const { uploadFile } = require('../middlewares/uploadFile');

const { register, login } = require('../controllers/auth');
const { getUsers, updateUser } = require('../controllers/user');

router.post("/register", register);
router.post("/login", login);

router.get("/users", auhtenticated, getUsers);
router.patch("/user", auhtenticated, uploadFile("imageFile"), updateUser);

module.exports = router;