export async function sendFollow(user, followerObject, event) {
    followerObject.response_text = followerObject.response_text.split("[viewer]").join(event.userDisplayName)
    followerObject.response_text = followerObject.response_text.split("[streamer]").join(event.broadcasterDisplayName)
    
    io.to(user.wsKeys.alertBoxKey).emit("new-follower", {
        viewer: event.userDisplayName,
        color: followerObject.color,
        volume: followerObject.volume,
        img: followerObject.imagePath,
        sound: followerObject.soundPath,
        text: followerObject.response_text
    })
}