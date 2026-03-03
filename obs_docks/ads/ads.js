export async function getAds(userId, apiClient) {
    try {
        const ads = await apiClient.channels.getAdSchedule(userId);
        
        // DER RETTER: Wir prüfen, ob 'ads' existiert UND 'nextAdAt' hat.
        // Wenn nicht, geben wir ein "leeres" aber gültiges Objekt zurück.
        if (!ads || !ads.nextAdAt) {
            // Hier loggen wir es nur einmal, damit die Konsole nicht zugespamt wird
            return {
                nextAdAt: null,
                secondsUntilNext: 0,
                duration: 0,
                snoozeCount: 0,
                active: false // Wir merken uns: Gerade keine Daten da
            };
        }

        // Nur wenn wir hier ankommen, ist 'ads.nextAdAt' sicher ein Datum!
        return {
            nextAdAt: ads.nextAdAt,
            secondsUntilNext: Math.max(0, Math.floor((ads.nextAdAt.getTime() - Date.now()) / 1000)),
            duration: ads.duration,
            snoozeCount: ads.snoozeCount,
            active: true
        };

    } catch (error) {
        // Falls die API einen Fehler wirft (z.B. 401 Unauthorized)
        console.log("Twitch API Fehler: " + error.message);
        return null;
    }
}