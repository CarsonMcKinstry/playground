// const toEncode = 'hello world';

const SDL = `
  type User {
    id: ID!
    name: String!
  }
`;

// function encode(toEncode) {
//   return Buffer.from(toEncode).toString("base64");
// }

// console.log(encode(SDL));

// function hash(str) {
//   const buf = Buffer.from(str).toString("base64");
//   var hash = 0,
//     i,
//     chr;
//   if (buf.length === 0) return hash;
//   for (i = 0; i < buf.length; i++) {
//     chr = buf.charCodeAt(i);
//     hash = (hash << 5) - hash + chr;
//     hash |= 0; // Convert to 32bit integer
//   }
//   return hash;
// }

// console.log(hash(SDL));
