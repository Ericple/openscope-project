export const elementId = {
    RadarWindow: {
        Appbar: {
            Buttons: {
                connect: "button-connect",
                voiceSetting: "button-output",
                atisSetting: "button-atis",
                displaySetting: "button-display",
                runwaySetting: "button-runway",
                sectorSelect: "button-select-sector",
                setting: "button-setting",
                close: "button-close-app",
                maximizeOrRestore: "button-restore-app",
                minimize: "button-minimize-app",
                theme: "button-theme-toggle"
            },
            Tags: {
                currentCI: "appbar-connection-info",
                currentFrequency: "appbar-frequency",
                currentATIS: "appbar-atis-info",
                currentSector: "appbar-current-sector",
                currentTime: "appbar-utc-time",
                currentCoord: "appbar-coordinate"
            },
            Container: {
                metar: "app-bar"
            }
        },
        Canvas: {
            screen: "radar"
        },
        Footer: {
            channelChooser: "footer-channel-chooser",
            messageContainer: "footer-channel-message-container",
            toolbar: {
                messagebox: "tool-bar-messagebox"
            }
        },
        SubWin: {
            metar: "metarList"
        }
    }
}

export default elementId;