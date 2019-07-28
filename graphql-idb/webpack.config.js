module.exports = {
  entry: "./index.js",
  devServer: {
    contentBase: path.join(__dirname),
    compress: true,
    port: 3000
  }
};
