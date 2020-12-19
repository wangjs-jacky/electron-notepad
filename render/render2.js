const { ipcRenderer } = require('electron')
const { BrowserWindow } = require('electron').remote

$(document).ready(function() {
    // 0. 从main process 中获取数据
    // config(config)
    console.log(typeof config == "undefined")
    ipcRenderer.send('dataRequest2')
    console.log('render2.js：send dataRequest2')
    var p = new Promise((resolve, reject) => {
        ipcRenderer.on('dataToRender2', (event, arg) => {
            console.log('render2.js：recept config[arg] \n', arg)
            resolve(arg)
        })
    })

    p.then((config) => {
        // 模板匹配
        var template = [
            '{{content}}'
        ].join('\n');
        var container = $('.edit_region');
        container.html(template.replace(/\{\{([^\}]+)\}\}/g, ($0, $1) => config[$1]));

        // 根据config传入的"color"关键字渲染
        $('.content').css({ "backgroundColor": config["color"] })

        // 保存颜色设置
        const colorChange = $('.content')
        $("#skin-blue").click(() => {
            colorChange.css({
                "backgroundColor": "#58C6F1"
            })
            config.color = "#58C6F1"
        })
        $("#skin-yellow").click(() => {
            colorChange.css({
                "backgroundColor": "#FFD06A"
            })
            config.color = "#FFD06A"
        })
        $("#skin-green").click(() => {
            colorChange.css({
                "backgroundColor": "#74F178"
            })
            config.color = "#74F178"
        })
        $("#skin-pink").click(() => {
            colorChange.css({
                "backgroundColor": "#FF9EBB"
            })
            config.color = "#FF9EBB"
        })
        $("#skin-white").click(() => {
            colorChange.css({
                "backgroundColor": "#FFF"
            })
            config.color = "#FFF"
        })

        // 功能：css中的height于width：由js捕获body.clientWidth提供
        // 需要了解掌握的是：window与documenet.body的区别
        var content = $('.content');
        content.css({
            'width': parseInt($(document.body).width())
        })
        container.css({
            'height': parseInt($(document.body).outerHeight()) - 20
        })


        $(window).resize(function() {
            content.css({
                'width': parseInt($(document.body).width())
            })
            container.css({
                'height': parseInt($(document.body).outerHeight()) - 20
            })
        })

        //===================== 功能区=============================
        // 图标1:锁定蛇者
        // 知识点： $('i').eq(0)上的click事件，因为冒泡规则，相当于点击了两次
        $('i').eq(0).click(function() {
            event.stopPropagation();
            $(this).toggleClass("fa-unlock-alt").toggleClass("fa-lock")
            var nwin = require('electron').remote.getCurrentWindow()
            nwin.setMovable($(this).hasClass("fa-unlock-alt") ? true : false)

        })

        // 图标2:置顶设置
        $('i').eq(1).click(function() {
            event.stopPropagation();
            $(this).toggleClass("fa fa-toggle-on").toggleClass("fa fa-toggle-off")
            var nwin = require('electron').remote.getCurrentWindow()
            nwin.setAlwaysOnTop($(this).hasClass("fa-toggle-on") ? true : false)
        })

        // 图标3：时间设置
        $('i').eq(2).click((event) => {
            event.stopPropagation();
            $('.skin').removeClass('active');
            $('.timer').toggleClass('active');
        })

        // 图标4：换肤设置
        $('i').eq(3).click((event) => {
            event.stopPropagation();
            $('.timer').removeClass('active');
            $('.skin').toggleClass('active');
        })

        // 添加一个新的item
        $('i').eq(4).click((event) => {
            event.stopPropagation();
            ipcRenderer.sendTo(1, "createWindow", config)
            console.log("即将关闭主页")
        })

        // 图标6：关闭设置
        $('i').eq(5).click(function() {
            event.stopPropagation();
            ipcRenderer.sendTo(1, "closeWindow", config)
            console.log("即将关闭主页内容", config["content"])
        })

        // 失去焦点，隐藏、获取编辑器中的内容
        container.on("keypress click", function() {
            $('.skin').removeClass('active');
            $('.timer').removeClass('active');
            config.content = $(this).html();
            console.log("config是否改变", config);
        })

        // 知識點：.on是官方推薦的新的綁定函數，可以一次性綁定多個事件

        // div中沒有change事件，且contenteditable是H5新增屬性，故需要自己編寫監聽函數
        var contentOld = container.html();
        container.on('blur keyup paste copy cut mouseup', function() {
            var contentNew = $(this).html();
            if (contentOld != contentNew) {
                console.log('内容发生改变，实时存入数据');
                config.content = $(this).html();
                ipcRenderer.sendTo(1, "save-now", config)
            }
        })

        container.blur(function() {
            config.content = $(this).html()
            console.log("config是否改变", config)
        });

        // 创建计时
        $('#setTime').delegate('Button', 'click', function() {
            // 索引值获取
            // alert($('#setTime Button').index($(this)));
            idButton = $('#setTime Button').index($(this));

            let win = new BrowserWindow({
                useContentSize: true,
                width: 229,
                height: 90,
                x: 1270,
                y: 50,
                resizable: false,
                hasShadow: true,
                frame: false,
                alwaysOnTop: true,
                webPreferences: {
                    nodeIntegration: true,
                    enableRemoteModule: true,
                },
                autoHideMenuBar: true,
                backgroundColor: '#FFF',
            });
            win.loadFile('./render/CountDown.html');

            // 打开调试模式
            // win.webContents.openDevTools();

            // 只有win这个窗口加载完成后,才可以向渲染进程传递数据
            win.webContents.on('did-finish-load', function() {
                ipcRenderer.sendTo(win.id, 'setTime', idButton);
            });
            win.on('close', () => {
                win = null
            });
            // // winId = win.id;
            // ipcRenderer.sendTo(win.id, "SetTime", "ddddd");
        });
    });
})