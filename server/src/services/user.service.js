
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

async function searchUsers(query, currentUserId) {
    return prisma.user.findMany({
        where: {
            AND: [
                {
                    id: {
                        not: currentUserId
                    }
                },
                {
                    OR: [
                        {
                            username: {
                                contains: query,
                                mode: "insensitive"
                            }
                        },
                        {
                            displayName: {
                                contains: query,
                                mode: "insensitive"
                            }
                        }
                    ]
                }
            ]
        },
        select: {
            id: true,
            username: true,
            displayName: true,
            bio: true,
            avatarUrl: true
        },
        orderBy: {
            username: "asc"
        },
        take: 20
    });
}

module.exports = {
    updateUserProfile,
    searchUsers
};
