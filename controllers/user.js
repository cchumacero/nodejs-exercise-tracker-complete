import bcrypt from 'bcrypt'
import { Router } from 'express'
import { User } from '../models/User.js'

export const userRouter = Router()

userRouter.post('/', async (req, res) => {
  const { body } = req
  const { username, name, password } = body

  const saltRounds = 10 // la complejidad algoritmica que queres que tarde en encriptar.
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const newUser = new User({
    username,
    name,
    passwordHash
  })
  newUser.save().then(savedUser => {
    res.json(savedUser)
  })
})

/*
userRouter.post('/', async (req, res) => {
  try {
    const { username, name, password } = req.body
    console.log('Received request data:', username, name, password)

    if (!username || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const newUser = new User({
      username,
      name,
      passwordHash: password
    })

    const savedUser = await newUser.save()
    console.log('User saved:', savedUser)

    res.status(201).json(savedUser)
  } catch (err) {
    console.error('Error creating user:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})
*/
userRouter.get('/', (req, res) => {
  User.find().then(users => {
    res.json(users)
  })
})
