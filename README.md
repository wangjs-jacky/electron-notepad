# electron-notepad
> 一款仿梦畅的便签软件
> 因为非常喜欢梦畅闹钟这款软件，发现里面的便签系统非常好用，也给身边的很多人推荐。正好最近对前端特别感兴趣，所以以electron为平台自定义其中的便签软件。

下载地址：[Release发布地址](https://github.com/wangjs-jacky/electron-notepad/releases)

## 软件界面

<img src="https://wjs-tik.oss-cn-shanghai.aliyuncs.com/img/image-20201219171243342.png" style="zoom:67%;" />

<img src="https://wjs-tik.oss-cn-shanghai.aliyuncs.com/img/image-20201219171751025.png"  />

## 基本功能

- 换肤设置

- 可实现5分钟、10分钟、20分钟、30分钟、60分钟倒计时功能。

  倒计时界面默认显示在桌面的右上角。

  <img src="https://wjs-tik.oss-cn-shanghai.aliyuncs.com/img/image-20201219172332192.png" style="zoom: 67%;" />

  倒计时面板功能：

  1. 暂停
  2. 默认循环播放白噪声，可静音
  3. 关闭

- 主界面缩小默认隐藏至托盘

  - 托盘处：double-click 打开页面
  - 只可以实现两功能： 打开/退出

  ![主界面托盘](https://wjs-tik.oss-cn-shanghai.aliyuncs.com/img/image-20201219172520256.png)

## 后续与改进

- 倒计时功能，添加自定义时间
- 提供用户的自定义设置界面，如后台播放的音乐，托盘悬浮文字，字体大小，文件回收站(防止误删除)。
- 提醒弹窗：延迟5min等。获提供windows用户右下角弹窗选项。