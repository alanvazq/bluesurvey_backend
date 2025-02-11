const getUserInfo = (user) => {
    return {
        name: user.name,
        email: user.email,
        id: user.id
    }
}

module.exports = getUserInfo;