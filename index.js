const express = require('express');
const app = express();

app.get('/', (request, response) => {
  response.send('phonebook backend');
});

const port = 3001;
app.listen(port, () => {
  console.log(`Phonebook backend listening to port ${port}`);
});
