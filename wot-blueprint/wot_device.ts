const express = require('express');

const app = express();
const paths = ['/temperature', '/state']; // Replace this with your list of paths

for (const path of paths) {
  app.get(path, (req, res) => {
    res.send(`This is ${path}`);
  });
}

const PORT = 3000; // Replace with the port you want to use
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
