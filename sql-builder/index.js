function processJoins(baseTable, joins) {
    if (joins.length < 1) {
        return "";
    }

    return joins
        .map(({ type = "", source, target, on }) => {
            const onEntries = Object.entries(on);
            const onStatements = onEntries.map(
                ([sourceField, targetField], i) => {
                    const statement = `${
                        source ? source : baseTable
                    }.${sourceField} = ${target}.${targetField}`;

                    return i > 0 && i < onEntries.length
                        ? `AND ${statement}`
                        : statement;
                }
            );

            return `
                ${type} JOIN ${target} ON
                    ${onStatements.join(" ")}
            `;
        })
        .join("\n");
}

function processWhere(where, startValuesAt = 1) {
    const operatorMap = {
        gt: ">",
        lt: "<",
        gte: ">=",
        lte: "<=",
        eq: "=",
        neq: "!="
    };

    const entries = Object.entries(where);

    let currentValueIndex = startValuesAt;

    const values = entries.reduce((vals, [_, val]) => {
        if (Array.isArray(val)) {
            return vals.concat(val);
        }
        if (typeof val === "object") {
            return vals.concat(Object.values(val));
        }

        return vals.concat(val);
    }, []);

    const statement = entries
        .reduce((statements, [field, val], i) => {
            if (Array.isArray(val)) {
                const nextStatement = `${field} in (${val.map(() => {
                    const index = `$${currentValueIndex}`;

                    currentValueIndex++;

                    return index;
                })})`;

                return statements.concat(nextStatement);
            }
            if (typeof val === "object") {
                const comparisonStatements = Object.entries(val).map(([op]) => {
                    const nextStatement = `${field} ${
                        operatorMap[op]
                    } $${currentValueIndex}`;
                    currentValueIndex++;

                    return nextStatement;
                });
                return statements.concat(comparisonStatements.join(" AND "));
            }

            const nextStatements = statements.concat(
                `${field} = $${currentValueIndex}`
            );

            currentValueIndex++;

            return nextStatements;
        }, [])
        .join(" AND ");

    return {
        statement: `WHERE ${statement}`,
        values
    };
}

/**
 * Returns a function that can be used for reading from a pg database
 * @param {*} client pg client or pool you are making calls to
 */
function get(client) {
    return async function _get(
        from,
        select = "*",
        joins = [],
        where = {},
        limit = 1000
    ) {
        const { statement: whereStatement, values: whereValues } = processWhere(
            where,
            1
        );

        const query = `
            SELECT ${select} FROM ${from}
                ${processJoins(from, joins)}
                ${whereStatement}
            LIMIT ${limit};
        `;

        const { rows } = await client.query(query, whereValues);

        return rows;
    };
}

const client = {
    query: async (query, values) => {
        console.log(query);
        console.log(values);
        return { rows: [] };
    }
};

get(client)(
    "table_one",
    ["column_one", "column_two", "column_three"],
    [
        {
            target: "table_two",
            on: {
                column_one: "column_four",
                column_two: "column_five_six"
            }
        },
        {
            source: "table_two",
            target: "table_three",
            on: {
                column_four: "column_five"
            }
        }
    ],
    {
        column_one: "hello",
        column_two: {
            gt: 1
        },
        column_three: {
            lte: "2019-07-28",
            gte: "2019-07-25"
        },
        column_four: [200, 300]
    }
);
