export interface ProcessedImageFrame {
  id: string;
  base64: string;
  mimeType: string;
  label: string;
  previewUrl: string;
  sourceType: 'image' | 'video-frame';
}

export async function fileToProcessedImage(file: File, index: number): Promise<ProcessedImageFrame> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`無法讀取圖片：${file.name}`));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error(`圖片格式不支援：${file.name}`));
      img.onload = () => {
        const maxDim = 1800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            id: `img-${Date.now()}-${index}`,
            base64: dataUrl,
            mimeType: file.type || 'image/jpeg',
            label: file.name || `截圖 #${index + 1}`,
            previewUrl: dataUrl,
            sourceType: 'image',
          });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve({
          id: `img-${Date.now()}-${index}`,
          base64: compressedUrl,
          mimeType: 'image/jpeg',
          label: file.name || `截圖 #${index + 1}`,
          previewUrl: compressedUrl,
          sourceType: 'image',
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export async function extractFramesFromVideo(
  file: File,
  maxFrames = 14,
  onProgress?: (pct: number) => void
): Promise<ProcessedImageFrame[]> {
  return new Promise((resolve, reject) => {
    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrl;

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error(`無法載入影片：${file.name}`));
    };

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      if (!duration || !Number.isFinite(duration) || duration <= 0) {
        URL.revokeObjectURL(videoUrl);
        reject(new Error('無法取得影片長度，請確認影片格式是否正常。'));
        return;
      }

      // Sample evenly across the video, aiming for ~1 frame every 1.2s up to maxFrames
      const idealCount = Math.min(maxFrames, Math.max(3, Math.ceil(duration / 1.2)));
      const timestamps: number[] = [];
      for (let i = 0; i < idealCount; i++) {
        const t = idealCount === 1 ? 0 : (i / (idealCount - 1)) * Math.max(0.1, duration - 0.15);
        timestamps.push(t);
      }

      const canvas = document.createElement('canvas');
      const maxDim = 1440;
      let width = video.videoWidth || 1080;
      let height = video.videoHeight || 1920;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const frames: ProcessedImageFrame[] = [];

      const seekTo = (time: number) =>
        new Promise<void>((resSeek) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resSeek();
          };
          video.addEventListener('seeked', onSeeked);
          video.currentTime = time;
        });

      try {
        for (let i = 0; i < timestamps.length; i++) {
          await seekTo(timestamps[i]);
          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.84);
            const mins = Math.floor(timestamps[i] / 60);
            const secs = Math.floor(timestamps[i] % 60);
            const timeLabel = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            frames.push({
              id: `vid-${Date.now()}-${i}`,
              base64: dataUrl,
              mimeType: 'image/jpeg',
              label: `${file.name} (${timeLabel})`,
              previewUrl: dataUrl,
              sourceType: 'video-frame',
            });
          }
          if (onProgress) {
            onProgress(Math.round(((i + 1) / timestamps.length) * 100));
          }
        }
        URL.revokeObjectURL(videoUrl);
        resolve(frames);
      } catch (err) {
        URL.revokeObjectURL(videoUrl);
        reject(err);
      }
    };
  });
}
