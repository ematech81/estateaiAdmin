import { api, ApiClientError } from './api';

// The image itself goes straight from the browser to Cloudinary — our
// backend only signs the request (see api/src/modules/uploads), it never
// receives or proxies the file bytes.
export async function uploadImage(file: File): Promise<string> {
  const { timestamp, signature, apiKey, cloudName, folder } = await api.getUploadSignature();

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiClientError(body.error?.message ?? 'Image upload failed', res.status);
  }

  return body.secure_url as string;
}
