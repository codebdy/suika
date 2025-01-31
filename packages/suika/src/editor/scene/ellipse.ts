import { DOUBLE_PI } from '../../constant';
import { GraphType } from '../../type';
import { rotateInCanvas } from '../../utils/canvas';
import { parseRGBAStr } from '../../utils/color';
import { TextureType } from '../texture';
import { Graph, GraphAttrs } from './graph';

export type EllipseAttrs = GraphAttrs;

export class Ellipse extends Graph {
  constructor(options: EllipseAttrs) {
    super({ ...options, type: GraphType.Ellipse });
  }
  renderFillAndStrokeTexture(
    ctx: CanvasRenderingContext2D,
    smooth: boolean,
  ): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    if (this.rotation) {
      rotateInCanvas(ctx, this.rotation, cx, cy);
    }

    ctx.beginPath();
    ctx.ellipse(cx, cy, this.width / 2, this.height / 2, 0, 0, DOUBLE_PI);
    for (const texture of this.fill) {
      if (texture.type === TextureType.Solid) {
        ctx.fillStyle = parseRGBAStr(texture.attrs);
        ctx.fill();
      } else if (texture.type === TextureType.Image) {
        ctx.clip();
        this.fillImage(ctx, texture, smooth);
      }
    }

    if (this.strokeWidth) {
      ctx.lineWidth = this.strokeWidth;
      for (const texture of this.stroke) {
        if (texture.type === TextureType.Solid) {
          ctx.strokeStyle = parseRGBAStr(texture.attrs);
          ctx.stroke();
        } else if (texture.type === TextureType.Image) {
          // TODO:
        }
      }
    }

    ctx.closePath();
  }
}
