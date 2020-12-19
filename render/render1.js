const { BrowserWindow } = require('electron').remote
const { app } = require('electron').remote
const curWin = require('electron').remote.getCurrentWindow()
const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

var win_list = [];

// 整体打包：打包一个渲染代码
function render(data) {
    var html = template('tpl', {
        data: data
    })
    $('#supplyment').html(html)
}

// 功能：老方法添加一个新的item
function addNewItem_old() {
    var config = { "content": "测试内容" }
        // 1. 添加一个新的 item （<li>）
    $('#add-item').click(function() {
        var oUL = $('ul');
        var template = [
            '<input type="checkbox">',
            '<div class="preview ">',
            '{{content}}',
            '<div class="operate">',
            '<div class="icon">',
            '<i class="fa fa-edit"></i>',
            '</div>',
            '<div class="icon">',
            '<i class="fa fa-trash"></i>',
            '</div>',
            '<div class="icon">',
            '<i class="fa fa-moon-o"></i>',
            '</div>',
            '</div>',
            '</div>'
        ].join('\n')
        var container = $('<li></li>');
        container.html(template.replace(/\{\{([^\}]+)\}\}/g, ($0, $1) => config[$1]));
        oUL.append(container);
        container.id = new Date().getTime();
    })
}


// 功能：新方法添加一个新的item，数据驱动
function addNewItem(data) {
    console.log('data-recieve', data)
    var newItem = {
        "id": new Date().getTime(),
        "content": "",
        "display": true,
        "color": "#58C6F1"
    }
    data.push(newItem)
    render(data)
    createWindow(data, data.length - 1)
}



function initialize(data) {
    // 1. 模板渲染： HTML
    render(data)

    // 2. 根据moon和sun打开窗口
    data.forEach(function(currentValue, index, arr) {
        if (currentValue.display) {
            createWindow(data, index)
        }
    })
}

function closeWindow(data, winID, idx) {
    // 调用closeWindow：1. win=null 2.从win_list列表中删除 3. 修改data中的display属性
    // 1. 关闭时：修改display
    console.log("closeWindow win ID:", winID)
    data[idx].display = false
    render(data)
    var win = BrowserWindow.fromId(winID)
    let idx2 = win_list.findIndex((item) => {
        return item.nwinID == win.id
    })
    win_list.splice(idx2, 1)
    win.close()
}

function closeWindow2(data, idx) {
    console.log("closeWindow2中data中索引号", idx)
    console.log("closeWindow2中data中id", data[idx].id)
    console.log("closeWindow2中win_list", JSON.stringify(win_list))
    win_list.some((item) => {
        if (item.itemID == data[idx].id) {
            console.log("win id when crash", item.nwinID)
            closeWindow(data, item.nwinID, idx)
            return true
        }

    })
}

function createWindow(data, idx) {
    // 传入data,以传入地址为核心(对象，数组)

    // 一、 创建
    // 1. 创建新的窗口对象： nwin
    var nwin = new BrowserWindow({
        useContentSize: true,
        width: 290,
        height: 170,
        frame: false,
        minWidth: 290,
        minHeight: 170,
        hasShadow: true,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            spellcheck: false,
        }
        // parent: curWin,
    })

    // 打开调试模式：
    // nwin.webContents.openDevTools();

    nwin.webContents.on('did-finish-load', function() {
        nwin.webContents.send('dataToRender2', data[idx]);
    });
    nwin.loadFile('./render/note1.html');
    nwin.on('close', () => {
        win = null
    });

    // 2. 修改数据data
    // [旧:以element为驱动]：$('li').eq(idx).find('.fa-moon-o').prop({ "class": "fa fa-sun-o" })
    data[idx].display = true;
    render(data)

    // 3.修改win_list数组
    //   将itemID作为key, winID作为value
    var viewID = {
        "itemID": data[idx].id,
        "nwinID": nwin.id
    }
    win_list.push(viewID)
    console.log('win_list after createWinodw:', win_list)

    // 二、销毁窗口时
    // 关闭窗口时：需要输入data.id ,查找到win.id
    // closeWindow2(data, win_list, idx)
}

$(document).ready(function() {
    // 0. 从main process 中获取数据
    ipcRenderer.send('dataRequest')
    var p = new Promise((resolve, reject) => {
        ipcRenderer.on('dataExport', (event, arg) => {
            resolve(arg)
        })
    })

    p.then((data) => {
        // 此时已经从main.js中取到数据

        // 0. 初始化：生成HTML - 修改css
        initialize(data)

        console.log(win_list)

        // 监听子程序中的closeWindow事件
        ipcRenderer.on("closeWindow", (event, arg) => {
            console.log("接受并调用closeWindow")
            console.log("检查即将关闭的窗口id", arg["id"])
            console.dir("检查win_list", win_list)

            // 获取id在data中的索引号
            let idx = data.findIndex((item) => {
                return item.id == arg.id
            })
            console.log("data中的索引号", idx)

            // 1. 关闭时修改display数据
            // 2. 修改content
            data[idx].display = false
            data[idx].content = arg.content
            data[idx].color = arg.color


            // 关闭时： 先搜索win_list再根据winID删除
            closeWindow2(data, idx)
        })

        ipcRenderer.on("save-now", (event, arg) => {
            // 获取id在data中的索引号
            let idx = data.findIndex((item) => {
                return item.id == arg.id
            })
            console.log("data中的索引号", idx)

            // 2.修改content
            data[idx].content = arg.content
            data[idx].color = arg.color
        })

        // 监听子程序中的createWindow事件
        ipcRenderer.on("createWindow", (event, arg) => {
            addNewItem(data)
        })


        // 1. 添加一个新的item,这里注意function的调用时间！！！！
        $('#add-item').click(function() {
            addNewItem(data)
        })

        // 功能2：刪除功能/调整功能/显示功能(利用冒泡原理)
        $('ul').delegate('i', 'click', function() {
            // $(this) 指的是委托的子元素
            // 获取到新创建的索引值，想方设法将其传递给render2.js

            // 获取索引值1： i的位置
            var idx = $('ul li').index($(this).parents('li'))
                // 获取索引值2：检测当前id是否在win_list中
            var isExist = win_list.findIndex((item) => {
                return item.itemID == data[idx].id
            })

            if ($(this).hasClass("fa-edit")) {
                // 功能： 创建新窗口[但需要做重复窗口检测]
                console.log("isExit", isExist)
                if (isExist == -1) {
                    console.log("函数不存在，开始创建新窗口")
                    createWindow(data, idx)
                } else {
                    console.log("函数已存在，不创建")
                }
            } else if ($(this).hasClass("fa-sun-o")) {
                // 功能： 创建新窗口
                createWindow(data, idx)

                // 知识点：
                // 1. 传统取索引的方式，一个一个往上parent()
                // console.log($('ul .operate').index($(this).parent().parent()))
                // 2. 利用parents()获取父元素
                // console.log($(this).parents('li').index('li'))
                // 3. index的用法
                // console.log($('ul li').index($(this).parents('li')))

            } else if ($(this).hasClass("fa-moon-o")) {
                // 功能：关闭
                closeWindow2(data, idx)

            } else if ($(this).hasClass("fa-trash")) {
                // 功能：删除数据 
                data.splice(idx, 1)
                render(data)
            }
        })

        // 功能三：选中checkbox再批量删除--循环遍历所有的li列表
        var delChecked = $('#del-checked');
        delChecked.click(function() {
            //jquery用单独的:checked去选择
            //传统减去<li>element： $('li input:checked').parent().remove()
            console.log('all checkbox', $('li input').length)
            console.log('selected checkbox', $('li input:checked').length)

            data = data.filter((currentValue, index, arr) => {
                return $("li input").eq(index).prop("checked") != true
            })
            render(data)

            // 减后需要将checkbox的勾给消掉
            $('.sticky-head :checkbox').prop({ 'checked': false })
        })

        // 功能四：点击input让所有的checkbox选中
        oSelectedAll = $('.sticky-head :checkbox')
        oSelectedAll.change(function() {
            console.log('通过jquery选择', oSelectedAll.prop("checked"))
            console.log('修改箭头函数', $(this).prop("checked"))
            if (oSelectedAll.is(":checked")) {
                $('li :checkbox').prop({ 'checked': true })
            } else {
                $('li :checkbox').prop({ 'checked': false })
            }
            // 知识点：
            // checkbox的选择
            // 1.oSelectedAll.is(":checked")
            // 2.oSelectedAll.prop("checked")取出attr checked="checked"
            // 3. 传统写法 
            // document.getElementById('').attr('')
            // jquery的选择：$(':checkbox') 或者 $('[type="checkbox"]')
            // checkbox中置布尔值，必须使用prop,(attr)
        })

        // 程序结束后调用
        window.onbeforeunload = (event) => {

            // 在electron中开启调试模式后，程序才不会关闭
            app.quit()

            // 关闭前：保存文件入data.json文件中
            fs.writeFile(path.join(__dirname, 'assets', 'data.json'), JSON.stringify(data), err => {
                if (err != null) {
                    console.log('文件写入失败')
                }
                console.log('=========doc-write-success========')
                    // 注：此注射无法在render1.js界面中看到，调试时请加上
                    // e.returnValue = false;
            })
        }
    })
});