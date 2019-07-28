import { interval, from } from "rxjs";
import {
  tap,
  concatMap,
  switchMap,
  pluck,
  map,
  share,
  reduce,
  bufferCount
} from "rxjs/operators";
import { Pool } from "pg";
const database = {
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres"
};

function createDBThing() {
  const pool = new Pool(database);
  const client$ = from(pool.connect());

  const count$ = client$.pipe(
    switchMap(async client => {
      const q = await client.query(`select count(*) from users;`);

      await client.release();

      return q;
    }),
    pluck("rows"),
    map(([{ count }]) => parseInt(count, 10)),
    map(count => Math.ceil(count / 1000)),
    share()
  );

  // const query$ = count$.pipe();

  const query$ = count$.pipe(
    switchMap(num => from([...Array(num)].map((_, i) => i))),
    concatMap(async n => {
      const query = `
        SELECT * FROM users
          LIMIT 1000
          OFFSET ${n * 1000}
      `;

      const client = await pool.connect();

      const q = await client.query(query);

      await client.release();

      return from(q.rows);
    }),
    switchMap(o => o),
    share()
  );

  query$.subscribe(
    () => undefined,
    () => undefined,
    async () => {
      await pool.end();
    }
  );

  return query$;
}

createDBThing()
  .pipe(bufferCount(100))
  .subscribe(console.log);

// interval(0)
//   .pipe(take(100))
//   .subscribe(console.log)
// import { Observable } from 'rx';

// const pool = new Pool(database);

// pool.connect()
//   .then(client => {
//   return client;
//   })
//   .then(client => {
//     return client.release()
//   }).then(console.log)

// async function doDBThing(pool) {
//   const client = await pool.connect();

//   const {rows} = await client.query(`select count(*) from users;`);

//   console.log(rows);

//   client.release();
// }

// doDBThing(pool);
