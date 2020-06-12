import { Router, Request, Response } from 'express'
import { isEmpty } from 'lodash'
import { error, success } from '../../../core/helpers/response'
import { BAD_REQUEST, CREATED, OK } from '../../../core/constants/api'
import jwt from 'jsonwebtoken'
import Customer from '@/core/models/Customer'
import Rank from '@/core/models/Rank'

const api = Router()

api.post('/', async (req: Request, res: Response) => {
  const fields = ['firstname','lastname','gender','email', 'password', 'passwordConfirmation']

  try {
    const missings = fields.filter((field: string) => !req.body[field])

    if (!isEmpty(missings)) {
      const isPlural = missings.length > 1
      throw new Error(`Field${isPlural ? 's' : ''} [ ${missings.join(', ')} ] ${isPlural ? 'are' : 'is'} missing`)
    }

    const { firstname,lastname, email,gender,password, passwordConfirmation } = req.body

    if (password !== passwordConfirmation) {
      throw new Error("Password doesn't match")
    }

    const customer = new Customer()
    let rank = await Rank.findOne(1)

    customer.firstname = firstname,
    customer.lastname = lastname,
    customer.email = email,
    customer.gender = gender
    customer.password = password
    customer.rank = rank

    await customer.save()

    const payload = { id: customer.id, firstname }
    const token = jwt.sign(payload, process.env.JWT_ENCRYPTION as string)

    res.status(CREATED.status).json(success(customer, { token }))
  } catch (err) {
    res.status(BAD_REQUEST.status).json(error(BAD_REQUEST, err))
  }
})

api.put('/:id', async (req: Request, res: Response) => {

  const fields = ['firstname','lastname','note','rank','geolocalisation']
  try {
    const { id } = req.params
    const missings = fields.filter((field: string) => !req.body[field])

    if (!isEmpty(missings)) {
      const isPlural = missings.length > 1
      throw new Error(`Field${isPlural ? 's' : ''} [ ${missings.join(', ')} ] ${isPlural ? 'are' : 'is'} missing`)
    }
    const {firstname,lastname,note,rank,geolocalisation,latitude, longitiude } = req.body
    const customer = await Customer.findOne(id)
    let custoRank = await Rank.findOne(rank as number)
    if (customer){
      customer.firstname = firstname,
      customer.lastname = lastname,
      customer.note= lastname,
      customer.rank = custoRank
      customer.longitude = longitiude
      customer.latitude = latitude
      customer.geocalisation= geolocalisation
      await customer.save()
      res.status(OK.status).json(success(customer))
    }
    else {
      res.status(BAD_REQUEST.status).json( {'err':'association inexistante'})
    }
  
  } catch (err) {
    res.status(BAD_REQUEST.status).json(error(BAD_REQUEST, err))
  }
})





api.get('/', async (req: Request, res: Response) => {
  try {
    const customers = await Customer.find({ relations: ["rank","tickets"] })
    res.status(CREATED.status).json(success(customers))
  } catch (err) {
    res.status(BAD_REQUEST.status).json(error(BAD_REQUEST, err))
  }
})

api.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await Customer.findOne(id,{ relations: ["rank","tickets"] })
    res.status(CREATED.status).json(success(user))
  } catch (err) {
    res.status(BAD_REQUEST.status).json(error(BAD_REQUEST, err))
  }
})

export default api