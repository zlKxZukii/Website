import chalk from "chalk"

export async function getAds(userId, apiClient) {
    try {
        const ads = await apiClient.channels.getAdSchedule(userId)
        console.log(ads)
        return {
            nextAdAt: ads.nextAdAt, // JS Date Objekt
            secondsUntilNext: Math.max(0, Math.floor((ads.nextAdAt.getTime() - Date.now()) / 1000)),
            duration: ads.duration,
            snoozeCount: ads.snoozeCount
        }
    } catch (error) {
        console.log(chalk.red("Konnte Werbung nicht abgreifen" + error.message))
    }
}