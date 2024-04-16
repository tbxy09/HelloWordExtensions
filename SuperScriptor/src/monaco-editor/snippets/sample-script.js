// Function to backup the IndexedDB database
function backupIndexedDB(databaseName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName);

    request.onerror = (event) => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const objectStoreNames = db.objectStoreNames;
      const backup = {};

      const transaction = db.transaction(objectStoreNames, 'readonly');
      transaction.onerror = (event) => {
        reject(new Error('Failed to create transaction'));
      };

      transaction.oncomplete = (event) => {
        resolve(backup);
      };

      for (let i = 0; i < objectStoreNames.length; i++) {
        const objectStoreName = objectStoreNames[i];
        const objectStore = transaction.objectStore(objectStoreName);
        const data = [];

        objectStore.openCursor().onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            data.push(cursor.value);
            cursor.continue();
          } else {
            backup[objectStoreName] = data;
          }
        };
      }
    };
  });
}

// Usage example
backupIndexedDB('myDatabase')
  .then((backup) => {
    console.log('Database backup:', backup);
    // You can save the backup object to a file or send it to a server
  })
  .catch((error) => {
    console.error('Backup failed:', error);
  });