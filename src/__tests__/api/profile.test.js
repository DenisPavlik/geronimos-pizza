import { GET, PUT } from '@/app/api/profile/route'
import { User } from '@/models/User'
import { UserInfo } from '@/models/UserInfo'
import { isAdmin } from '@/libs/isAdmin'
import { getServerSession } from 'next-auth'

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/libs/authOptions', () => ({
  authOptions: {},
}))

jest.mock('@/models/User', () => ({
  User: {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  },
}))

jest.mock('@/models/UserInfo', () => ({
  UserInfo: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}))

jest.mock('@/libs/isAdmin', () => ({
  isAdmin: jest.fn(),
}))

// ─── shared fixtures ──────────────────────────────────────────────────────────

const SESSION = { user: { email: 'user@example.com' } }

const USER_DOC = {
  _id: 'u1',
  email: 'user@example.com',
  name: 'Test User',
}

const USER_INFO_DOC = {
  email: 'user@example.com',
  phone: '123456789',
  city: 'Kyiv',
  admin: false,
}

// GET uses .lean() chaining; returns { lean: () => Promise<doc> }
function mockFindOneLean(doc) {
  return { lean: jest.fn().mockResolvedValue(doc) }
}

function makeGetRequest(search = '') {
  return { url: `http://localhost/api/profile${search}` }
}

function makePutRequest(body) {
  return { json: jest.fn().mockResolvedValue(body) }
}

// ─── GET ──────────────────────────────────────────────────────────────────────

describe('GET /api/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns merged user + userInfo for an authenticated user', async () => {
    getServerSession.mockResolvedValue(SESSION)
    User.findOne.mockReturnValue(mockFindOneLean(USER_DOC))
    UserInfo.findOne.mockReturnValue(mockFindOneLean(USER_INFO_DOC))

    const res = await GET(makeGetRequest())

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toMatchObject({
      email: 'user@example.com',
      name: 'Test User',
      phone: '123456789',
      city: 'Kyiv',
    })
  })

  // The route returns {} with 200 when there is no session — it does NOT return 401.
  // Only PUT returns 401 for unauthenticated requests.
  it('returns 200 with empty object (not 401) when there is no session', async () => {
    getServerSession.mockResolvedValue(null)

    const res = await GET(makeGetRequest())

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({})
  })

  it('returns user by _id without requiring a session', async () => {
    User.findOne.mockReturnValue(mockFindOneLean(USER_DOC))
    UserInfo.findOne.mockReturnValue(mockFindOneLean(USER_INFO_DOC))

    const res = await GET(makeGetRequest('?_id=u1'))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toMatchObject({ _id: 'u1', email: 'user@example.com' })
    // no auth check should happen for _id lookups
    expect(getServerSession).not.toHaveBeenCalled()
  })

  it('returns {} when the user document is not found', async () => {
    getServerSession.mockResolvedValue(SESSION)
    User.findOne.mockReturnValue(mockFindOneLean(null))

    const res = await GET(makeGetRequest())

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({})
  })
})

// ─── PUT ──────────────────────────────────────────────────────────────────────

describe('PUT /api/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    User.updateOne.mockResolvedValue(undefined)
    UserInfo.findOneAndUpdate.mockResolvedValue(undefined)
  })

  it('returns 401 when there is no session', async () => {
    getServerSession.mockResolvedValue(null)

    const res = await PUT(makePutRequest({ name: 'New Name' }))

    expect(res.status).toBe(401)
    expect(await res.json()).toMatchObject({ error: 'Unauthorized' })
    expect(User.updateOne).not.toHaveBeenCalled()
  })

  it('updates own profile and returns true', async () => {
    getServerSession.mockResolvedValue(SESSION)
    User.findOne.mockResolvedValue(USER_DOC)

    const res = await PUT(makePutRequest({ name: 'Updated Name', phone: '999' }))

    expect(res.status).toBe(200)
    expect(await res.json()).toBe(true)
    expect(User.updateOne).toHaveBeenCalledWith(
      { email: 'user@example.com' },
      { name: 'Updated Name', image: undefined }
    )
    expect(UserInfo.findOneAndUpdate).toHaveBeenCalledWith(
      { email: 'user@example.com' },
      { phone: '999' },
      { upsert: true }
    )
  })

  it('returns 403 when a non-admin tries to update another user by _id', async () => {
    getServerSession.mockResolvedValue(SESSION)
    isAdmin.mockResolvedValue(false)

    const res = await PUT(makePutRequest({ _id: 'other-id', name: 'Hacked' }))

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ error: 'Forbidden' })
    expect(User.updateOne).not.toHaveBeenCalled()
  })

  it('allows an admin to update another user by _id', async () => {
    getServerSession.mockResolvedValue(SESSION)
    isAdmin.mockResolvedValue(true)
    User.findOne.mockResolvedValue({
      _id: 'other-id',
      email: 'other@example.com',
      name: 'Other User',
    })

    const res = await PUT(makePutRequest({ _id: 'other-id', name: 'Admin Updated' }))

    expect(res.status).toBe(200)
    expect(await res.json()).toBe(true)
    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: 'other-id' },
      { name: 'Admin Updated', image: undefined }
    )
  })

  it('returns 404 when the target user does not exist', async () => {
    getServerSession.mockResolvedValue(SESSION)
    User.findOne.mockResolvedValue(null)

    const res = await PUT(makePutRequest({ name: 'Ghost' }))

    expect(res.status).toBe(404)
    expect(await res.json()).toMatchObject({ error: 'User not found' })
  })
})
