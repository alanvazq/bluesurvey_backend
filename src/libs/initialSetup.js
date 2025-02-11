const Role = require('../models/role');
const User = require('../models/user');

const createRoles = async () => {

    try {

        const count = await Role.estimatedDocumentCount()

        if (count > 0) return;

        const values = await Promise.all([

            new Role({ name: 'user' }).save(),
            new Role({ name: 'admin' }).save(),

        ]);

        if (values) {
            const role = await Role.findOne({ name: 'admin' })

            const newAdmin = new User({
                name: process.env.ADMIN_NAME,
                email: process.env.ADMIN_EMAIL,
                password: await User.encryptPassword(process.env.ADMIN_PASSWORD),
                roles: [role._id],
            });

            await newAdmin.save();
        }

    } catch (error) {
        console.log(error);
    }
}

module.exports = { createRoles }