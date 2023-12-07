import {app, BrowserWindow, dialog, MenuItemConstructorOptions, nativeTheme} from 'electron'
import configModel from "../public/configModel";
import path from "path";
import {ConfigFactory, ConfigUpdate} from "../public/config";
import {autoUpdater} from "electron-updater";
import logger from "electron-log";

let PromptWin: BrowserWindow | null = null;
let ControlCenterWin: BrowserWindow | null = null;

export default function createMenu(config: configModel) {

    // theme: light=0, dark=1, system=2
    let theme: number = 2;
    switch (config.theme){
        case 'light':
            nativeTheme.themeSource = 'light';
            theme = 0;
            break;
        case 'dark':
            nativeTheme.themeSource = 'dark';
            theme = 1;
            break;
        case 'system':
            nativeTheme.themeSource = 'system';
            theme = 2;
            break;
    }

    const menuTemplate: Array<MenuItemConstructorOptions> = [{
            label: 'Bard',
            submenu: [
                {
                    label: 'About Bard', click: () => {
                        dialog.showMessageBox({
                            icon: 'public/logo.png',
                            title: 'About Bard',
                            // package.json version
                            message: `Version ${app.getVersion()}`,
                            detail: 'Bard is a desktop app for the Bard chatbot.',
                            buttons: ['OK']
                        });
                    }
                },
                {label: 'Check for Updates', click: () => {autoUpdater.checkForUpdates().then(r => logger.info(r)).catch(e => logger.error(e))},
                },
                {role: 'minimize', label: 'Hide', accelerator: 'ctrl+H'},
                {type: 'separator'},
                {role: 'quit', label: 'Quit', accelerator: 'ctrl+W'}
            ]
        }, {
            label: 'Preferences',
            submenu: [
                {
                    label: 'Prompt',
                    accelerator: 'ctrl+O',
                    click: () => {
                        if (PromptWin) {
                            PromptWin.focus();
                            return;
                        }
                        // Create the browser window.
                        PromptWin = new BrowserWindow({
                            title: 'Prompt Center',
                            width: 800,
                            height: 600,
                            icon: "public/logo.png",
                            modal: true,
                            center: true,
                            parent: BrowserWindow.getFocusedWindow(),
                            webPreferences: {
                                nodeIntegration: true,
                                nodeIntegrationInWorker: true,
                                webSecurity: false,
                                preload: path.join(__dirname, '../electron/preload.js'),
                            },
                            titleBarStyle: 'hidden',
                            titleBarOverlay: {
                                color: '#000000',
                                symbolColor: '#74b1be',
                                height: 30,
                            }
                        })
                        if (app.isPackaged) {
                            PromptWin.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'prompt' })
                        } else {
                            PromptWin.loadURL('http://localhost:5173/#/prompt')
                        }
                        // Emitted when the window is closed.
                        PromptWin.on('closed', () => {
                            PromptWin = null
                        })
                    }
                },{
                    label: 'Control Center',
                    accelerator: 'ctrl+shift+P',
                    click: () => {
                        // exist
                        if (ControlCenterWin) {
                            ControlCenterWin.focus();
                            return;
                        }
                        // Create the browser window.
                        ControlCenterWin = new BrowserWindow({
                            title: 'Control Center',
                            width: 1000,
                            height: 650,
                            resizable: false,
                            icon: "public/logo.png",
                            modal: true,
                            center: true,
                            parent: BrowserWindow.getFocusedWindow(),
                            webPreferences: {
                                nodeIntegration: true,
                                nodeIntegrationInWorker: true,
                                webSecurity: false,
                                preload: path.join(__dirname, '../electron/preload.js')
                            },
                        })
                        if (app.isPackaged) {
                            ControlCenterWin.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'controlCenter' })
                        } else {
                            ControlCenterWin.loadURL('http://localhost:5173/#/controlCenter')
                        }
                        // Emitted when the window is closed.
                        ControlCenterWin.on('closed', () => {
                            ControlCenterWin = null
                        })
                    }
                },
                    {type: 'separator'},
                    {
                        label: 'Stay On Top', type: 'checkbox', checked: config.stay_on_top, click: () => {
                            let con = ConfigFactory();
                            con.stay_on_top = !con.stay_on_top;
                            ConfigUpdate(con);
                            const win = BrowserWindow.getFocusedWindow()
                            if (win) {
                                win.setAlwaysOnTop(con.stay_on_top);
                            }
                        }, accelerator: 'ctrl+T'
                    },
                    {
                        label: 'Theme', submenu: [
                            {label: 'Light', type: 'radio', checked: theme == 0,click: () => {
                                    let con = ConfigFactory();
                                    con.theme = 'light';
                                    ConfigUpdate(con);
                                    nativeTheme.themeSource = 'light';
                                }},
                            {label: 'Dark', type: 'radio', checked: theme == 1, click: () => {
                                    let con = ConfigFactory();
                                    con.theme = 'dark';
                                    ConfigUpdate(con);
                                    nativeTheme.themeSource = 'dark';
                                }},
                            {label: 'System', type: 'radio', checked: theme == 2, click: () => {
                                    let con = ConfigFactory();
                                    con.theme = 'system';
                                    ConfigUpdate(con);
                                    nativeTheme.themeSource = 'system';
                                }},
                        ]
                    },]
        }, {
            label: 'Window',
            submenu: [
                {role: 'minimize'},
                {role: 'togglefullscreen'}
            ]
        }, {
            label: 'Edit',
            submenu: [
                {role: 'undo'},
                {role: 'redo'},
                {type: 'separator'},
                {role: 'copy'},
                {role: 'paste'},
                {type: 'separator'},
                {role: 'selectAll'},
            ]
        }, {
            label: 'View',
            submenu: [
                {role: 'reload'},
                {role: 'forceReload'},
                {type: 'separator'},
                {role: 'resetZoom'},
                {role: 'zoomIn'},
                {role: 'zoomOut'},
            ]
        }, {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        const {shell} = require('electron')
                        await shell.openExternal('https://github.com/Karenina-na/Bard-Desktop')
                    }
                },
                {
                    label: 'About Author',
                    click: async () => {
                        const {shell} = require('electron')
                        await shell.openExternal('https://github.com/Karenina-na')
                    }
                },
                {type: 'separator'},
                {label: 'Toggle Dev Tools', accelerator: 'ctrl+shift+I', click: () => {
                        const win = BrowserWindow.getFocusedWindow()
                        if (win) {
                            win.webContents.openDevTools({ mode: 'detach'});
                        }
                    }
                },
            ]
        }
    ]

    return menuTemplate;
}