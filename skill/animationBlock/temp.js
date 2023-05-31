window.onload = function () {
  let canvasEl = document.getElementById("tutorial");
  if (!canvasEl.getContext) {
    return;
  }
  let ctx = canvasEl.getContext("2d"); // 2d | webgl

  let sun = new Image();
  sun.src = "https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/640b4df0a5074e9a9bf4777fdf1fd74e~tplv-k3u1fbpfcp-watermark.image";
  let earth = new Image();
  earth.src = "https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4ad71733e934b818a52bcfea56a683f~tplv-k3u1fbpfcp-watermark.image";
  let moon = new Image();
  moon.src = "https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05bc3992bd5044448f029b7d68049b38~tplv-k3u1fbpfcp-watermark.image";

  requestAnimationFrame(draw);

  /**
 1秒钟会回调 61次
*/
  function draw() {
    console.log("draw");
    ctx.clearRect(0, 0, 300, 300);
    ctx.save();
    // 1.绘制背景
    drawBg();
    // 2.地球
    drawEarth();
    ctx.restore();
    requestAnimationFrame(draw);
  }

  function drawBg() {
    ctx.save();
    ctx.drawImage(sun, 0, 0); // 背景图
    ctx.translate(150, 150); // 移动坐标
    ctx.strokeStyle = "rgba(0, 153, 255, 0.4)";
    ctx.beginPath(); // 绘制轨道
    ctx.arc(0, 0, 105, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawEarth() {
    let time = new Date();
    let second = time.getSeconds();
    let milliseconds = time.getMilliseconds();
    ctx.save(); // earth start
    ctx.translate(150, 150); // 中心点坐标系
    // 地球的旋转
    // Math.PI * 2  一整个圆的弧度
    // Math.PI * 2 / 60   分成 60 份
    // Math.PI * 2 / 60   1s
    // Math.PI * 2 / 60 / 1000    1mm

    // 1s 1mm
    // Math.PI * 2 / 60 * second + Math.PI * 2 / 60 / 1000 * milliseconds
    ctx.rotate(
      ((Math.PI * 2) / 10) * second +
        ((Math.PI * 2) / 10 / 1000) * milliseconds
    );
    ctx.translate(105, 0); // 圆上的坐标系
    ctx.drawImage(earth, -12, -12);
    // 3.绘制月球
    drawMoon(second, milliseconds);
    // 4.绘制地球的蒙版
    drawEarthMask();

    ctx.restore(); // earth end
  }

  function drawMoon(second, milliseconds) {
    ctx.save(); // moon start
    // 月球的旋转
    // Math.PI * 2   一圈   360
    // Math.PI * 2 / 10  1s(10s一圈)
    // Math.PI * 2 / 10 * 2  2s(10s一圈)

    // Math.PI * 2 / 10 / 1000  1mm 的弧度

    // 2s + 10mm = 弧度
    //  Math.PI * 2 / 10  * second + Math.PI * 2 / 10 / 1000 * milliseconds

    ctx.rotate(
      ((Math.PI * 2) / 2) * second +
        ((Math.PI * 2) / 2 / 1000) * milliseconds
    );
    ctx.translate(0, 28);
    ctx.drawImage(moon, -3.5, -3.5);
    ctx.restore(); // moon end
  }

  function drawEarthMask() {
    // 这里的坐标系是哪个? 圆上的坐标系
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, -12, 40, 24);
    ctx.restore();
  }
};