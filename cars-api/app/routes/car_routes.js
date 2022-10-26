// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Car = require('../models/car')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// Create
// /car
//required token removed for now
router.post('/cars', requireToken , (req, res, next) => {
    req.body.car.owner = req.user.id

    // one the front end I HAVE TO SEND a pet as the top level key
    // pet: {name: '', type: ''}
    Car.create(req.body.car)
    .then(car => {
        res.status(201).json({ car: car })
    })
    .catch(next)
    // .catch(error => next(error))

})


// INDEX
// GET /examples
//required token removed for now
// router.get('/cars', (req, res, next) => {
// 	Car.find()
// 		.then((cars) => {
// 			// `examples` will be an array of Mongoose documents
// 			// we want to convert each one to a POJO, so we use `.map` to
// 			// apply `.toObject` to each one
// 			return cars.map((car) => car.toObject())
// 		})
// 		// respond with status 200 and JSON of the examples
// 		.then((cars) => res.status(200).json({ cars: cars }))
// 		// if an error occurs, pass it to the handler
// 		.catch(next)
// })


module.exports = router