const { BrowserWindow } = require('electron').remote

// 功能1: 关闭弹窗提醒
$('#close').click(function() {
    var nwin = require('electron').remote.getCurrentWindow()
    nwin.close();
})