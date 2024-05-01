import 'dotenv/config.js' // sirve para poder usar .env en este proyecto - versión ES6 modules
import express, { json } from 'express' // require -> commonJS
import cors from 'cors'
import { Exercise } from './models/Exercise.js'
import { User } from './models/User.js'
import { userRouter } from './controllers/user.js'
import bodyParser from 'body-parser'
import './database.js'
import { loginRouter } from './controllers/login.js'
import jwt from 'jsonwebtoken'
import userExtractor from './middlewares/userExtractor.js'

const app = express()
app.use(json())
app.use(cors('*'))

app.use(express.static('public'))

app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html')
})

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)

app.post('/api/users/:_id/exercises', userExtractor, async (req, res) => {
  const { description } = req.body
  const duration = parseInt(req.body.duration)
  const userId = req.params._id
  /*
  const authorization = req.get('authorization')
  let token = null
  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    token = authorization.substring(7)
  }

  let decodedToken = {}
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch { }

  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }
  */
  let date
  if (req.body.date) {
    date = (new Date(req.body.date)).toDateString()
  } else {
    date = (new Date()).toDateString()
  }
  User.findById(userId).then((foundUser) => {
    const newExercise = new Exercise({
      user_id: foundUser._id,
      description,
      duration,
      date
    })
    newExercise.save().then((savedExercise) => {
      foundUser.exercises = foundUser.exercises.concat(savedExercise._id)
      foundUser.save()
      res.json({
        _id: foundUser._id,
        username: foundUser.username,
        description: savedExercise.description,
        duration: savedExercise.duration,
        date: savedExercise.date
      })
    }).catch((err) => {
      console.log(err)
      res.send('No se pudo guardar el ejercicio!')
    })
  }).catch((error) => {
    console.log(error)
    res.send('User not found!')
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  const { from, to, limit } = req.query
  const userId = req.params._id

  User.findById(userId).then((foundUser) => {
    const dateObj = {}
    if (from) { dateObj.$gte = new Date(from) }
    if (to) { dateObj.$lte = new Date(to) }
    const filter = { user_id: userId }
    if (from || to) { filter.date = dateObj }

    Exercise.find(filter).limit(+limit ?? 999).then((filteredExercises) => {
      const log = filteredExercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      }))
      res.json({
        username: foundUser.username,
        count: filteredExercises.length,
        _id: foundUser._id,
        log
      })
    })
  }).catch(error => {
    console.log(error)
    res.send('User not found!')
  })
  /*
  const user = await User.findById(id)

  if (!user) {
    res.send('User not found!')
  }

  const dateObj = {}
  if (from) {
    dateObj.$gte = new Date(from)
  }
  if (to) {
    dateObj.$lte = new Date(to)
  }
  const filter = {
    user_id: id
  }
  if (from || to) {
    filter.date = dateObj
  }

  const filteredExercises = await Exercise.find(filter).limit(+limit ?? 999)
  const log = filteredExercises.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  }))
  res.json({
    username: user.username,
    count: filteredExercises.length,
    _id: user._id,
    log
  })
  */
})

// app.use('/api/users', usersRouter)

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
