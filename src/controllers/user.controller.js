const User = require('../models/user');
const { generateAccessToken, generateRefreshToken } = require('../auth/generateToken');
const Role = require('../models/role');
const getUserInfo = require("../libs/getUserInfo");
const getTokenFromHeader = require('../auth/getTokenFromHeader');
const token = require('../models/token');
const { verifyRefreshToken } = require('../auth/verifyToken');
const { cleanData } = require('../libs/cleanData');

const signUp = async (req, res) => {

    const { name, email, password } = cleanData(req.body);
    if (!!!name || !!!email || !!!password) {
        return res.status(400).json({
            error: 'Todos los campos son requeridos'
        });
    }
    try {
        const user = new User();
        const exists = await user.userExist(email);

        if (exists) {
            return res.status(400).json(
                { error: 'El usuario ya existe' }
            )
        }

        const role = await Role.findOne({ name: 'user' })
        const newUser = new User({ name, email, password: await User.encryptPassword(password), roles: [role._id] });

        await newUser.save();
        res.status(201).json({
            message: 'Usuario creado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error al crear el usuario'
        });
    }
}

const signIn = async (req, res) => {
    const { email, password } = cleanData(req.body);

    if (!!!email || !!!password) {
        return res.status(400).json({
            error: 'Todos los campos son requeridos'
        })
    }

    try {
        const user = await User.findOne({ email }).populate('roles');

        if (user) {

            const correctPassword = await User.comparePassword(password, user.password)

            if (correctPassword) {

                const accessToken = user.createAccessToken();
                const refreshToken = await user.createRefreshToken();

                res.status(200).json({ user: getUserInfo(user), accessToken, refreshToken });

            } else {
                res.status(401).json({
                    error: 'Correo o contraseña incorrecto'
                });
            }

        } else {
            res.status(404).json({
                error: 'Usuario no econtrado'
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión' })
    }
}

const getUser = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener datos'
        })
    }
}

const getAllUsers = async (req, res) => {
    try {

        const users = await User.find();

        if (!users) {
            res.status(404).json({
                error: 'No se encontraron usuarios registrados'
            })
        }

        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener datos'
        })
    }
}

const refreshToken = async (req, res) => {
    const refreshToken = getTokenFromHeader(req.headers);
    if (refreshToken) {
        try {
            const found = await token.findOne({ token: refreshToken });
            if (!found) return res.status(401).json({ error: 'No autorizado' })

            const payload = verifyRefreshToken(found.token);

            if (payload) {
                const accessToken = generateAccessToken(payload.user);
                return res.status(200).json({ accessToken });
            } else {
                return res.status(401).json({ error: 'No autorizado' })
            }

        } catch (error) {
            console.log(error)
            return res.status(401).json({ error: 'No autorizado' })
        }

    } else {
        res.status(401).json({ error: "No autorizado" })
    }
}

const signOut = async (req, res) => {
    try {
        const refreshToken = getTokenFromHeader(req.headers);
        if (refreshToken) {
            await token.findOneAndRemove({ token: refreshToken })
            res.status(200).json({ message: "Token eliminado" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error en el servidor" })
    }
}

const createAdmin = async (req, res) => {
    const { name, email, password, secretKey } = cleanData(req.body);
    if (!name || !email || !password || !secretKey) return res.status(400).json({ error: "Todos los campos son requeridos" })

    if (secretKey !== process.env.ADMIN_SECRET_KEY) return res.status(401).json({ error: "No autorizado" })

    try {
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) return res.status(400).json({ error: "El admin ya existe" });

        const role = await Role.findOne({ name: 'admin' })
        const newAdmin = new User({ name, email, password: await User.encryptPassword(password), roles: [role._id] });

        await newAdmin.save();
        res.status(201).json({ message: 'Admin registrado correctamente' });
    } catch (error) {
        res.status(500).json({
            error: 'Error al crear el usuario'
        });
    }
}

module.exports = { signUp, signIn, getUser, getAllUsers, refreshToken, signOut, createAdmin }