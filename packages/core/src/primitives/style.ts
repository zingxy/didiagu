interface ISolidPaint {
  type: 'SOLID';
  color: string;
  strokeWidth?: number;
  pixelLine?: boolean;
}

export type IPaint = ISolidPaint;
