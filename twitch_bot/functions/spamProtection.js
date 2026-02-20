export async function messageProtection(client, user, apiClient, message) {
    if (!client.spamBotProtection[user.userId]) {
        const time = await getTime(user.userId, apiClient)
        const whitelist = "p_papillon"
        Object.assign(client.spamBotProtection, { [user.userId]: { exists: time } })
        if (client.spamBotProtection[user.userId].exists <= 0 && user.displayName.toLowerCase() != whitelist) {
            await apiClient.moderation.banUser(client.userID, {
                reason: "SpamBotMessage",
                user: user.userId
            })
            await apiClient.users.createBlock(client.userID, user.userId, "SpamBot")
        }
    }
}

export async function followProtection(client, user, userID) {
    if (!client.spamBotProtection[user.userId]) {
        const time = await getTime(user.userId, client.apiClient)
        Object.assign(client.spamBotProtection, { [user.userId]: { exists: time } })
        const whitelist = "p_papillon"
        if (client.spamBotProtection[user.userId].exists <= 0 && user.userDisplayName.toLowerCase() != whitelist) {
            await client.apiClient.moderation.banUser(userID, {
                reason: "SpamBotFollow",
                user: user.userId
            })
            await client.apiClient.users.createBlock(userID, user.userId, "SpamBot")
            console.log(`${user.userDisplayName} geblockt`)
        }
    }
}

async function getTime(userId, apiClient) {
    const user = await apiClient.users.getUserById(userId);
    if (!user) return 999
    const createdAt = user.creationDate.getTime();
    const now = Date.now();
    return Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
}