const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { exec } = require('node:child_process');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 850,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// List of common DE meta-packages and their display names
// THIS IS THE UPDATED ARRAY
const DES_TO_CHECK = [
    { name: 'GNOME (Default)', package: 'ubuntu-desktop' },
    { name: 'KDE Plasma (Kubuntu Full)', package: 'kubuntu-desktop' },
    { name: 'KDE Plasma (Core)', package: 'plasma-desktop' }, // This is the one you need!
    { name: 'XFCE', package: 'xubuntu-desktop' },
    { name: 'LXQt', package: 'lubuntu-desktop' },
    { name: 'MATE', package: 'ubuntu-mate-desktop' },
    { name: 'Budgie', package: 'ubuntu-budgie-desktop' },
    { name: 'Cinnamon', package: 'cinnamon-desktop-environment' },
    { name: 'LXDE', package: 'lxde' },
];

ipcMain.handle('get-desktop-environments-status', async () => {
    const results = [];
    for (const de of DES_TO_CHECK) {
        try {
            const { stdout } = await new Promise((resolve, reject) => {
                exec(`dpkg -s ${de.package}`, (error, stdout, stderr) => {
                    if (error) {
                        // Package not found or not installed, dpkg -s returns non-zero exit code
                        resolve({ stdout: '' }); // Treat as not found/not installed
                    } else {
                        resolve({ stdout });
                    }
                });
            });

            const installed = stdout.includes('Status: install ok installed');
            results.push({
                displayName: de.name,
                packageName: de.package,
                installed: installed,
                installCommand: `sudo apt install ${de.package}`
            });
        } catch (error) {
            console.error(`Error checking package ${de.package}:`, error);
            results.push({
                displayName: de.name,
                packageName: de.package,
                installed: false,
                installCommand: `sudo apt install ${de.package} # Error checking status`
            });
        }
    }
    return results;
});