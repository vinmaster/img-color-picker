export class CanvasImage {
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  width: number;
  height: number;

  constructor(image: any) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.width = this.canvas.width = image.naturalWidth;
    this.height = this.canvas.height = image.naturalHeight;
    this.context.drawImage(image, 0, 0, this.width, this.height);
  }

  getImageData() {
    return this.context.getImageData(0, 0, this.width, this.height);
  }

  createPixelArray(quality: number) {
    return this.createPixelArrayWithData(
      this.getImageData().data,
      this.width * this.height,
      quality
    );
  }

  createPixelArrayWithData(imgData: any, pixelCount: number, quality: number) {
    const pixels = imgData;
    const pixelArray = [];

    for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
      offset = i * 4;
      r = pixels[offset + 0];
      g = pixels[offset + 1];
      b = pixels[offset + 2];
      a = pixels[offset + 3];

      // If pixel is mostly opaque and not white
      if (typeof a === 'undefined' || a >= 125) {
        if (!(r > 250 && g > 250 && b > 250)) {
          pixelArray.push([r, g, b]);
        }
      }
    }
    return pixelArray;
  }
}
