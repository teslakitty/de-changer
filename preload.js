const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('deAPI', {
    getDesktopEnvironmentsStatus: () => ipcRenderer.invoke('get-desktop-environments-status'),
});