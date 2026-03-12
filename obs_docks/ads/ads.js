
export async function getAds(userId, apiClient) {
    try {

        const ads = await apiClient.channels.getAdSchedule(userId);

        return {
            ads
        };
        
    } catch (error) {
        // Falls die API einen Fehler wirft (z.B. 401 Unauthorized)
        console.log("Twitch API Fehler: " + error.message);
        return null;
    }
}

      // DER RETTER: Wir prüfen, ob 'ads' existiert UND 'nextAdAt' hat.
        // Wenn nicht, geben wir ein "leeres" aber gültiges Objekt zurück.
        // if (!ads || !ads.nextAdAt) {
        //     // Hier loggen wir es nur einmal, damit die Konsole nicht zugespamt wird
        //     return {
        //         nextAdAt: null,
        //         secondsUntilNext: 0,
        //         duration: 0,
        //         snoozeCount: 0,
        //         active: false // Wir merken uns: Gerade keine Daten da
        //     };
        // }

        // Nur wenn wir hier ankommen, ist 'ads.nextAdAt' sicher ein Datum!
        