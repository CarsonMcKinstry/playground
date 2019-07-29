import "@babel/polyfill";
import { openDB } from "idb";
import { BehaviorSubject, fromEvent, of, from } from "rxjs";
import {
  switchMap,
  tap,
  map,
  withLatestFrom,
  startWith,
  filter
} from "rxjs/operators";

async function doDBStuff() {
  const db = await openDB("todos", 1, {
    upgrade(db) {
      const todos = db.createObjectStore("todos");
    }
  });

  return db;
}

const db = from(doDBStuff());

const NewTodos = new BehaviorSubject().pipe(filter(i => i !== undefined));

// db.then(db => {
//   const tx = db.transaction("todos", "readwrite");

//   const os = tx.objectStore("todos");

//   return os
//     .add("hello", )
//     .then(id => os.get(id))
//     .then(todo => NewTodos.next(todo));
// });

const button = document.getElementById("button");
const input = document.getElementById("input");
const list = document.getElementById("list");

const click = fromEvent(button, "click");

click
  .pipe(
    map(() => input.value),
    withLatestFrom(db),
    switchMap(([inputValue, db]) => {
      const tx = db.transaction("todos", "readwrite");
      const os = tx.objectStore("todos");

      const addPromise = os.add(inputValue, Math.floor(new Date() / 1000));

      return from(addPromise);
    }),
    withLatestFrom(db),
    switchMap(([id, db]) => {
      const tx = db.transaction("todos", "readwrite");
      const os = tx.objectStore("todos");

      const getPromise = os.get(id);

      return from(getPromise);
    }),
    tap(todo => NewTodos.next(todo))
  )
  .subscribe();

NewTodos.subscribe(value => {
  const el = document.createElement("li");
  const frag = document.createDocumentFragment();

  const textNode = document.createTextNode(value);

  frag.appendChild(textNode);
  el.appendChild(frag);
  list.appendChild(el);
});
