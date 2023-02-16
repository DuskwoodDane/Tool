// https://www.qinnfu.com/_next/image?url=https%3A%2F%2Fresourceservice.qinnfu.com%2Fpublic%2F1673793633368.png&w=1080&q=75

// 需求：当网络图片未加载完成时候，先展示一张loading

/**
 * cmd切到当前html路径位置
 * 全局安装http-server npm install -g http-server
 * 将网速调慢，测试图片加载速度
 */

const myImage = (() => {
  const imgNode = document.createElement('img');
  document.body.appendChild(imgNode)

  return {
    setSrc: (url) => {
      imgNode.src = url
    }
  }
})()

const proxyImage = (() => {
  const img = new Image();
  img.onload = function () {
    // 添加定时器用以模仿网络延迟
    setTimeout(() => {
      myImage.setSrc(this.src)
    }, 3000)
  }
  return {
    setSrc: (url) => {
      myImage.setSrc('./loading.png');
      img.src = url
    }
  }
})()

proxyImage.setSrc(`https://www.qinnfu.com/_next/image?url=https%3A%2F%2Fresourceservice.qinnfu.com%2Fpublic%2F1673793633368.png&w=1080&q=75`)