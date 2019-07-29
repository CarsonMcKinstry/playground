let arr = [...Array(100)].map((_, i) => i);

const nextArr = [...Array(100)].map((_, i) => i);

arr = arr.concat(nextArr);

console.log(JSON.stringify(arr, null, 2));
