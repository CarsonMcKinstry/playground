echo "Setting up database";
yarn db-migrate up;
for i in {1..10}; do
  node -r esm ./setup.js
done;