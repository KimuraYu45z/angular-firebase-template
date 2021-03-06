import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private fireStorage: AngularFireStorage) {}

  async getURL(path: string) {
    return this.fireStorage.ref(path).getDownloadURL().toPromise<string>();
  }

  upload(path: string, blob: Blob) {
    return new Promise<string | null>((resolve, reject) => {
      this.fireStorage
        .ref(path)
        .put(blob)
        .then((snapshot) => resolve(snapshot.downloadURL))
        .catch((reason) => reject(reason));
    });
  }

  /**
   *
   * @param path
   * @param dataURL starts with `data:`
   */
  uploadDataURL(path: string, dataURL: string) {
    return new Promise<string | null>((resolve, reject) => {
      this.fireStorage
        .ref(path)
        .putString(dataURL, 'data_url')
        .then((snapshot) => resolve(snapshot.downloadURL))
        .catch((reason) => reject(reason));
    });
  }
}
