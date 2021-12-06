// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, dialog, nativeTheme } = require('electron')

var sqlite3 = require('sqlite3').verbose();
var path =require('path')

app.commandLine.appendSwitch("disable-http-cache");

var mainWindow = null;

const currentVersion = "1.0.0";


const gotTheLock = app.requestSingleInstanceLock()


var UIDB = require('./lib/ui_db.js')


//FORCE SINGLE INSTANCE
if (!gotTheLock) {
    app.quit()
}
else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', createWindow)

    // Quit when all windows are closed.
    app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
}

function createWindow() {
    // Create the browser window.

    if (process.platform === 'win32') {
        mainWindow = new BrowserWindow({
            width: 1280,
            height: 720,
            frame: false,
            minWidth: 920,
            minHeight: 500,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                worldSafeExecuteJavaScript: true,
				contextIsolation: false
            },
            icon: __dirname + '/res/logo.png',
            show: false,
            title: 'bag viewer'
        })
    }
    else if (process.platform === 'linux') {
        mainWindow = new BrowserWindow({
            width: 1280,
            height: 720,
            frame: true,
            minWidth: 920,
            minHeight: 500,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                worldSafeExecuteJavaScript: true,
				contextIsolation: false
            },
            icon: __dirname + '/icons/64x64.png',
            show: false,
            title: 'bag viewer'
        })
    }
    else if (process.platform === 'darwin') {
        mainWindow = new BrowserWindow({
            width: 1280,
            height: 720,
            frame: true,
            minWidth: 920,
            minHeight: 500,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                worldSafeExecuteJavaScript: true,
				contextIsolation: false
            },
            icon: __dirname + '/icons/icon.icns',
            show: false,
            title: 'bag viewer'
        })
    }

    mainWindow.webContents.once('dom-ready', () => {
        mainWindow.show();
    
        try {

        }
        catch (err) {
            errorPoup('Failed to check for updates', err.toString());
        }

    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')
}

// const PythonShell = require('python-shell').PythonShell;
// function syncData() {
    
//     var pyshell = new PythonShell('script/sync.py');
    
//     pyshell.on('message', function (message) {
//         // received a message sent from the Python script (a simple "print" statement)
//         console.log(message);
//     });
//     // end the input stream and allow the process to exit
//     pyshell.end(function (err, code, signal) {
//         if (err) throw err;
//         console.log('The exit code was: ' + code);
//         console.log('The exit signal was: ' + signal);
//         console.log('finished');
//     });
// }

//syncData();

//var queryNodes = {};
//var listDisplayNodes = {};
//UIDB.initQueryFromUIDB(path.join(__dirname, "bag_viewer_ui.db"), queryNodes);
//UIDB.initListDisplayFromUIDB(path.join(__dirname, "bag_viewer_ui.db"), listDisplayNodes);

//UIDB.loadUITree(path.join(__dirname, "bag_viewer_ui.db"), function (root) {
   
//})
var listDisplayNodes = {1 : []}

UIDB.loadListRecordDefines(path.join(__dirname, "bag_viewer_ui.db"), listDisplayNodes, function () {
      
});