import { rotateInCanvas } from '../utils/canvas';
import { getClosestVal } from '../utils/common';
import { Editor } from './editor';

const HALF_PI = Math.PI / 2;

const getStepByZoom = (zoom: number) => {
  /**
   * 步长研究，参考 figma
   * 1
   * 2
   * 5
   * 10（对应 500% 往上） 找到规律了： 50 / zoom = 步长
   * 25（对应 200% 往上）
   * 50（对应 100% 往上）
   * 100（对应 50% 往上）
   * 250
   * 500
   * 1000
   * 2500
   * 5000
   */
  const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
  const step = 50 / zoom;
  for (let i = 0, len = steps.length; i < len; i++) {
    if (steps[i] >= step) return steps[i];
  }
  return steps[0];
};

class Ruler {
  visible = false;

  constructor(private editor: Editor) {}

  open() {
    this.visible = true;
  }
  close() {
    this.visible = false;
  }
  draw() {
    const setting = this.editor.setting;
    const ctx = this.editor.ctx;
    const viewport = this.editor.viewportManager.getViewport();
    const { width: viewportWidth, height: viewportHeight } = viewport;
    ctx.save();
    // 绘制背景
    ctx.fillStyle = setting.rulerBgColor;
    ctx.fillRect(0, 0, viewportWidth, setting.rulerWidth);
    ctx.fillRect(0, 0, setting.rulerWidth, viewportHeight);

    this.drawXRuler();
    this.drawYRuler();

    // 把左上角的小矩形上的刻度盖掉
    ctx.fillStyle = setting.rulerBgColor;
    ctx.fillRect(0, 0, setting.rulerWidth, setting.rulerWidth);

    // 绘制 border
    ctx.strokeStyle = setting.rulerStroke;
    ctx.beginPath();
    // 水平 border
    ctx.moveTo(0, setting.rulerWidth + 0.5);
    ctx.lineTo(viewportWidth, setting.rulerWidth + 0.5);
    ctx.stroke();
    ctx.closePath();
    // 垂直 border
    ctx.beginPath();
    ctx.moveTo(setting.rulerWidth + 0.5, 0);
    ctx.lineTo(setting.rulerWidth + 0.5, viewportHeight);
    ctx.stroke();
    ctx.closePath();

    ctx.restore();
  }
  private drawXRuler() {
    // 绘制刻度线和刻度值
    // 计算 x 轴起点和终点范围
    const setting = this.editor.setting;
    const ctx = this.editor.ctx;
    const zoom = this.editor.zoomManager.getZoom();
    const viewport = this.editor.viewportManager.getViewport();
    const stepInScene = getStepByZoom(zoom);

    const startX = setting.rulerWidth;
    let startXInScene = viewport.x + startX / zoom;
    startXInScene = getClosestVal(startXInScene, stepInScene);

    const endX = viewport.width;
    let { x: endXInScene } = this.editor.viewportCoordsToScene(endX, 0);
    endXInScene = getClosestVal(endXInScene, stepInScene);

    ctx.textAlign = 'center';
    const y = setting.rulerWidth - setting.rulerMarkSize;
    while (startXInScene <= endXInScene) {
      ctx.fillStyle = setting.rulerMarkStroke;
      const x = (startXInScene - viewport.x) * zoom;
      ctx.fillRect(
        x,
        y,
        1,
        setting.rulerMarkSize + 0.5
      );
      ctx.fillText(String(startXInScene), x, y - 4);
      startXInScene += stepInScene;
    }
  }
  private drawYRuler() {
    // 绘制刻度线和刻度值
    const setting = this.editor.setting;
    const ctx = this.editor.ctx;
    const zoom = this.editor.zoomManager.getZoom();
    const viewport = this.editor.viewportManager.getViewport();
    const stepInScene = getStepByZoom(zoom);

    const startY = setting.rulerWidth;
    let startYInScene = viewport.y + startY / zoom;
    startYInScene = getClosestVal(startYInScene, stepInScene);

    const endY = viewport.height;
    let endYInScene = viewport.y + endY / zoom;
    endYInScene = getClosestVal(endYInScene, stepInScene);

    const x = setting.rulerWidth - setting.rulerMarkSize;
    ctx.textAlign = 'center';
    while (startYInScene <= endYInScene) {
      ctx.fillStyle = setting.rulerMarkStroke;
      const y = (startYInScene - viewport.y) * zoom;
      ctx.fillRect(
        x,
        y,
        setting.rulerMarkSize + 0.5,
        1,
      );
      rotateInCanvas(ctx, -HALF_PI, x, y);
      ctx.fillText(String(startYInScene), x, y - 3);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      startYInScene += stepInScene;
    }
  }
}

export default Ruler;