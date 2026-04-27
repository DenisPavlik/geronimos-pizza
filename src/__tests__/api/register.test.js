import { POST } from '@/app/api/register/route'
import { User } from '@/models/User'
import bcrypt from 'bcrypt'

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/models/User', () => ({
  User: {
    create: jest.fn(),
  },
}))

jest.mock('bcrypt', () => ({
  genSaltSync: jest.fn().mockReturnValue('fake_salt'),
  hashSync: jest.fn().mockReturnValue('hashed_password'),
}))

function makeRequest(body) {
  return { json: jest.fn().mockResolvedValue(body) }
}

describe('POST /api/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 201 and the created user on success', async () => {
    const fakeUser = { _id: '123', email: 'test@example.com' }
    User.create.mockResolvedValue(fakeUser)

    const res = await POST(makeRequest({ email: 'test@example.com', password: 'password123' }))

    expect(res.status).toBe(201)
    expect(await res.json()).toEqual(fakeUser)
  })

  it('hashes the password and never saves plaintext', async () => {
    User.create.mockResolvedValue({ _id: '123', email: 'test@example.com' })

    await POST(makeRequest({ email: 'test@example.com', password: 'plaintext' }))

    expect(bcrypt.hashSync).toHaveBeenCalledWith('plaintext', 'fake_salt')
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'hashed_password' })
    )
  })

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeRequest({ password: 'password123' }))

    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: 'Invalid email address' })
  })

  it('returns 400 for an invalid email format', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email', password: 'password123' }))

    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: 'Invalid email address' })
  })

  it('returns 400 when password is missing', async () => {
    const res = await POST(makeRequest({ email: 'test@example.com' }))

    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: 'Password must be at least 5 characters' })
  })

  it('returns 400 when password is shorter than 5 characters', async () => {
    const res = await POST(makeRequest({ email: 'test@example.com', password: 'abc' }))

    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: 'Password must be at least 5 characters' })
  })

  it('returns 409 when the email is already registered', async () => {
    const err = Object.assign(new Error('duplicate key'), { code: 11000 })
    User.create.mockRejectedValue(err)

    const res = await POST(makeRequest({ email: 'existing@example.com', password: 'password123' }))

    expect(res.status).toBe(409)
    expect(await res.json()).toMatchObject({ error: 'Email already registered' })
  })

  it('returns 500 on an unexpected database error', async () => {
    User.create.mockRejectedValue(new Error('connection lost'))

    const res = await POST(makeRequest({ email: 'test@example.com', password: 'password123' }))

    expect(res.status).toBe(500)
    expect(await res.json()).toMatchObject({ error: 'Something went wrong' })
  })
})
