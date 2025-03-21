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

    } catch (error) {
        console.log(error);
    }
}

module.exports = { createRoles }