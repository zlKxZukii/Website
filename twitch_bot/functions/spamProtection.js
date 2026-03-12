import chalk from "chalk"

const blackList = [
        "bigfollows",
        "cloutboost", 
        "buyviewers", 
        "getviewers",
        "follower-shop", 
        "v5shop", 
        "twitch-viewers", 
        "social-boost",
        "streamboo",

        // --- Typische Bot-Sprüche (Deutsch/Englisch) ---
        "wanna become famous", 
        "want to become famous", 
        "best viewers and followers",
        "become famous", 
        "get followers", 
        "top viewers", 
        "cheap viewers",
        "werde berühmt", 
        "zuschauer kaufen",
        "günstige follower",

        // --- Krypto / Scam / Casino ---
        "free gift cards", 
        "win a prize", 
        "free nitro", 
        "crypto exploit",
        "casino bonus", 
        "stake code"];

export async function messageProtection(client, user, apiClient, message) {
    if (!client.spamBotProtection[user.userId]) {
        const time = await getDays(user.userId, apiClient);
        Object.assign(client.spamBotProtection, { [user.userId]: { exists: time } });
        console.log(containsText(message))
        console.log(client.spamBotProtection[user.userId].exists)
        if (client.spamBotProtection[user.userId].exists <= 7 && containsText(message)) {

            await apiClient.moderation.banUser(client.userId, {
                reason: "SpamBotMessage",
                user: user.userId
            });

            await apiClient.users.createBlock(client.userID, user.userId, "SpamBot");
        };
    };
};

function containsText(message) {
    const lowerMessage = message.toLowerCase();

    const hasBlackListWords = blackList.some(word => lowerMessage.includes(word));
    if (hasBlackListWords) return true;

    const regex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-0]+\s?\.\s?(com|net|org|de|me|gg|tv|tk|info|xyz|live|shop)\b)/gi;
    if (regex.test(lowerMessage)) return true;

    return false;
}

export async function followProtection(client, user, userID) {
    if (!client.spamBotProtection[user.userId]) {

        const time = await getDays(user.userId, client.apiClient)

        Object.assign(client.spamBotProtection, { [user.userId]: { exists: time } })

        if (client.spamBotProtection[user.userId].exists <= 7 && containsText(message)) {

            await client.apiClient.moderation.banUser(userID, {

                reason: "SpamBotFollow",

                user: user.userId

            })

            await client.apiClient.users.createBlock(userID, user.userId, "SpamBot")

            console.log(`${user.userDisplayName} geblockt`)
        }
    }
}

async function getDays(userId, apiClient) {
    try {
        const user = await apiClient.users.getUserById(userId);
        if (!user) return 0;
        const createdAt = user.creationDate.getTime();
        const now = Date.now();
        return Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    } catch (error) {
        chalk.red("Konnte Tage von", userId, " nicht abrufen!");
        return 0;
    };
};