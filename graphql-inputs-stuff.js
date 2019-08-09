import {
    GraphQLInputObjectType,
    GraphQLSchema,
    GraphQLObjectType,
    printSchema,
    GraphQLString
} from "graphql";

const toEcho = new GraphQLInputObjectType({
    name: "ToEchoInput",
    fields: {}
});

const testSchema = new GraphQLSchema({
    types: [
        new GraphQLObjectType({
            name: "MyObject",
            fields: {
                echo: {
                    type: GraphQLString,
                    args: {
                        toEcho: {
                            type: toEcho
                        },
                        toEchoString: { type: GraphQLString }
                    }
                }
            }
        })
    ]
});

console.log(printSchema(testSchema));
