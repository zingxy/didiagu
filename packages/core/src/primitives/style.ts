interface ISolidPaint {
  type: 'SOLID';
  color: string;
}
interface IImagePaint {
  type: 'IMAGE';
  src: string;
}

export type IPaint = ISolidPaint;
