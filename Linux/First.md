# 一、安装与注册
## 1. 安装wsl
[wsl官网](https://learn.microsoft.com/en-us/windows/wsl/install)
```txt
通过 wsl --list --online 查看可用发行版
wsl --install -d <DistroName>  安装发行版
安装完后选择 => Ubuntu
通过 wsl -l -v 可查看版本号
```
## 2. 设置用户名与密码
[设置或修改Linux用户名和密码](https://learn.microsoft.com/en-us/windows/wsl/setup/environment#set-up-your-linux-username-and-password)

# 二、 Linux目录结构
```txt
通过 ls path的方法导航目录
根目录 /  
二级目录：
  /bin：bin 是 Binaries (二进制文件) 的缩写, 这个目录存放着最经常使用的命令。
  /boot：这里存放的是启动 Linux 时使用的一些核心文件，包括一些连接文件以及镜像文件。
  /dev：dev 是 Device(设备) 的缩写, 该目录下存放的是 Linux 的外部设备，在 Linux 中访问设备的方式和访问文件的方式是相同的。
  /etc：etc 是 Etcetera(等等) 的缩写,这个目录用来存放所有的系统管理所需要的配置文件和子目录。
  /home：用户的主目录，在 Linux 中，每个用户都有一个自己的目录，一般该目录名是以用户的账号命名的，如上图中的 alice、bob 和 eve。
  /lib：lib 是 Library(库) 的缩写这个目录里存放着系统最基本的动态连接共享库，其作用类似于 Windows 里的 DLL 文件。几乎所有的应用程序都需要用到这些共享库。
  /lost+found：这个目录一般情况下是空的，当系统非法关机后，这里就存放了一些文件。
  ====
```
[参考地址：Linux系统目录结构](https://www.runoob.com/linux/linux-system-contents.html)

# 三、文件与目录管理
## tips
```txt
绝对路径：
路径的写法，由根目录 / 写起，例如： /usr/share/doc 这个目录。

相对路径：
路径的写法，不是由 / 写起，例如由 /usr/share/doc 要到 /usr/share/man 底下时，可以写成： cd ../man 这就是相对路径的写法。
```
## 常用命令
```txt
ls（英文全拼：list files）: 列出目录及文件名
cd（英文全拼：change directory）：切换目录
pwd（英文全拼：print work directory）：显示目前的目录
mkdir（英文全拼：make directory）：创建一个新的目录
rmdir（英文全拼：remove directory）：删除一个空的目录
cp（英文全拼：copy file）: 复制文件或目录
rm（英文全拼：remove）: 删除文件或目录
mv（英文全拼：move file）: 移动文件与目录，或修改文件与目录的名称
你可以使用 man [命令] 来查看各个命令的使用文档，如 ：man cp。
```
## wsl环境的Linux
```txt
使用“sudo <command>”命令以管理员身份(root用户)执行命令。
详细信息请参见“man sudo_root”。
通过sudo <command>来执行Linux命令
```

