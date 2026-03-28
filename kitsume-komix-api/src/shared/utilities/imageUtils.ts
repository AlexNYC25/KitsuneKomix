import sharp from "sharp";

export async function getImageDimensions(
  imagePath: string,
): Promise<{ width: number; height: number } | null> {
  try {
    const metadata = await sharp(imagePath).metadata();

    if (metadata.width && metadata.height) {
      return {
        width: metadata.width,
        height: metadata.height,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error getting image dimensions for ${imagePath}:`, error);
    return null;
  }
}

export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stat = await Deno.stat(filePath);
    return stat.size;
  } catch (error) {
    console.error(`Error getting file size for ${filePath}:`, error);
    return 0;
  }
}
