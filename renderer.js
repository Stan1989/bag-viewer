'use strict';

const { remote, shell, ipcRenderer } = require('electron');
const fs = require('fs');
const customTitlebar = require('custom-electron-titlebar');
const defaultDataDir = remote.app.getPath("userData");
const contextMenu = require('electron-context-menu');
var path = require('path');
var UIDB = require('./lib/ui_db.js');
var LTT = require('list-to-tree');

var titlebar;
var normalMenu;

var sidebarWidth = 75;
var queryNodes = [{name: "null", sql: "null", count_sql: "null"}]
var listDisplayNodes = []
function init() {

    contextMenu({
        showSearchWithGoogle: false,
        showLookUpSelection: false
    });


    if (remote.process.platform === 'win32') {
        titlebar = new customTitlebar.Titlebar({
            backgroundColor: customTitlebar.Color.fromHex('#343A40'),
            unfocusEffect: true,
            icon: './res/logo.png'
        });


        document.getElementById('editorRibbon').style.marginTop = "40px";
    }

    normalMenu = new remote.Menu();
    normalMenu.append(new remote.MenuItem({
        label: 'File',
        submenu: [
            {
                label: 'Init Tree',
                accelerator: 'CmdOrCtrl+B',
                click: () => initUITreeDB()
            },
            {
                label: 'Show Tree',
                accelerator: 'CmdOrCtrl+O',
                click: () => loadUITree()
            },
            {
                type: 'separator'
            },
            {
                label: 'Exit',
                click: () => remote.app.exit()
            }
        ]
    }));

    normalMenu.append(new remote.MenuItem({
        label: 'View',
        submenu: [
            {
                label: 'Toggle Sidebar',
                accelerator: 'CmdOrCtrl+D',
                click: () => toggleSidebar(null)
            },
            {
                label: 'Reset Sidebar Width',
                click: () => resizeSidebar(sidebarWidth)
            }
        ]
    }));

    normalMenu.append(new remote.MenuItem({
        label: 'Help',
        submenu: [
            {
                label: 'Help',
                accelerator: 'F1',
                click: () => autoOpenHelpTab()
            },
            {
                label: 'About',
                click: () => openAboutPage()
            }
        ]
    }));


    remote.Menu.setApplicationMenu(normalMenu);
    if (remote.process.platform === 'win32') {
        titlebar.updateMenu(normalMenu);
    }

    addSidebarLinkEvents();

    applyModalEventHandlers();

    applyCtrlEventHandlers();

    window.addEventListener('resize', () => {
        // Sidebar behavior
        if (document.body.clientWidth <= (sidebarWidth + 810)) {
            document.getElementById('mainContainer').style.marginLeft = "0px";
            document.getElementById('editorRibbon').style.left = "0px";
            toggleSidebar(false);
        }
        else {
            document.getElementById('mainContainer').style.marginLeft = 'var(--sidebar-width)';
            document.getElementById('editorRibbon').style.left = 'var(--sidebar-width)';
            toggleSidebar(true);
        }
    });

    feather.replace();

    resizeSidebar(sidebarWidth);

    document.execCommand("enableObjectResizing", false, false);
    document.execCommand("enableInlineTableEditing", false, false);

    // Sidebar resizer events
    const sidebarResizer = document.getElementById('sidebarResizer');
    sidebarResizer.addEventListener('mousedown', (e) => {
        window.addEventListener('mousemove', handleSidebarResizerDrag, false);
        window.addEventListener('mouseup', () => {
            window.removeEventListener('mousemove', handleSidebarResizerDrag, false);
        }, false);
    });

    UIDB.initQueryFromUIDB(path.join(__dirname, "bag_viewer_ui.db"), queryNodes)
    UIDB.initListDisplayFromUIDB(path.join(__dirname, "bag_viewer_ui.db"), listDisplayNodes)
    loadUITree();

    var table = $('#table_id').DataTable();

    table.on('click', 'tbody tr', function () {
        $("#attachmentView").attr("src", "res/logo.png");
        var text = ""
        table.row(this).data().forEach(item => {text = text + item + "\r\n"})
        $("#eventContent").text(text);
    });
}

init();


function applyModalEventHandlers() {

    /*OPEN BCP MODAL */
    document.getElementById('openBCPForm').addEventListener('submit', (e) => {
        e.preventDefault();
        pickPath = document.getElementById("bcpFolder").value;
        alert(pickPath);
    });
}

function applyCtrlEventHandlers() {
    document.getElementById("bcpFolder").addEventListener("change", function (event) {

    }, false);

    document.getElementById("openBCPButton").addEventListener("click", function (event) {

        alert(pickPath);

    }, false);
}

function handleSidebarResizerDrag(event) {
    resizeSidebar(event.clientX);
}

/**
 * Iterates through sidebar links and tells them to become 'active' and load their content on click, and other events like onContextMenu.
 */
function addSidebarLinkEvents() {
    document.querySelectorAll('.my-sidebar-link').forEach(function (item) {
        item.addEventListener('click', () => {
            //change selected sidebar item

            document.querySelectorAll('.my-sidebar-link').forEach(function (item) {
                item.classList.toggle('active', false);
            });

            item.classList.toggle('active', true);

        })
    });

   
}


function toggleSidebar(value) {

    if (value != null) {
        if (value == true) {
            document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
            document.getElementById('sidebarToggler').setAttribute("flipped", "false");
            document.getElementById('sidebarResizer').style.display = "block";
            return;
        }
        else {
            document.documentElement.style.setProperty('--sidebar-width', `0px`);
            document.getElementById('sidebarToggler').setAttribute("flipped", "true");
            document.getElementById('sidebarResizer').style.display = "none";
            return;
        }
    }

    if (document.documentElement.style.getPropertyValue('--sidebar-width') == "0px") {
        document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
        document.getElementById('sidebarToggler').setAttribute("flipped", "false");
        document.getElementById('sidebarResizer').style.display = "block";
        return;
    }
    else {
        document.documentElement.style.setProperty('--sidebar-width', `0px`);
        document.getElementById('sidebarToggler').setAttribute("flipped", "true");
        document.getElementById('sidebarResizer').style.display = "none";
        return;
    }
}

function resizeSidebar(width) {

    if (width >= 50 && width <= 600) {
        sidebarWidth = width;
        //.sidebarWidth = sidebarWidth;

        if (document.documentElement.style.getPropertyValue('--sidebar-width') != "0px") {
            document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
        }
    }
}

function openAboutPage() {
    let about = new remote.BrowserWindow({
        width: 480,
        height: 360,
        resizable: false,
        icon: __dirname + '/res/logo.png',
        title: "About BagViewer",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: false,
            worldSafeExecuteJavaScript: true,
            contextIsolation: false
        },
        parent: remote.getCurrentWindow(),
        modal: true,
        show: false
    });
    about.once('ready-to-show', () => {
        about.show()
    })
    about.setMenu(null);
    about.loadFile('about.html');
}

function buildTreeData(curNode, data) {
    data.child.forEach(item => {
        var subNode = { name: item.name, param: item.param, query_id: item.query_id, record_id : item.record_id, children: [] }
        if (item.child) {
            buildTreeData(subNode, item);
        }
        curNode.children.push(subNode)
    });
}

function loadUIRecord(sql, listDisplayName) {
    UIDB.loadUIRecord(path.join(__dirname, "data.db"), sql, function (data) {
        var t = $('#table_id').DataTable();
        listDisplayName.forEach(element => {

        });
        t.clear().draw();
        data.forEach(element => {
            t.row.add([element.title, element.country, element.category, element.introduction, '']).draw(false);
        });


    });
}

function loadUITree() {
    UIDB.loadUITree(path.join(__dirname, "bag_viewer_ui.db"), function (data) {
        var root = {
            name: data[0].name,
            children: []
        };

        buildTreeData(root, data[0]);
        const tree = require('electron-tree-view')({
            root,
            container: document.querySelector('#ui_tree'),
            children: c => c.children,
            label: c => c.name
        })

        tree.on('selected', item => {
           
            var debug_log = "query_id = " + item.query_id + "; param = " + item.param
           
            queryNodes.forEach(item2 => {debug_log += item2.sql})
            $("#debug_log").text(debug_log);
            if(item.query_id > 0) {
                var index = item.query_id
                debug_log += "ttttttt"
                $("#debug_log").text(debug_log);
                debug_log += "..........." + queryNodes[index].sql
                $("#debug_log").text(debug_log);
                var sql = queryNodes[index].sql + " WHERE " + item.param
                debug_log += "; sql = " + sql
                $("#debug_log").text(debug_log);
                console.log(sql);
    
                loadUIRecord(sql, listDisplayNodes[item.record_id]);
                console.log('item selected')
            }
           
        })
    });
}

function initUITreeDB() {
    UIDB.resetUIDB(path.join(__dirname, "bag_viewer_ui.db"));
    UIDB.insertUITreeSampleData(path.join(__dirname, "bag_viewer_ui.db"));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Saves the content of the 'selected page' to that page's individual TXT file.
 */
function saveSelectedPage(showIndicator = false) {


}


/**
 * Shows the Home page and makes that sidebar link active.
 */
function showHomePage() {
    saveSelectedPage();
    document.getElementById('editorPage').style.display = "none";
    document.getElementById('settingsPage').style.display = "none";
    document.getElementById('homePage').style.display = "block";
    document.getElementById('helpPage').style.display = "none";
    //titlebar.updateTitle('Codex');
    selectedPage = null;

    remote.Menu.setApplicationMenu(normalMenu);
    if (remote.process.platform === 'win32') {
        titlebar.updateMenu(normalMenu);
    }
}


/**
 * Shows the Settings page and makes that sidebar link active.
 */
function showSettingsPage() {
    saveSelectedPage();
    document.getElementById('editorPage').style.display = "none";
    document.getElementById('homePage').style.display = "none";
    document.getElementById('settingsPage').style.display = "block";
    document.getElementById('helpPage').style.display = "none";
    //titlebar.updateTitle('Codex');
    selectedPage = null;

    remote.Menu.setApplicationMenu(normalMenu);
    if (remote.process.platform === 'win32') {
        titlebar.updateMenu(normalMenu);
    }

    document.getElementById("mainContainer").scrollTo(0, 0);
}


const PythonShell = require('python-shell').PythonShell;

function syncData() {
    var pyshell = new PythonShell('script/sync.py');
    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(message);
    });
    // end the input stream and allow the process to exit
    pyshell.end(function (err, code, signal) {
        if (err) throw err;
        console.log('The exit code was: ' + code);
        console.log('The exit signal was: ' + signal);
        console.log('finished');
    });
}

