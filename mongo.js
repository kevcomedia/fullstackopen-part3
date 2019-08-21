const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('missing password')
  process.exit(1)
}

const password = process.argv[2]
const mongodbUrl = `mongodb+srv://fullstack:${password}@cluster0-t9bkr.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(mongodbUrl, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length < 5) {
  // Display all phonebook entries
  Person.find({}).then((persons) => {
    console.log('phonebook:')
    persons.forEach((person) => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else {
  // Add phonebook entry
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({ name, number })
  person.save().then((result) => {
    console.log(`added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  })
}
