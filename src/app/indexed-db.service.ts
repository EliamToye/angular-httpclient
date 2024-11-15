import { Injectable } from '@angular/core';
import { openDB } from 'idb'; // Import the IDB package

@Injectable({
  providedIn: 'root' // This will make the service available throughout the application
})
export class IndexedDbService {
  private dbName = 'smartHomeDB';  // Name of the database
  private storeName = 'urls';      // Name of the object store (table) in the database

  // Method to open the IndexedDB database
  private async openDatabase() {
    return openDB(this.dbName, 1, {
      upgrade(db) {
        // If the object store doesn't exist, create it
        if (!db.objectStoreNames.contains('urls')) {
          db.createObjectStore('urls');
        }
      }
    });
  }

  // Method to save the URL to IndexedDB
  async saveUrl(url: string): Promise<void> {
    const db = await this.openDatabase();
    await db.put(this.storeName, url, 'url');  // 'url' is the key for this object
  }

  // Method to retrieve the URL from IndexedDB
  async getUrl(): Promise<string | undefined> {
    const db = await this.openDatabase();
    return await db.get(this.storeName, 'url');  // Get the URL by its key
  }

  // Optional: Method to clear the stored URL from IndexedDB
  async clearUrl(): Promise<void> {
    const db = await this.openDatabase();
    await db.delete(this.storeName, 'url');  // Delete the URL by its key
  }
}