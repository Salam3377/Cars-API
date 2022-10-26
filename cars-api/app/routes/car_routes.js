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


// Index
// cars
router.get('/cars', requireToken, (req, res, next) => {
    Car.find()
        .then(cars => {
            return cars.map(car => car)
        })
        .then(cars =>  {
            res.status(200).json({ cars: cars })
        })
        .catch(next)
})

//Show
// /cars/:id
router.get('/cars/:id', requireToken, (req, res, next) => {
    Car.findById(req.params.id)
    .then(handle404)
    .then(car => {
        res.status(200).json({ car: car })
    })
    .catch(next)
})


// Create
// /car
router.post('/cars', requireToken , (req, res, next) => {
    req.body.car.owner = req.user.id
    Car.create(req.body.car)
    .then(car => {
        res.status(201).json({ car: car })
    })
    .catch(next)


})


// UPDATE
// PATCH 
router.patch('/cars/:id', requireToken, removeBlanks, (req, res, next) => {
	delete req.body.car.owner
	Car.findById(req.params.id)
		.then(handle404)
		.then((car) => {
			requireOwnership(req, car)
			return car.updateOne(req.body.car)
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})

// DESTROY
// DELETE /
router.delete('/cars/:id', requireToken, (req, res, next) => {
	Car.findById(req.params.id)
		.then(handle404)
		.then((car) => {
			// throw an error if current user doesn't own `example`
			requireOwnership(req, car)
			// delete the example ONLY IF the above didn't throw
		    car.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})




module.exports = router