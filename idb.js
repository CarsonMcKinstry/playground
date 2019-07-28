import faker from "faker";
import uuid from "uuid/v4";
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

function insert(db) {
  return async (table, data) => {
    const tx = db.transaction(table, "readwrite");
    const os = tx.objectStore(table);

    // if (os.keyPath) {
    //   data[os.keyPath] = uuid();
    // }
    const newItem = await os.add(data);
    const result = await os.get(newItem);

    return result;
  };
}

// to remember if there is no keypath I need to provide autoincrement of true
async function main() {
  const db = await openDB("cursors", 1, {
    upgrade: async function(upgradeDB) {
      const objectStore = upgradeDB.createObjectStore("todos", {
        keyPath: "id",
        autoIncrement: true
      });
      await objectStore.createIndex("todo", "todo");
    }
  });

  const res = await insert(db)("todos", {
    todo: "hello world"
  });

  console.log(res);
}

main().then(console.log);

// const id = i => i;

// async function getAll(cursor, limit = 25, filter = id, result = []) {
//   // this is also really interesting :)
//   if (!cursor.value || limit <= 0) {
//     const itemCount = await cursor.source.count();
//     return {
//       result,
//       count: itemCount,
//       next: cursor._key
//     };
//   }

//   const nextItems = filter(cursor.value) ? result.concat(cursor.value) : result;

//   await cursor.continue();

//   return getAll(cursor, limit - 1, filter, nextItems);
// }

// const sieve = i => i.startsWith("a");

// function objEqual(o1, o2) {
//   return Object.keys(o1).every(key => o1[key] === o2[key]);
// }

// async function doDBStuff() {
//   const db = await openDB("cursors", 1, {
//     upgrade: async function(upgradeDB) {
//       const objectStore = upgradeDB.createObjectStore("todos", {
//         keyPath: "id"
//       });
//       await objectStore.createIndex("todo", "todo");
//     }
//   });

//   const tx = db.transaction("todos", "readwrite");
//   const os = tx.objectStore("todos");
//   const index = os.index("todo");

//   const todos = Array(100)
//     .fill(undefined)
//     .map(() => ({
//       todo: faker.random.words(3),
//       id: uuid()
//     }));

//   try {
//     await Promise.all(todos.map(todo => os.add(todo)));
//   } catch (e) {
//     console.log(e);
//   }

//   const firstTodo = todos[0];

//   const cursor = await index.openCursor(firstTodo.todo);

//   await tx.done;
// }

// doDBStuff();
