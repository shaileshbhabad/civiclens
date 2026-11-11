import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_PATH = path.resolve(__dirname, '../../models/civiclens_model.pt');
const PREDICT_SCRIPT = path.resolve(__dirname, '../../scripts/predictImage.py');

/**
 * CivicLens Local Vision Model Service
 * Powered by user-trained MobileNetV3 weights (civiclens_model.pt)
 */
class LocalVisionService {
  constructor() {
    this.isAvailable = fs.existsSync(MODEL_PATH);
    if (this.isAvailable) {
      console.log(`[LocalVisionService] Loaded trained municipal model from: ${MODEL_PATH}`);
    } else {
      console.warn(`[LocalVisionService] No trained model found at: ${MODEL_PATH}`);
    }
  }

  /**
   * Run local inference on an image buffer or file path
   * @param {string|Buffer} imageBufferOrPath
   * @returns {Promise<Object|null>}
   */
  async predict(imageBufferOrPath) {
    if (!fs.existsSync(MODEL_PATH)) return null;

    let tempFile = null;
    let targetPath = '';

    try {
      if (typeof imageBufferOrPath === 'string' && fs.existsSync(imageBufferOrPath)) {
        targetPath = imageBufferOrPath;
      } else {
        // Write buffer or base64 to temp image file
        let buf = null;
        if (typeof imageBufferOrPath === 'string' && imageBufferOrPath.startsWith('data:image/')) {
          const base64Data = imageBufferOrPath.split(';base64,').pop();
          buf = Buffer.from(base64Data, 'base64');
        } else if (Buffer.isBuffer(imageBufferOrPath)) {
          buf = imageBufferOrPath;
        }

        if (!buf) return null;

        const tmpDir = path.resolve(__dirname, '../../tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        tempFile = path.join(tmpDir, `infer_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
        fs.writeFileSync(tempFile, buf);
        targetPath = tempFile;
      }

      return await new Promise((resolve) => {
        const py = spawn('python', [PREDICT_SCRIPT, '--image', targetPath, '--model', MODEL_PATH]);
        let stdout = '';
        let stderr = '';

        py.stdout.on('data', (d) => { stdout += d.toString(); });
        py.stderr.on('data', (d) => { stderr += d.toString(); });

        py.on('close', (code) => {
          if (tempFile && fs.existsSync(tempFile)) {
            try { fs.unlinkSync(tempFile); } catch (e) { /* ignore */ }
          }

          if (code === 0 && stdout.trim()) {
            try {
              const parsed = JSON.parse(stdout.trim());
              return resolve(parsed);
            } catch (err) {
              console.warn('[LocalVisionService] Failed to parse output:', err.message);
            }
          }
          if (stderr) console.warn('[LocalVisionService] Python stderr:', stderr.slice(0, 200));
          resolve(null);
        });

        // 10 second timeout guard
        setTimeout(() => {
          py.kill();
          if (tempFile && fs.existsSync(tempFile)) {
            try { fs.unlinkSync(tempFile); } catch (e) { /* ignore */ }
          }
          resolve(null);
        }, 10000);
      });
    } catch (err) {
      if (tempFile && fs.existsSync(tempFile)) {
        try { fs.unlinkSync(tempFile); } catch (e) { /* ignore */ }
      }
      console.warn('[LocalVisionService] Prediction error:', err.message);
      return null;
    }
  }
}

export const localVisionService = new LocalVisionService();
export default localVisionService;
