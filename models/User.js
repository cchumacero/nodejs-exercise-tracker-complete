import { Schema, model } from 'mongoose'

// SCHEMAs
const userSchema = new Schema({
  username: String,
  name: String,
  passwordHash: String,
  exercises: [{
    type: Schema.Types.ObjectId,
    ref: 'Exercise'
  }]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject._v
    delete returnedObject.passwordHash
  }
})

// MODELS
export const User = model('User', userSchema)
