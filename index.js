require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const Person = require('./models/person');
const app = express();

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1,
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2,
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3,
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4,
  },
];

app.use(bodyParser.json());
app.use(
  morgan((tokens, request, response) => {
    const method = tokens.method(request, response);
    const log = [
      method,
      tokens.url(request, response),
      tokens.status(request, response),
      tokens.res(request, response, 'content-length'),
      '-',
      tokens['response-time'](request, response),
      'ms',
    ];

    if (method === 'POST') {
      log.push(JSON.stringify(request.body));
    }

    return log.join(' ');
  }),
);

app.use(express.static('build'));

app.get('/', (request, response) => {
  response.send('phonebook backend');
});

app.get('/info', (request, response) => {
  const count = persons.length === 1 ? '1 person' : `${persons.length} people`;

  const countP = `<p>Phonebook has info for ${count}</p>`;
  const requestTimeP = `<p>${new Date()}</p>`;
  response.send(`${countP}${requestTimeP}`);
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  const missingFields = [];
  if (!body.name) {
    missingFields.push('name');
  }
  if (!body.number) {
    missingFields.push('number');
  }

  if (missingFields.length > 0) {
    return response.status(400).json({
      error: 'missing info',
      missingFields,
    });
  }

  if (persons.some((p) => p.name === body.name)) {
    return response.status(400).json({
      error: `${body.name} is already in phonebook`,
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
  };

  persons = persons.concat(person);

  response.status(201).json(person);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);

  response.status(204).end();
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Phonebook backend listening to port ${port}`);
});
