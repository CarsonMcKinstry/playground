import {
    graphql,
    GraphQLScalarType,
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLList,
    GraphQLID,
    GraphQLString,
    GraphQLBoolean,
    GraphQLSchema,
    printSchema,
    buildSchema,
    isSpecifiedScalarType,
    extendSchema,
    parse
} from "graphql";
import {
    makeExecutableSchema,
    buildSchemaFromTypeDefinitions,
    mergeSchemas
} from "graphql-tools";
import gql from "graphql-tag";

const _typeDefs = `
    type Todo {
        id: Int!
        task: String!
        done: Boolean!
        ownedBy: User!
    }

    type User {
        id: Int!
        name: String!
        todos: [Todo!]!
    }
`;

const baseSchema = buildSchema(_typeDefs);
const baseTypeMap = baseSchema.getTypeMap();

const objectTypes = Object.values(baseTypeMap).filter(type => {
    if (type.name.startsWith("__")) {
        return false;
    }

    return !isSpecifiedScalarType(type);
});

const queryResolver = {};
const queryTypes = [];

objectTypes.forEach(type => {
    const name = type.name;
    // console.log(name);

    // generate resolvers for things
    // const fields = Object.values(type.getFields());
    // const needResolvers = fields.filter(
    //     field => !isSpecifiedScalarType(field.type.ofType)
    // );

    const inputs = {
        unique: new GraphQLInputObjectType({
            name: `${name}WhereUniqueInput`,
            fields: {
                id: {
                    type: GraphQLNonNull(GraphQLInt)
                }
            }
        })
    };

    // console.log(inputs[name].unique);

    queryResolver[`get${name}`] = (parent, args, context) => {
        const tableName = pluralize(name.toLowerCase());
        return context[tableName].find(item => item.id === args.id);
    };

    const query = new GraphQLObjectType({
        name: "Query",
        fields: () => ({
            [`get${name}`]: {
                type,
                args: {
                    where: {
                        type: inputs.unique
                    }
                }
            }
        })
    });

    queryTypes.push([query, inputs]);
});

// console.log(queryResolver);
// console.log(queryTypes);

// const s = new GraphQLSchema({
//     query: queryTypes[0]
// });

// const

// console.log(printSchema(s));

// const s = new GraphQLSchema({
//     query: queryTypes[0]
// });

// console.log(printSchema(s));

const transformedQueryTypes = queryTypes.map(([query, inputs]) => {
    const s = new GraphQLSchema({ query, types: Object.values(inputs) });

    return s;
});

const s = mergeSchemas({
    schemas: transformedQueryTypes
});

console.log(printSchema(s));

// const schema = extendSchema(baseSchema, parse(printSchema(s)));

// const everything = objectTypes.reduce((e, type) => {
//     const { name } = type;
//     const fields = Object.values(type.getFields());

//     console.log()

// }, {
//     typeDefs: [],
//     resolvers: {}
// })

// // const typeDefs = gql`
// //     scalar DateTime

// //     type Todo {
// //         id: Int!
// //         task: String!
// //         done: Boolean!
// //         createdAt: DateTime!
// //         completedAt: DateTime
// //     }

// //     type Query {
// //         getTodo(id: ID!): Todo
// //     }

// //     type Mutation {
// //         createTodo(task: String!, createdAt: DateTime): Todo!
// //     }
// // `;

// // const baseSchema =

// const DateTime = new GraphQLScalarType({
//     name: "DateTime",
//     serialize: value => {
//         return new Date(value * 1000);
//     },
//     parseLiteral: ({ value }) => {
//         return Math.floor(new Date(value) / 1000);
//     },
//     parseValue: value => {
//         return new Date(value * 1000);
//     }
// });

// const Todo = new GraphQLObjectType({
//     name: "Todo",
//     fields: {
//         id: {
//             type: GraphQLNonNull(GraphQLID)
//         },
//         task: {
//             type: GraphQLNonNull(GraphQLString)
//         },
//         done: {
//             type: GraphQLNonNull(GraphQLBoolean)
//         },
//         createdAt: {
//             type: GraphQLNonNull(DateTime)
//         },
//         completedAt: {
//             type: DateTime
//         }
//     }
// });

// const Query = new GraphQLObjectType({
//     name: "Query",
//     fields: () => ({
//         getTodo: {
//             type: Todo,
//             args: {
//                 id: {
//                     type: GraphQLNonNull(GraphQLID)
//                 }
//             }
//         }
//     })
// });

// const typeDefs = new GraphQLSchema({
//     query: Query,
//     types: [Todo]
// });

// // console.log(printSchema(schema));

// const todos = [
//     {
//         id: 1,
//         task: "Learn GraphQL",
//         done: false,
//         createdAt: 1565341789
//     },
//     {
//         id: 2,
//         task: "Learn React",
//         done: true,
//         createdAt: 1565341789,
//         completedAt: 1565381438
//     }
// ];

// const resolvers = {
//     Query: {
//         getTodo: (root, args, context, info) => {
//             return context.todos.find(
//                 todo => parseInt(args.id, 10) === todo.id
//             );
//         }
//     },
//     // Mutation: {
//     //     createTodo: (root, args, context) => {
//     //         const { todos } = context;
//     //         const todo = {
//     //             id: todos.length + 1,
//     //             task: args.task,
//     //             done: false,
//     //             createdAt: args.createdAt || Math.floor(new Date() / 1000)
//     //         };

//     //         todos.push(todo);

//     //         return todo;
//     //     }
//     // },
//     DateTime: new GraphQLScalarType({
//         name: "DateTime",
//         serialize: value => {
//             return new Date(value * 1000);
//         },
//         parseLiteral: ({ value }) => {
//             return Math.floor(new Date(value) / 1000);
//         },
//         parseValue: value => {
//             return new Date(value * 1000);
//         }
//     })
// };

// const query = `
//     query {
//         getTodo(id: 1) {
//             id
//             task
//             done
//             createdAt
//             completedAt
//         }
//     }
// `;

// const newDate = new Date();

// // // console.log(new Date(newDate.toISOString()));

// // const query = `
// //     mutation {
// //         createTodo(task: "Learn Melody", createdAt: "${newDate.toISOString()}") {
// //             id
// //             task
// //             done
// //             createdAt
// //         }
// //     }
// // `;

// // console.log(typeDefs);

// const schema = makeExecutableSchema({
//     typeDefs: printSchema(typeDefs),
//     resolvers
// });

// // const schema = buildSchemaFromTypeDefinitions(typeDefs);

// graphql(schema, query, null, { todos }).then(() => {
//     console.log(todos);
// });

// // // const d = new Date(1565341789 * 1000);

// // // console.log(d.toISOString());
