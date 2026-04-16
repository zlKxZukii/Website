import { ClientManager } from "../../twitch_bot/connectBot.js";
import { io } from "../../src/server.js";
import chalk from "chalk";

class AlertHandler {

    initAlerts(settings, textRaw, data) {
        const id = []
        let text = textRaw
        if (text.includes('[viewer]')) {
            if (settings.viewer.rainbow) {
                text = text.replaceAll('[viewer]', `<span style="font-size:${settings.size}px;" id="animationViewer" class="rainbow-liquid">${data.viewerName}</span>`)
                id.push('animationViewer')
            }
            else {
                text = text.replaceAll('[viewer]', `<span style="color:${settings.viewer.color}; font-size:${settings.size}px;" id="animationViewer" class="${settings.viewer.animation}">${data.viewerName}</span>`)
                id.push('animationViewer')
            }
        }
        if (text.includes('[streamer]')) {
            if (settings.streamer.rainbow) {
                text = text.replaceAll('[streamer]', `<span style="font-size:${settings.size}px;" id="animationStreamer" class="rainbow-liquid">${data.streamer}</span>`)
                id.push('animationStreamer')
            }
            else {
                text = text.replaceAll('[streamer]', `<span style="color:${settings.streamer.color}; font-size:${settings.size}px;" id="animationStreamer" class="${settings.streamer.animation}">${data.streamer}</span>`)
                id.push('animationStreamer')
            }
        }
        if (text.includes('[amount]')) {
            if (settings.amount.rainbow) {
                text = text.replaceAll('[amount]', `<span style="font-size:${settings.size}px;" id="animationAmount" class="rainbow-liquid">${data.amount}</span>`)
                id.push('animationAmount')
            }
            else {
                text = text.replaceAll('[amount]', `<span style="color:${settings.amount.color}; font-size:${settings.size}px;" id="animationAmount" class="${settings.amount.animation}">${data.amount}</span>`)
                id.push('animationAmount')
            }

        }
        if (text.includes('[tier]')) {
            if (settings.tier.rainbow) {
                text = text.replaceAll('[tier]', `<span style="font-size:${settings.size}px;" id="animationTier" class="rainbow-liquid">${data.tier}</span>`)
                id.push('animationTier')
            }
            else {
                text = text.replaceAll('[tier]', `<span style="color:${settings.tier.color}; font-size:${settings.size}px;" id="animationTier" class="${settings.tier.animation}">${data.tier}</span>`)
                id.push('animationTier')
            }
        }
        if (text.includes('[cumulativ]')) {
            if (settings.cumulativ.rainbow) {
                text = text.replaceAll('[cumulativ]', `<span style="font-size:${settings.size}px;" id="animationCumulativ" class="rainbow-liquid">${data.cumulativ}</span>`)
                id.push('animationCumulativ')
            }
            else {
                text = text.replaceAll('[cumulativ]', `<span style="color:${settings.cumulativ.color}; font-size:${settings.size}px;" id="animationCumulativ" class="${settings.cumulativ.animation}">${data.cumulativ}</span>`)
                id.push('animationCumulativ')
            }
        }
        if (text.includes('[post]')) {
            if (settings.post.rainbow) {
                text = text.replaceAll('[post]', `<span style="font-size:${settings.size}px;" id="animationPost" class="rainbow-liquid">${data.post}</span>`)
                id.push('animationPost')
            }
            else {
                text = text.replaceAll('[post]', `<span style="color:${settings.post.color}; font-size:${settings.size}px;" id="animationPost" class="${settings.post.animation}">${data.post}</span>`)
                id.push('animationPost')
            }
        }
        if (text.includes('[streak]')) {
            if (settings.streak.rainbow) {
                text = text.replaceAll('[streak]', `<span style="font-size:${settings.size}px;" id="animationStreak" class="rainbow-liquid">${data.streak}</span>`)
                id.push('animationStreak')
            }
            else {
                text = text.replaceAll('[streak]', `<span style="color:${settings.streak.color}; font-size:${settings.size}px;" id="animationStreak" class="${settings.streak.animation}">${data.streak}</span>`)
                id.push('animationStreak')
            }
        }
        if (text.includes('[bundle]')) {
            if (settings.bundle.rainbow) {
                text = text.replaceAll('[bundle]', `<span style="font-size:${settings.size}px;" id="animationBundle" class="rainbow-liquid">${data.bundle}</span>`)
                id.push('animationBundle')
            }
            else {
                text = text.replaceAll('[bundle]', `<span style="color:${settings.bundle.color}; font-size:${settings.size}px;" id="animationBundle" class="${settings.bundle.animation}">${data.bundle}</span>`)
                id.push('animationBundle')
            }
        }
        return { text, id }
    }

    testAlert(userId, type, username) {
        try {
            const user = ClientManager.getClient(userId);

            if (type === "Follower") {
                const { img, sound, settings } = user.alertBox[type]
                if (settings.state) {
                    const viewerName = 'zlScaletta';
                    const streamer = username;
                    const textRaw = settings.responseText
                    const { text, id } = this.initAlerts(settings, textRaw, { viewerName, streamer })
                    let decoration = null;
                    if (settings.decoration === 'normal') {
                        decoration = settings.decoration
                    }
                    Object.assign(user.alertQuery, {
                        [viewerName]: {
                            img,
                            sound,
                            layout: settings.layout,
                            volume: settings.volume,
                            duration: settings.duration,
                            text,
                            id,
                            color: settings.color,
                            family: settings.family,
                            size: settings.size,
                            decoration,
                            weight: settings.weight
                        }
                    });
                };
            }

            if (type === "Raids") {
                const amount = '23';
                const viewerName = 'zlScaletta';
                const streamer = username;
                const { img, sound, settings } = user.alertBox[type];
                if (settings.state) {
                    const textRaw = settings.responseText
                    const { text, id } = this.initAlerts(settings, textRaw, { viewerName, streamer, amount })
                    let decoration = null;
                    if (settings.decoration === 'normal') {
                        decoration = settings.decoration
                    }
                    Object.assign(user.alertQuery, {
                        [viewerName]: {
                            img,
                            sound,
                            layout: settings.layout,
                            volume: settings.volume,
                            duration: settings.duration,
                            text,
                            id,
                            color: settings.color,
                            family: settings.family,
                            size: settings.size,
                            decoration,
                            weight: settings.weight
                        }
                    });
                };
            };

            if (type === "Bits") {
                const amount = '100'
                const viewerName = 'zlScaletta';
                const streamer = username;
                const { img, sound, settings } = user.alertBox[type]
                if (settings.state) {
                    const textRaw = settings.responseText
                    const { text, id } = this.initAlerts(settings, textRaw, { viewerName, streamer, amount })
                    let decoration = null;
                    if (settings.decoration === 'normal') {
                        decoration = settings.decoration
                    }
                    Object.assign(user.alertQuery, {
                        [viewerName]: {
                            img,
                            sound,
                            layout: settings.layout,
                            volume: settings.volume,
                            duration: settings.duration,
                            text,
                            id,
                            color: settings.color,
                            family: settings.family,
                            size: settings.size,
                            decoration,
                            weight: settings.weight
                        }
                    });
                };
            };

            if (type === "Subscriber") {
                const tier = "1"
                const viewerName = 'zlScaletta';
                const streamer = username;
                const { img, sound, settings } = user.alertBox[type]
                if (settings.state) {
                    const textRaw = settings.responseText
                    const { text, id } = this.initAlerts(settings, textRaw, { viewerName, streamer, tier })
                    let decoration = null;
                    if (settings.decoration === 'normal') {
                        decoration = settings.decoration
                    }
                    Object.assign(user.alertQuery, {
                        [viewerName]: {
                            img,
                            sound,
                            layout: settings.layout,
                            volume: settings.volume,
                            duration: settings.duration,
                            text,
                            id,
                            color: settings.color,
                            family: settings.family,
                            size: settings.size,
                            decoration,
                            weight: settings.weight
                        }
                    });
                };
            }

            if (type === "Subscriber Geschenke") {
                const tier = "1"
                const amount = '20'
                const viewerName = 'zlScaletta';
                const streamer = username;
                const cumulativ = '30'
                const { img, sound, settings } = user.alertBox[type]
                if (settings.state) {
                    const textRaw = settings.responseText
                    const { text, id } = this.initAlerts(settings, textRaw, { viewerName, streamer, tier, amount, cumulativ })
                    let decoration = null;
                    if (settings.decoration === 'normal') {
                        decoration = settings.decoration
                    }
                    Object.assign(user.alertQuery, {
                        [viewerName]: {
                            img,
                            sound,
                            layout: settings.layout,
                            volume: settings.volume,
                            duration: settings.duration,
                            text,
                            id,
                            color: settings.color,
                            family: settings.family,
                            size: settings.size,
                            decoration,
                            weight: settings.weight
                        }
                    });
                };
            };

            if (type === "Fortlaufende Subscriber") {
                const viewerName = 'zlScaletta';
                const streamer = username;
                const tier = "1"
                const post = "Hier kommt mein Sub!"
                const bundle = '20'
                const streak = '10'
                const cumulativ = '30'
                const { img, sound, settings } = user.alertBox[type]
                if (settings.state) {
                    const textRaw = settings.responseText
                    const { text, id } = this.initAlerts(settings, textRaw, { viewerName, streamer, tier, cumulativ, post, streak, bundle })
                    let decoration = null;
                    if (settings.decoration === 'normal') {
                        decoration = settings.decoration
                    }
                    Object.assign(user.alertQuery, {
                        [viewerName]: {
                            img,
                            sound,
                            layout: settings.layout,
                            volume: settings.volume,
                            duration: settings.duration,
                            text,
                            id,
                            color: settings.color,
                            family: settings.family,
                            size: settings.size,
                            decoration,
                            weight: settings.weight
                        }
                    });
                };
            };

            if (user.alertIsActive === false) {
                user.alertIsActive = true;
                this.sendAlert(user);
            };
        } catch (error) {
            console.log("klappt nicht der test von den Alerts: " + error);
        };
    };

    saveShoutout(client, response) {
        client.isShoutout = false;
        io.to(client.wsKeys.alertBoxKey).emit('new-alert', response)
        setTimeout(() => {
            client.isShoutout = true
        }, response.duration * 1000 + 10000);
    }

    saveAlert(userId, event, type) {
        try {
            const user = ClientManager.getClient(userId);
            if (type === "Follower") {
                const viewerName = event.userDisplayName;
                const streamer = event.broadcasterDisplayName;
                const { img, sound, settings } = user.alertBox[type]
                if (settings.state) {
                    const textRaw = settings.responseText
                    const { text, id } = this.initAlerts(settings, textRaw, { viewerName, streamer })
                    let decoration = null;
                    if (settings.decoration === 'normal') {
                        decoration = settings.decoration
                    }
                    Object.assign(user.alertQuery, {
                        [viewerName]: {
                            img,
                            sound,
                            layout: settings.layout,
                            volume: settings.volume,
                            duration: settings.duration,
                            text,
                            id,
                            color: settings.color,
                            family: settings.family,
                            size: settings.size,
                            decoration,
                            weight: settings.weight
                        }
                    });
                };
            };

            if (type === "Raids") {
                const amount = event.viewers;
                const viewerName = event.raidingBroadcasterDisplayName;
                const streamer = event.raidedBroadcasterDisplayName;
                const { img, sound, settings } = user.alertBox[type]
                if (settings.state) {
                    const textRaw = settings.responseText
                    const { text, id } = this.initAlerts(settings, textRaw, { viewerName, streamer, amount })
                    let decoration = null;
                    if (settings.decoration === 'normal') {
                        decoration = settings.decoration
                    }
                    Object.assign(user.alertQuery, {
                        [viewerName]: {
                            img,
                            sound,
                            layout: settings.layout,
                            volume: settings.volume,
                            duration: settings.duration,
                            text,
                            id,
                            color: settings.color,
                            family: settings.family,
                            size: settings.size,
                            decoration,
                            weight: settings.weight
                        }
                    });
                };
            };

            if (type === "Bits") {
                const viewerName = event.userDisplayName;
                const amount = event.bits;
                const streamer = event.broadcasterDisplayName;
                const { img, sound, settings } = user.alertBox[type]
                if (settings.state) {
                    const textRaw = settings.responseText
                    const { text, id } = this.initAlerts(settings, textRaw, { viewerName, streamer, amount })
                    let decoration = null;
                    if (settings.decoration === 'normal') {
                        decoration = settings.decoration
                    }
                    Object.assign(user.alertQuery, {
                        [viewerName]: {
                            img,
                            sound,
                            layout: settings.layout,
                            volume: settings.volume,
                            duration: settings.duration,
                            text,
                            id,
                            color: settings.color,
                            family: settings.family,
                            size: settings.size,
                            decoration,
                            weight: settings.weight
                        }
                    });
                };
            };

            if (type === "Subscriber") {
                const tier = event.tier
                const viewerName = event.userDisplayName;
                const streamer = event.broadcasterDisplayNam;
                if (settings.state) {
                    const textRaw = settings.responseText
                    const { text, id } = this.initAlerts(settings, textRaw, { viewerName, streamer, tier })
                    let decoration = null;
                    if (settings.decoration === 'normal') {
                        decoration = settings.decoration
                    }
                    Object.assign(user.alertQuery, {
                        [viewerName]: {
                            img,
                            sound,
                            layout: settings.layout,
                            volume: settings.volume,
                            duration: settings.duration,
                            text,
                            id,
                            color: settings.color,
                            family: settings.family,
                            size: settings.size,
                            decoration,
                            weight: settings.weight
                        }
                    });
                };
            };

            if (type === "Subscriber Geschenke") {
                const tier = event.tier;
                const amount = event.amount;
                const viewerName = event.gifterDisplayName
                const streamer = event.broadcasterDisplayName
                const cumulativ = event.cumulativeAmount;
                const { img, sound, settings } = user.alertBox[type]
                if (settings.state) {
                    const textRaw = settings.responseText
                    const { text, id } = this.initAlerts(settings, textRaw, { viewerName, streamer, tier, cumulativ, amount })
                    let decoration = null;
                    if (settings.decoration === 'normal') {
                        decoration = settings.decoration
                    }
                    Object.assign(user.alertQuery, {
                        [viewerName]: {
                            img,
                            sound,
                            layout: settings.layout,
                            volume: settings.volume,
                            duration: settings.duration,
                            text,
                            id,
                            color: settings.color,
                            family: settings.family,
                            size: settings.size,
                            decoration,
                            weight: settings.weight
                        }
                    });
                };
            };

            if (type === "Fortlaufende Subscriber") {
                const viewerName = event.userDisplayName;
                const streamer = event.broadcasterDisplayName;
                const tier = event.tier;
                const post = event.messageText;
                const bundle = event.durationMonths;
                const streak = event.streakMonths;
                const cumulativ = event.cumulativeMonths;
                const { img, sound, settings } = user.alertBox[type]
                if (settings.state) {
                    const textRaw = settings.responseText
                    const { text, id } = this.initAlerts(settings, textRaw, { viewerName, streamer, tier, cumulativ, post, streak, bundle })
                    let decoration = null;
                    if (settings.decoration === 'normal') {
                        decoration = settings.decoration
                    }
                    Object.assign(user.alertQuery, {
                        [viewerName]: {
                            img,
                            sound,
                            layout: settings.layout,
                            volume: settings.volume,
                            duration: settings.duration,
                            text,
                            id,
                            color: settings.color,
                            family: settings.family,
                            size: settings.size,
                            decoration,
                            weight: settings.weight
                        }
                    });
                };
            };

            if (user.alertIsActive === false) {
                user.alertIsActive = true;
                this.sendAlert(user);
            };
        } catch (error) {
            console.log(chalk.red("Fehler im speichern: " + error));
        };
    };

    async sendAlert(user) {
        let keys = Object.keys(user.alertQuery);
        const delay = (ms) => new Promise(res => setTimeout(res, ms));
        try {
            while (keys.length !== 0) {

                if (user.isShoutout === false) {
                    while (true) {
                        await delay(3000)
                        if (user.isShoutout) { break }
                    }
                }
                // kommt direkt aus dem chatClient
                const { color, img, sound, layout, volume, duration, text, id, family, size, decoration, weight } = user.alertQuery[keys[0]];

                let align = 'inner';

                if (layout === 'left') {
                    align = "left"
                }
                else if (layout === 'right') {
                    align = "right"
                }
                else if (layout === 'top') {
                    align = "top"
                }
                else if (layout === 'bottom') {
                    align = "bottom"
                }

                const obj = {
                    color,
                    img,
                    sound,
                    align,
                    volume,
                    duration,
                    text,
                    id,
                    family,
                    size: size + 'px',
                    decoration,
                    weight
                };

                io.to(user.wsKeys.alertBoxKey).emit("new-alert", obj);
                await delay(user.alertQuery[keys[0]].duration * 1000 + 1000);
                delete user.alertQuery[keys[0]];
                keys = Object.keys(user.alertQuery);
            };
        } catch (error) {
            console.log(chalk.red("Fehler in der Ausgabe: " + error));
        }
        finally {
            user.alertIsActive = false;
        };
    };
};

export const Alerts = new AlertHandler();