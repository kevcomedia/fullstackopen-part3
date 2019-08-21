require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const Person = require('./models/person')
const app = express()

app.use(bodyParser.json())
app.use(
  morgan((tokens, request, response) => {
    const method = tokens.method(request, response)
    const log = [
      method,
      tokens.url(request, response),
      tokens.status(request, response),
      tokens.res(request, response, 'content-length'),
      '-',
      tokens['response-time'](request, response),
      'ms',
    ]

    if (method === 'POST') {
      log.push(JSON.stringify(request.body))
    }

    return log.join(' ')
  }),
)

app.use(express.static('build'))

app.get('/', (request, response) => {
  response.send('phonebook backend')
})

app.get('/info', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      const count =
        persons.length === 1 ? '1 person' : `${persons.length} people`

      const countP = `<p>Phonebook has info for ${count}</p>`
      const requestTimeP = `<p>${new Date()}</p>`
      response.send(`${countP}${requestTimeP}`)
    })
    .catch(next)
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons)
    })
    .catch(next)
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.status(201).json(savedPerson)
    })
    .catch(next)
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(next)
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(next)
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(next)
})

app.use((request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
})

// General error handler
app.use((error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
})

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Phonebook backend listening to port ${port}`)
})
