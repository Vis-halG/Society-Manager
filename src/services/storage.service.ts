import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firebaseStorageEnabled, storage } from '../config/firebase';

export async function uploadFile(
  localUri: string,
  path: string
): Promise<string> {
  if (!firebaseStorageEnabled || !storage) {
    console.warn(
      `[storage] Firebase Storage disabled; keeping local file URI for ${path}. ` +
        'This works on the current device only.'
    );
    return localUri;
  }

  const response = await fetch(localUri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function deleteFile(path: string): Promise<void> {
  if (!firebaseStorageEnabled || !storage) return;

  try {
    await deleteObject(ref(storage, path));
  } catch {
    // ignore missing file errors
  }
}

export function buildStoragePath(folder: string, societyId: string, fileName: string) {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  return `${folder}/${societyId}/${timestamp}_${safeName}`;
}
