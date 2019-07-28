import faker from "faker";
import { Pool } from "pg";
import database from "./database.json";
const {
  dev: { driver, ...dev }
} = database;

const pool = new Pool(dev);

function makeUser() {
  return {
    name: faker.name.findName(),
    age: Math.floor(Math.random() * 25 + 18)
  };
}

function makePost(id) {
  return {
    posted_by: id,
    edited_by: id,
    title: faker.random.words(faker.random.number(7) + 3),
    body: faker.lorem.paragraphs(3)
  };
}

// const usersArray = [...Array(100000)].map(makeUser);

// const postsArray = usersArray.reduce((posts, { id }) => {
//   const numPosts = Math.floor(Math.random() * 25);

//   return posts.concat([...Array(numPosts)].map(() => makePost(id)));
// }, []);

const doThing = async () => {
  const client = await pool.connect();

  // console.log(client);
  await client.query("BEGIN;");
  // const r = await client.query("SELECT * from users;");
  // console.log(r);
  let count = 0;
  const usersArray = [...Array(faker.random.number(5000))]
    .map(makeUser)
    .map(({ name, age }) =>
      client.query(
        `INSERT INTO users(name, age) values ($1, $2) returning id;`,
        [name, age]
      )
    );

  const usersResponse = await Promise.all(usersArray).then(rs =>
    rs.map(({ rows: [row] }) => row)
  );

  const postsArray = usersResponse.reduce((posts, { id }) => {
    const numPosts = faker.random.number(25);

    return posts.concat(
      [...Array(numPosts)]
        .map(() => makePost(id))
        .map(({ posted_by, edited_by, title, body }) =>
          client.query(
            `
      INSERT INTO posts(posted_by, edited_by, title, body) values ($1, $2, $3, $4)
    `,
            [posted_by, edited_by, title, body]
          )
        )
    );
  }, []);

  const postsResponse = await Promise.all(postsArray).then(res => {
    return res.reduce(acc => {
      return acc + 1;
    }, 0);
  });

  console.log(postsResponse);

  // const usersQuery = `INSERT INTO users(name, age) values ${usersArray.map(
  //   (_, i) => {
  //     count++;
  //     return `($${i + count}, $${i + count + 1})`;
  //   }
  // )} returning id;`;
  // count = 1;
  // const { rows: userRows } = await client.query(
  //   usersQuery,
  //   usersArray.reduce((r, { name, age }) => r.concat(name, age), [])
  // );

  // const postsArray = userRows.reduce((posts, { id }) => {
  //   const numPosts = Math.floor(Math.random() * 25);

  //   return posts.concat([...Array(numPosts)].map(() => makePost(id)));
  // }, []);

  // const postsQuery = `INSERT INTO posts(posted_by, edited_by, title, body) values ${postsArray.map(
  //   (_, i) => {
  //     const intermediate = `($${i + count}, $${i + count + 1}, $${i +
  //       count +
  //       2}, $${i + count + 3})`;
  //     count += 3;
  //     return intermediate;
  //   }
  // )}`;

  // const { rowCount: numPosts } = await client.query(
  //   postsQuery,
  //   postsArray.reduce((r, { posted_by, edited_by, title, body }) => {
  //     return r.concat(posted_by, edited_by, title, body);
  //   }, [])
  // );

  await client.query("commit;");
  await client.release();
  // const usersArray = [...Array(10)].map(makeUser);
  // console.log(usersArray);
  // .map(({ name, age }) => {
  //   return client.query(
  //     `
  //       INSERT INTO users (name, age)
  //         VALUES($1, $2);
  //     `,
  //     [name, age]
  //   );
  // });

  // console.log(usersArray);

  // const newUsers = await Promise.all(usersArray).then(users => {
  //   return users.map(({ rows: [user] }) => user);
  // });

  // console.log(newUsers);

  // await client.query("ROLLBACK;");
};

doThing();
