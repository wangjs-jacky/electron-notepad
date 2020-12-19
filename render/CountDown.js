// Windows模式下的底部弹窗式(感觉太low了)
// function showNotification() {
//     const notification = {
//         title: 'Basic Notification',
//         body: 'Notification from the CountDown.js process'
//     }
//     new Notification(notification).show()
// }
const { Notification } = require('electron').remote
const { BrowserWindow } = require('electron').remote
const { ipcRenderer } = require('electron')

// 全局变量设置
const sLeft_5min = 5 * 60;
const sLeft_10min = 10 * 60;
const sLeft_20min = 20 * 60;
const sLeft_30min = 30 * 60;
const sLeft_60min = 60 * 60;
const sLeft_120min = 120 * 60;
var sFuture = null;
var timer = null;
var audio = $('audio')[0];
var sLeft = null;

$(document).ready(function() {

    var p = new Promise((resolve, reject) => {
        ipcRenderer.on('setTime', (event, arg) => {
            resolve(arg);
        });
    })

    p.then((idButton) => {
        if (idButton == 0) {
            sLeft = sLeft_5min;
        } else if (idButton == 1) {
            sLeft = sLeft_10min;
        } else if (idButton == 2) {
            sLeft = sLeft_20min;
        } else if (idButton == 3) {
            sLeft = sLeft_30min;
        } else if (idButton == 4) {
            sLeft = sLeft_60min;
        }
        var oDiv = document.getElementById('div2');
        var oTime1 = document.getElementById('time1');
        var oTime2 = document.getElementById('time2');
        var oTime3 = document.getElementById('time3');
        var oTime4 = document.getElementById('time4');
        var oDiv2 = document.getElementById('deadline1');

        function showNotification() {
            let win = new BrowserWindow({
                frame: false,
                webPreferences: {
                    nodeIntegration: true,
                    enableRemoteModule: true,
                },
                autoHideMenuBar: true,
                backgroundColor: '#FFF',
                fullscreen: true,
                alwaysOnTop: true,
            })
            win.loadFile('./render/fullscreen.html');
            // win.webContents.openDevTools();
            win.on('close', () => {
                win = null
            });
        }

        function fnTimerLef2() {
            var iDays = parseInt(sLeft / 86400);

            var iHours = parseInt((sLeft % 86400) / 3600);

            var iMinutes = parseInt((sLeft % 86400) % 3600 / 60);

            var iSeconds = sLeft % 60;

            var sTr = iDays + '天' + iHours + '小时' + iMinutes + '分' + iSeconds + '秒'
            oTime1.innerHTML = iDays;
            oTime2.innerHTML = iHours;
            oTime3.innerHTML = iMinutes;
            oTime4.innerHTML = iSeconds;
            console.log(sTr)

            sLeft -= 1;
            if (sLeft == -1) {
                console.log('计时结束，触发底部弹窗提醒');
                showNotification();
            }
        }

        function startTimer() {
            // 计算预期到达时间
            nFuture = new Date().getTime() + sLeft_5min * 1000;
            oFuture = new Date(nFuture);

            // 提取年，月，日，小时，分钟
            var sFYear = oFuture.getUTCFullYear();
            var sFMonth = oFuture.getUTCMonth() + 1;
            var sFDate = oFuture.getUTCDate();
            var sFHour = oFuture.getHours();
            var sFMinute = oFuture.getMinutes();
            var sFSeconds = oFuture.getSeconds();

            // 显示在倒计时HTML页面上
            var sTr_deadline = sFYear + '-' + sFMonth + '-' + sFDate + '-' + sFHour + ':' + sFMinute + ':' + sFSeconds;
            oDiv2.innerHTML = sTr_deadline;

            // 开始计时
            fnTimerLef2()
            timer = setInterval(fnTimerLef2, 1000)
        }

        function fnPause() {
            // 暂停计时
            clearInterval(timer);
            $('.fa-pause').removeClass('fa-pause').addClass('fa-play');
        }

        function fnPlay() {
            // 开启计时
            timer = setInterval(fnTimerLef2, 1000);
            $('.fa-play').removeClass('fa-play').addClass('fa-pause');
        }

        // 功能1： 控制计时器
        $('.control a').eq(0).click(function() {
            if ($(this).children('i').prop('class') == "fa fa-pause") {
                fnPause();
            } else {
                fnPlay();
            }
        })

        // 功能2：音乐播放控制
        $('.control a').eq(1).click(function() {
            console.log($(this).children('i').prop('class'));
            if ($(this).children('i').prop('class') == "fa fa-volume-up") {
                $('.fa-volume-up').removeClass('fa-volume-up').addClass('fa-volume-off');
                audio.pause();
            } else {
                $('.fa-volume-off').removeClass('fa-volume-off').addClass('fa-volume-up');
                audio.play();
            }
        })
        startTimer();

        // 功能3: 关闭倒计时
        $('.control a').eq(2).click(function() {
            var nwin = require('electron').remote.getCurrentWindow()
            nwin.close();
        })


    })
});


// function fnTimeLef() {
//     var sNow = new Date();

//     var sFuture = new Date(aList[0], aList[1] - 1, aList[2], aList[3], aList[4]);

//     var sLeft = parseInt((sFuture - sNow) / 1000);

//     console.log('sLeft剩余时间要求是秒', sLeft)

//     var iDays = parseInt(sLeft / 86400);

//     var iHours = parseInt((sLeft % 86400) / 3600);

//     var iMinutes = parseInt((sLeft % 86400) % 3600 / 60);

//     var iSeconds = sLeft % 60;

//     var sTr = iDays + '天' + iHours + '小时' + iMinutes + '分' + iSeconds + '秒'
//     oTime1.innerHTML = iDays;
//     oTime2.innerHTML = iHours;
//     oTime3.innerHTML = iMinutes;
//     oTime4.innerHTML = iSeconds;
// }