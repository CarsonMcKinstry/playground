import { openDB } from "idb";
import indexedDB from "fake-indexeddb";
import IDBKeyRange from "fake-indexeddb/lib/FDBKeyRange";
import IDBIndex from "fake-indexeddb/lib/FDBIndex";
import IDBCursor from "fake-indexeddb/lib/FDBCursor";
import IDBDatabase from "fake-indexeddb/lib/FDBDatabase";
import IDBTransaction from "fake-indexeddb/lib/FDBTransaction";
import IDBObjectStore from "fake-indexeddb/lib/FDBObjectStore";
import IDBRequest from "fake-indexeddb/lib/FDBRequest";

global.indexedDB = indexedDB;
global.IDBKeyRange = IDBKeyRange;
global.IDBIndex = IDBIndex;
global.IDBTransaction = IDBTransaction;
global.IDBDatabase = IDBDatabase;
global.IDBCursor = IDBCursor;
global.IDBObjectStore = IDBObjectStore;
global.IDBRequest = IDBRequest;

async function getAll(cursor, limit = 2, count = 0, items = []) {
  // this is also really interesting :)
  if (!cursor.value || count >= limit) {
    return {
      items,
      next: cursor._key
    };
  }

  const nextItems = items.concat(cursor.value);

  await cursor.continue();

  return getAll(cursor, limit, count + 1, nextItems);
}

async function doDBStuff() {
  const db = await openDB("cursors", 1, {
    upgrade: async function(upgradeDB) {
      const objectStore = upgradeDB.createObjectStore("todos", {
        keyPath: "id"
      });
    }
  });

  const tx = db.transaction("todos", "readwrite");
  const os = tx.objectStore("todos");
  try {
    await os.add({
      todo: "learn react",
      id: 1
    });
    await os.add({
      todo: "learn graphql",
      id: 2
    });
    await os.add({
      todo: "learn melody",
      id: 3
    });
  } catch (e) {
    console.log(e.message);
  }

  // const range = IDBKeyRange.bound(1, 2); // THis is the thing! thank god for types
  // how should we get an upper bound?

  // figure out how cursors work
  // need to figure out how to set the first cursor
  const cursor = await os.openCursor();

  // await cursor.continue();
  // await cursor.continue();

  // console.log(cursor);
  // await cursor.advance();

  const { items, next } = await getAll(cursor);

  // console.log(items);

  const newCursor = await os.openCursor(next);

  const nextItems = await getAll(newCursor);

  console.log(nextItems);

  await tx.done;
}

doDBStuff();
