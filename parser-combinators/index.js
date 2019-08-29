// @ts-check
import {
  digits,
  str,
  choice,
  sequenceOf,
  between,
  lazy,
  Parser,
  updateParserError,
  updateParserState
} from './parsers';

const Bit = new Parser(parserState => {
  if (parserState.isError) {
    return parserState;
  }

  const byteOffset = Math.floor(parserState.index / 8);

  if (byteOffset >= parserState.target.byteLength) {
    return updateParserError(parserState, `Bit: Unexpected end of input`);
  }

  const byte = parserState.target.getUint8(byteOffset);

  const bitOffset = 7 - (parserState.index % 8);

  const result = (byte & (1 << bitOffset)) >> bitOffset;

  return updateParserState(parserState, parserState.index + 1, result);
});

const Zero = new Parser(parserState => {
  if (parserState.isError) {
    return parserState;
  }

  const byteOffset = Math.floor(parserState.index / 8);

  if (byteOffset >= parserState.target.byteLength) {
    return updateParserError(parserState, `Zero: Unexpected end of input`);
  }

  const byte = parserState.target.getUint8(byteOffset);

  const bitOffset = 7 - (parserState.index % 8);

  const result = (byte & (1 << bitOffset)) >> bitOffset;

  if (result !== 0) {
    return updateParserError(
      parserState,
      `Zero: expected a zero, but got one instead at index ${parserState.index}`
    );
  }

  return updateParserState(parserState, parserState.index + 1, result);
});

const One = new Parser(parserState => {
  if (parserState.isError) {
    return parserState;
  }

  const byteOffset = Math.floor(parserState.index / 8);

  if (byteOffset >= parserState.target.byteLength) {
    return updateParserError(parserState, `One: Unexpected end of input`);
  }

  const byte = parserState.target.getUint8(byteOffset);

  const bitOffset = 7 - (parserState.index % 8);

  const result = (byte & (1 << bitOffset)) >> bitOffset;

  if (result !== 1) {
    return updateParserError(
      parserState,
      `One: expected a one, but got zero instead at index ${parserState.index}`
    );
  }

  return updateParserState(parserState, parserState.index + 1, result);
});

const parser = sequenceOf(One, One, One, Zero, One, Zero, One, Zero);

const data = new Uint8Array([234, 235]).buffer;
const dataView = new DataView(data);

const res = parser.run(dataView);

console.log(res);

// const betweenBrackets = between(str('('), str(')'));

// const numberParser = digits.map(n => ({
//   type: 'number',
//   value: Number(n)
// }));

// const operatorParser = choice(str('+'), str('-'), str('*'), str('/'));

// const expr = lazy(() => choice(numberParser, operationParser));

// const operationParser = betweenBrackets(
//   sequenceOf(operatorParser, str(' '), expr, str(' '), expr)
// ).map(results => ({
//   type: 'operation',
//   value: {
//     operator: results[0],
//     left: results[2],
//     right: results[4]
//   }
// }));

// const evaluate = node => {
//   if (node.type === 'number') {
//     return node.value;
//   }

//   if (node.type === 'operation') {
//     switch (node.value.operator) {
//       case '+':
//         return evaluate(node.value.left) + evaluate(node.value.right);
//       case '-':
//         return evaluate(node.value.left) - evaluate(node.value.right);
//       case '*':
//         return evaluate(node.value.left) * evaluate(node.value.right);
//       case '/':
//         return evaluate(node.value.left) / evaluate(node.value.right);
//     }
//   }
// };

// const interpreter = program => {
//   const parsedResult = expr.run(program);

//   if (parsedResult.isError) {
//     throw new Error('Invalid program');
//   }

//   return evaluate(parsedResult.result);
// };

// const complexString = '(+ (* 10 2) (- (/ 50 3) 2))';

// console.log(interpreter(complexString));
