const prisma = require("../config/prisma");

async function updateUserProfile(userId, profileData) {
    return prisma.user.update({
        where: {
            id: userId
        },
        data: profileData,
        select: {
            id: true,
            username: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true
        }
    });
}

module.exports = {
    updateUserProfile
};