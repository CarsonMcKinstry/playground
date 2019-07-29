import { openDB } from "idb";
import faker from "faker";
import uuid from "uuid/v4";
import { objectType, queryField, makeSchema } from "nexus";
// const dbRequest = openDB("my-database", 1, {
//   upgrade: upgradeDB => {
//     const users = upgradeDB.createObjectStore("users", {
//       keyPath: "id"
//     });
//     const posts = upgradeDB.createObjectStore("posts", {
//       keyPath: "id"
//     });
//     posts.createIndex("postedBy", "postedBy");

//     let requests = [];

//     for (let i = 0; i < 100; i++) {
//       const user = {
//         id: uuid(),
//         name: faker.name.findName()
//       };

//       const newPosts = [...Array(Math.floor(Math.random() * 25))].map(() =>
//         posts.add({
//           id: uuid(),
//           title: faker.random.words(5),
//           postedBy: user.id
//         })
//       );

//       requests.push(users.add(user));
//       requests = requests.concat(newPosts);
//     }

//     Promise.all(requests).then(() => {
//       console.log("done");
//     });
//   }
// });

const User = objectType({
  name: "User",
  definition(t) {
    t.id("id", {
      nullable: false
    });
    t.string("name", {
      nullable: false
    });
    t.field("posts", {
      type: "Post",
      list: [true]
    });
  }
});

const Post = objectType({
  name: "Post",
  definition(t) {
    t.id("id", {
      nullable: false
    });
    t.string("title", {
      nullable: false
    });
    t.field("postedBy", {
      nullable: false
    });
  }
});

const schema = makeSchema({
  types: [User, Post],
  outputs: false
});
