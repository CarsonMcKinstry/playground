function tag(...everything) {
  console.log(everything);
}

tag`hello my name is... ${{ i: "am", an: "object" }}`;
