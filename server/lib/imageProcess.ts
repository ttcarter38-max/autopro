// Image resizing/recompression before upload. Uses sharp.
// Resizes to max 1600px wide (preserves aspect ratio, never enlarges) and re-encodes as JPEG q82.
import sharp from 'sharp';

export interface ProcessedImage {
  buffer: Buffer;
  contentType: string;
}

export async function resizeForUpload(input: Buffer, maxWidth = 1600): Promise<ProcessedImage> {
  try {
    const meta = await sharp(input).metadata();
    let pipeline = sharp(input).rotate(); // honor EXIF orientation
    if (meta.width && meta.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }
    const out = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    return { buffer: out, contentType: 'image/jpeg' };
  } catch (err) {
    console.warn('[imageProcess] resize failed, uploading original:', (err as Error).message);
    return { buffer: input, contentType: 'image/jpeg' };
  }
}
