// @ts-check

const updateParserState = (state, index, result) => ({
  ...state,
  index,
  result
});

const updateParserResult = (state, result) => ({
  ...state,
  result
});

const updateParserError = (state, message) => ({
  ...state,
  isError: true,
  error: message
});

class Parser {
  constructor(parserStateTransformerFn) {
    this.parserStateTransformerFn = parserStateTransformerFn;
  }

  run(targetString) {
    const initalState = {
      targetString,
      index: 0,
      result: null,
      isError: false,
      error: null
    };
    return this.parserStateTransformerFn(initalState);
  }

  map(fn) {
    return new Parser(parserState => {
      const nextState = this.parserStateTransformerFn(parserState);
      if (nextState.isError) return nextState;
      return updateParserResult(nextState, fn(nextState.result));
    });
  }

  chain(fn) {
    return new Parser(parserState => {
      const nextState = this.parserStateTransformerFn(parserState);
      if (nextState.isError) return nextState;

      const nextParser = fn(nextState.result);

      // return updateParserResult(nextState, fn(nextState.result));

      return nextParser.parserStateTransformerFn(nextState);
    });
  }

  mapError(fn) {
    return new Parser(parserState => {
      const nextState = this.parserStateTransformerFn(parserState);
      if (!nextState.isError) return nextState;
      return updateParserResult(
        nextState,
        fn(nextState.error, nextState.index)
      );
    });
  }
}

const str = s =>
  new Parser(parserState => {
    const { targetString, index, isError } = parserState;

    if (isError) return parserState;

    const slicedTarget = targetString.slice(index);

    if (slicedTarget.length === 0) {
      return updateParserError(
        parserState,
        `str: Tried to match ${s}, but got unexepected end of input.`
      );
    }

    if (slicedTarget.startsWith(s)) {
      return updateParserState(parserState, index + s.length, s);
    }

    return updateParserError(
      parserState,
      `str: Tried to match ${s}, but got ${targetString.slice(
        index,
        index + 10
      )}`
    );
  });

const lettersRegex = /^[A-Za-z]+/;
const letters = new Parser(parserState => {
  const { targetString, index, isError } = parserState;

  if (isError) return parserState;

  const slicedTarget = targetString.slice(index);

  if (slicedTarget.length === 0) {
    return updateParserError(
      parserState,
      `letters: Got unexepected end of input.`
    );
  }

  const regexMatch = slicedTarget.match(lettersRegex);

  if (regexMatch) {
    return updateParserState(
      parserState,
      index + regexMatch[0].length,
      regexMatch[0]
    );
  }

  return updateParserError(
    parserState,
    `str: Tried to match letters, at index ${index}`
  );
});

const digitsRegex = /^[0-9]+/;
const digits = new Parser(parserState => {
  const { targetString, index, isError } = parserState;

  if (isError) return parserState;

  const slicedTarget = targetString.slice(index);

  if (slicedTarget.length === 0) {
    return updateParserError(
      parserState,
      `digits: Got unexepected end of input.`
    );
  }

  const regexMatch = slicedTarget.match(digitsRegex);

  if (regexMatch) {
    return updateParserState(
      parserState,
      index + regexMatch[0].length,
      regexMatch[0]
    );
  }

  return updateParserError(
    parserState,
    `str: Tried to match digits, at index ${index}`
  );
});

const sequenceOf = (...parsers) =>
  new Parser(parserState => {
    if (parserState.isError) {
      return parserState;
    }
    const results = [];

    let nextState = parserState;

    for (let p of parsers) {
      nextState = p.parserStateTransformerFn(nextState);
      results.push(nextState.result);
    }

    return updateParserResult(nextState, results);
  });

const choice = (...parsers) =>
  new Parser(parserState => {
    if (parserState.isError) {
      return parserState;
    }

    let nextState = parserState;

    for (let p of parsers) {
      nextState = p.parserStateTransformerFn(parserState);
      if (!nextState.isError) {
        return nextState;
      }
    }

    return updateParserError(
      parserState,
      `choice: Unable to match with any parser at index ${parserState.index}`
    );
  });

const many = parser =>
  new Parser(parserState => {
    if (parserState.isError) {
      return parserState;
    }
    let nextState = parserState;
    const results = [];
    let done = false;
    while (!done) {
      const testState = parser.parserStateTransformerFn(nextState);

      if (!testState.isError) {
        results.push(testState.result);
        nextState = testState;
      } else {
        done = true;
      }
    }

    return updateParserResult(nextState, results);
  });

const many1 = parser =>
  new Parser(parserState => {
    if (parserState.isError) {
      return parserState;
    }
    let nextState = parserState;
    const results = [];
    let done = false;
    while (!done) {
      const testState = parser.parserStateTransformerFn(nextState);

      if (!testState.isError) {
        results.push(testState.result);
        nextState = testState;
      } else {
        done = true;
      }
    }

    if (results.length < 1) {
      return updateParserError(nextState, `many1: Unable to match any parser`);
    }

    return updateParserResult(nextState, results);
  });

const between = (left, right) => content =>
  sequenceOf(left, content, right).map(([, result]) => result);

// const parser = sequenceOf(str('hello there!'), str('goodbye there!'));
const betweenBrackers = between(str('('), str(')'));

const stringParser = letters.map(result => ({ type: 'string', value: result }));
const numberParser = digits.map(result => ({
  type: 'number',
  value: Number(result)
}));

const dicerollParser = sequenceOf(digits, str('d'), digits).map(([n, , s]) => ({
  type: 'diceroll',
  value: [Number(n), Number(s)]
}));

const parser = sequenceOf(letters, str(':'))
  .map(results => results[0])
  .chain(type => {
    switch (type) {
      case 'string': {
        return stringParser;
      }
      case 'number': {
        return numberParser;
      }
      case 'diceroll': {
        return dicerollParser;
      }
    }
  });

console.log(parser.run('string:hello'));
console.log(parser.run('number:42'));
console.log(parser.run('diceroll:2d4'));
