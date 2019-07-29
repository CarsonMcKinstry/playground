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

    const tx = db.transaction("todos", "readwrite");
    const os = tx.objectStore("todos");
    try {
        await os.add({
            todo: "learn react",
            id: Math.floor(new Date() / 1000)
        });
        await os.add({
            todo: "learn graphql",
            id: Math.floor(new Date() / 1000) + 1
        });
        await os.add({
            todo: "learn melody",
            id: Math.floor(new Date() / 1000) + 2
        });
        await os.add({
            todo: "watch netflix",
            id: Math.floor(new Date() / 1000) + 3
        });
    } catch (e) {
        console.log(e.message);
    }

    // figure out how cursors work
    // const cursor = await os.openCursor();
    // // console.log(cursor);
    // // console.log(cursor.value);
    // // await cursor.continue().then(c => console.log(c.value));
    // // await cursor.continue().then(c => console.log(c.value));
    // // await cursor.continue().then(c => console.log(c.value));

    function check(item) {
        return item.todo.startsWith("watch");
    }

    async function accItems(cursor, items = []) {
        if (!cursor) return items;

        const item = cursor.value;

        const nextItems = check(item) ? items.concat(cursor.value) : items;

        const next = await cursor.continue();

        return accItems(next, nextItems);
    }

    const cursor = await os.openCursor();

    const items = await accItems(cursor);

    console.log(items);

    await tx.done;
}

console.time("thing");
doDBStuff().then(() => {
    console.timeEnd("thing");
});
