export async function clip(channel, userID, apiClient, chatClient) {
    let message = "";
    
    try {
        const clip = await apiClient.clips.createClip({
            channel: userID,
            createAfterDelay: true
        })

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
        message = JSON.parse(error.body).message
    }
    chatClient.say(channel, message)
}