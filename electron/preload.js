// load node.js modules in the renderer process
window.addEventListener('DOMContentLoaded', () => {
    // console.log('DOMContentLoaded')

    const { contextBridge, ipcRenderer } = require('electron')

    contextBridge.exposeInMainWorld('electronAPI', {
        quit: () => ipcRenderer.send('quit'),
        getConfigPath: () => ipcRenderer.invoke('getConfigPath'),
        getConfig: () => ipcRenderer.invoke('getConfig'),
        openConfig: () => ipcRenderer.send('openConfig'),
        updateConfig: (config) => ipcRenderer.invoke('updateConfig', config),
        resetConfig: () => ipcRenderer.invoke('resetConfig'),
    })
})