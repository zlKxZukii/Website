export async function clip(channel, userID, apiClient, chatClient, duration, title) {
    let message = "";

    try {
        const clipObj = {
            channel: userID,
            createAfterDelay: true,
            duration: Number(duration),
        }
        if (title !== null) {
            Object.assign(clipObj, {title: title})
        }
        const clip = await apiClient.clips.createClip(clipObj)


        async function waitForClip() {

            while (true) {
                const clipT = await apiClient.clips.getClipById(clip)
                if (clipT === null) {
                    await new Promise(m => setTimeout(m, 500))
                }
                else {
                    message = `https://www.twitch.tv/${channel}/clip/` + clip
                    break
                }
            }
        } await waitForClip()

    } catch (error) {
        console.log(JSON.parse(error.body).message)
        message = JSON.parse(error.body).message
    }
    chatClient.say(channel, message)
}