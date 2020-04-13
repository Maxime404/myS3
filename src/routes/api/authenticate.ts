import { Router, Request, Response } from 'express'
import { isEmpty } from 'lodash'
import { error, success } from '../../core/helpers/response'
import { BAD_REQUEST, CREATED, OK } from '../../core/constants/api'
import jwt from 'jsonwebtoken'

import Association from '../../core/models/Association'
import passport from 'passport'
import Customer from '@/core/models/Customer'
import Rank from '@/core/models/Rank'

const api = Router()

api.post('/signup', async (req: Request, res: Response) => {
  const fields = ['firstName','email', 'password', 'passwordConfirmation']

  try {
    const missings = fields.filter((field: string) => !req.body[field])

    if (!isEmpty(missings)) {
      const isPlural = missings.length > 1
      throw new Error(`Field${isPlural ? 's' : ''} [ ${missings.join(', ')} ] ${isPlural ? 'are' : 'is'} missing`)
    }

    const { firstName, email, password, passwordConfirmation } = req.body

    if (password !== passwordConfirmation) {
      throw new Error("Password doesn't match")
    }

    const customer = new Customer()

    let rank = await Rank.findOne(1)

    customer.firstName = firstName,
    customer.email = email,
    customer.password = password
    customer.rank = rank

    await customer.save()

    const payload = { id: customer.id, firstName }
    const token = jwt.sign(payload, process.env.JWT_ENCRYPTION as string)

    res.status(CREATED.status).json(success(customer, { token }))
  } catch (err) {
    res.status(BAD_REQUEST.status).json(error(BAD_REQUEST, err))
  }
})

// api.post('/signin', async (req: Request, res: Response) => {
//   const authenticate = passport.authenticate('local', { session: false }, (errorMessage, user) => {
//     if (errorMessage) {
//       res.status(BAD_REQUEST.status).json(error(BAD_REQUEST, new Error(errorMessage)))
//       return
//     }

//     const payload = { id: user.id, firstname: user.firstname }
//     const token = jwt.sign(payload, process.env.JWT_ENCRYPTION as string)

//     res.status(OK.status).json(success(user, { token }))
//   })

//   authenticate(req, res)
// })

export default api
