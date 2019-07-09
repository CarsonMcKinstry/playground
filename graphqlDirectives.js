// // import { buildSchema } from "graphql";
// import path from "path";
// import {
//   extendType,
//   makeSchema,
//   queryType,
//   queryField,
//   stringArg
// } from "nexus";

// const Query = queryType({
//   definition(t) {
//     t.string("echo");
//   }
// });

// const echoField = extendType({
//   type: Query,
//   definition(t) {
//     t.decorateField({
//       name: "echo",
//       args: {
//         in: stringArg()
//       },
//       resolve: (_, args) => args.in
//     });
//   }
// });

// const schema = makeSchema({
//   types: [Query, echoField],
//   outputs: {
//     schema: path.join(__dirname, "./generated/schema.gql")
//   }
// });
import { buildSchema } from "graphql";

const sdl = `
  type User {
    id: ID! @keypath
    name: String! @indexed
  }
`;

const schema = sdl =>
  buildSchema(
    sdl +
      `
  directive @keypath on FIELD_DEFINITION
  directive @indexed on FIELD_DEFINITION
`
  );

console.log(
  schema(sdl)
    .getType("User")
    .getFields()
);
