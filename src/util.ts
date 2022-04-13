import { createWriteStream, existsSync, mkdirSync } from 'fs';
import axios from 'axios';

const IMAGE_BASE_PATH = '/asset';

export function getId(name: string) {
  return name
    .replace(/[^a-zA-Z ]/g, '')
    .toLowerCase()
    .replace(/ /g, '_');
}

export async function downloadImage(url: string, outputDir: string, folderName: string, fileName: string) {
  const path = `${outputDir}/${IMAGE_BASE_PATH}/${folderName}`;

  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  const filePath = `${path}/${fileName}.png`;
  const response = await axios.get(url, {
    method: 'GET',
    responseType: 'stream',
  });

  return new Promise((resolve, reject) => {
    response.data
      .pipe(createWriteStream(filePath))
      .on('error', reject)
      .once('close', () => resolve(filePath));
  });
}
