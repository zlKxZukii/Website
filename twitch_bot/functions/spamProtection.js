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
    "nezhna",

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
    "We specialize in promoting Twitch channels",
    "check out our website",

    // --- Krypto / Scam / Casino ---
    "free gift cards",
    "win a prize",
    "free nitro",
    "crypto exploit",
    "casino bonus",
    "stake code",
    "promoting"];

export async function messageProtection(client, user, apiClient, message) {
    if (!client.spamBotProtection[user.userId]) {
        const time = await getDays(user.userId, apiClient);
        Object.assign(client.spamBotProtection, { [user.userId]: { exists: time } });
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

export async function followProtection(client, userID, viewerId, viewerName) {
    // wenn der user nicht in der liste ist
    const list = client.spamBotProtection;
    const intervall = client.spamBotIntervall;
    if (!list[viewerId]) {
        const time = await getDays(viewerId, client.apiClient)
        Object.assign(list, { [viewerId]: { exists: time } })
        const amount = Object.keys(list).length

        if (intervall.timer) {
            clearTimeout(intervall.timer)
        }
        intervall.timer = setTimeout(() => {
            for (const key in list) {
                delete list[key]
            }
            delete intervall.timer;
        }, 60000);


        if (list[viewerId].exists <= 7 || amount >= 7 || list[viewerId].exists <= 7 && amount <= 7) {
            await client.apiClient.moderation.banUser(userID, {
                reason: "SpamBotFollow",
                user: viewerId
            })
            await client.apiClient.users.createBlock(userID, viewerId, "SpamBot")
            console.log(`${viewerName} geblockt`)
        }
        else {
            return true;
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