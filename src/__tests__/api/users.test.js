import { GET } from '@/app/api/users/route'
import { User } from '@/models/User'
import { isAdmin } from '@/libs/isAdmin'

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/models/User', () => ({
  User: {
    find: jest.fn(),
  },
}))

jest.mock('@/libs/isAdmin', () => ({
  isAdmin: jest.fn(),
}))

// ─── fixtures ─────────────────────────────────────────────────────────────────

const USERS = [
  { _id: 'u1', email: 'alice@example.com', name: 'Alice' },
  { _id: 'u2', email: 'bob@example.com', name: 'Bob' },
]

// ─── GET ──────────────────────────────────────────────────────────────────────

describe('GET /api/users', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 when the caller is not an admin', async () => {
    isAdmin.mockResolvedValue(false)

    const res = await GET()

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ error: 'Forbidden' })
    expect(User.find).not.toHaveBeenCalled()
  })

  it('returns all users when the caller is an admin', async () => {
    isAdmin.mockResolvedValue(true)
    User.find.mockResolvedValue(USERS)

    const res = await GET()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(USERS)
    expect(User.find).toHaveBeenCalledTimes(1)
  })
})
