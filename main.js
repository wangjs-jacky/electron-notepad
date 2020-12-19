const { app, BrowserWindow, Notification } = require('electron')
    // app 主管
    // BroserWindow 是待开发的游戏
const path = require('path')
const { ipcMain } = require('electron')
const fs = require('fs')

//用一个 Tray 来表示一个图标,这个图标处于正在运行的系统的通知区 ，通常被添加到一个 context menu 上.
const { Tray, Menu } = require('electron')

//托盘对象
var appTray = null;

// 全局变量
let win = null;

// 创建主窗口
function createWindow() {
    let win = new BrowserWindow({
        useContentSize: true,
        width: 430,
        height: 290,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
        autoHideMenuBar: true,
        icon: './assets/开心果.png',
        // title: '这里作用没有用，直接在html中的title中修改',
        // icon: './assets/lock.png',
        backgroundColor: '#000',
    })
    win.loadFile('index.html')
    win.on('minimize', function(event) {
        event.preventDefault();
        win.hide();
    })

    // 打开调试模式
    // win.webContents.openDevTools()

    //监听关闭事件， 把主窗口设置为null
    win.on('close', () => {
        win = null
    })

    var trayMenuTemplate = [{
        label: '设置',
        click: function() {
            win.show();
        }
    }, {
        label: '退出',
        click: function() {
            app.quit();
        }
    }]

    // 系统托盘图标目录
    trayIcon = path.join(__dirname, 'assets', '开心果.png');
    appTray = new Tray(trayIcon);
    //图标的上下文菜单
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    //设置此图标的上下文菜单
    appTray.setContextMenu(contextMenu);
    // 设置悬浮提醒内容
    appTray.setToolTip('加油!打工人')
    appTray.on('double-click', function() {
        win.show();
    })
}


function getData() {
    // 数据部分
    var p = new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'assets', 'data.json'), 'utf-8', (err, doc) => {
            if (err != null) {
                console.log('文件读取失败')
                return;
            }
            resolve(JSON.parse(doc))
            console.log(doc)
            console.log('=========doc-success========')
        })
    })
    return p
}

function sendDatato1(config) {
    var p = new Promise((resolve, reject) => {
        // 监听'dataRequest'事件，完成向render.js的数据传递
        ipcMain.on('dataRequest', (event) => {
            event.sender.send('dataExport', config)
            console.log('2-done')
            resolve(config)
        })
    })
}

// function getIdx(config) {
//     var p = new Promise((resolve, reject) => {

//         // 从render2.js中传递过来索引值
//         ipcMain.on('idxTomain', (event, arg) => {
//             console.log('get-index', arg)
//             var data = config[arg]
//             console.log('3-step:resolve:', data)
//             resolve(data)
//         })
//     })
//     p.then(function(data) {
//         console.log('4-step: receptData', data)

//         // 感觉监控打开了，就一直持续监听了，且是与render2.js的对话，且是持续作用的。
//         ipcMain.once('dataRequest2', (event) => {
//             // config是对象，所以可以使用[]取值操作
//             // event.sender.send('idxPass', config[arg])
//             event.sender.send('idxPass', data)
//             console.log('4-step:send-completed')
//         })
//     })
// }

// function sendIdx(data) {
//     console.log('4-step: receptData', data)

//     // 感觉监控打开了，就一直持续监听了，且是与render2.js的对话，且是持续作用的。
//     ipcMain.once('dataRequest2', (event) => {
//         // config是对象，所以可以使用[]取值操作
//         // event.sender.send('idxPass', config[arg])
//         event.sender.send('idxPass', data)
//         console.log('4-step:send-completed')
//     })

// }

getData().then(function(config) {
    console.log('2')
    sendDatato1(config)
}).then()


//1. 获取数据
//2. 数据传给render1.js
//3. 监听render1.js的操作，获取返回的id
//4. 再将从1返回的数据和id，传给render2.js


// 调用顺序
app.whenReady().then(createWindow)