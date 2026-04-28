import { GET, POST, PUT, DELETE } from '@/app/api/categories/route'
import { Category } from '@/models/Category'
import { isAdmin } from '@/libs/isAdmin'

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/models/Category', () => ({
  Category: {
    find: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  },
}))

jest.mock('@/libs/isAdmin', () => ({
  isAdmin: jest.fn(),
}))

// ─── fixtures ─────────────────────────────────────────────────────────────────

const CATEGORY = { _id: 'cat1', name: 'Pizza' }

function makeRequest(body) {
  return { json: jest.fn().mockResolvedValue(body) }
}

function makeDeleteRequest(id) {
  return { url: `http://localhost/api/categories?_id=${id}` }
}

// ─── GET ──────────────────────────────────────────────────────────────────────

describe('GET /api/categories', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns all categories publicly without auth', async () => {
    Category.find.mockResolvedValue([CATEGORY])

    const res = await GET()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([CATEGORY])
    expect(isAdmin).not.toHaveBeenCalled()
  })
})

// ─── POST ─────────────────────────────────────────────────────────────────────

describe('POST /api/categories', () => {
  beforeEach(() => jest.clearAllMocks())

  // No separate 401 path — isAdmin() returns false for both unauthenticated
  // and non-admin sessions, so both cases yield 403.
  it('returns 403 when there is no session (no 401 in this route)', async () => {
    isAdmin.mockResolvedValue(false)

    const res = await POST(makeRequest({ name: 'Burgers' }))

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ error: 'Forbidden' })
    expect(Category.create).not.toHaveBeenCalled()
  })

  it('returns 403 for a non-admin authenticated user', async () => {
    isAdmin.mockResolvedValue(false)

    const res = await POST(makeRequest({ name: 'Burgers' }))

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ error: 'Forbidden' })
    expect(Category.create).not.toHaveBeenCalled()
  })

  it('creates and returns the new category when called by an admin', async () => {
    isAdmin.mockResolvedValue(true)
    Category.create.mockResolvedValue({ _id: 'cat2', name: 'Burgers' })

    const res = await POST(makeRequest({ name: 'Burgers' }))

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ name: 'Burgers' })
    expect(Category.create).toHaveBeenCalledWith({ name: 'Burgers' })
  })
})

// ─── PUT ──────────────────────────────────────────────────────────────────────

describe('PUT /api/categories', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 for a non-admin user', async () => {
    isAdmin.mockResolvedValue(false)

    const res = await PUT(makeRequest({ _id: 'cat1', name: 'Updated' }))

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ error: 'Forbidden' })
    expect(Category.updateOne).not.toHaveBeenCalled()
  })

  it('updates the category and returns true when called by an admin', async () => {
    isAdmin.mockResolvedValue(true)
    Category.updateOne.mockResolvedValue(undefined)

    const res = await PUT(makeRequest({ _id: 'cat1', name: 'Updated Pizza' }))

    expect(res.status).toBe(200)
    expect(await res.json()).toBe(true)
    expect(Category.updateOne).toHaveBeenCalledWith({ _id: 'cat1' }, { name: 'Updated Pizza' })
  })
})

// ─── DELETE ───────────────────────────────────────────────────────────────────

describe('DELETE /api/categories', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 for a non-admin user', async () => {
    isAdmin.mockResolvedValue(false)

    const res = await DELETE(makeDeleteRequest('cat1'))

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ error: 'Forbidden' })
    expect(Category.deleteOne).not.toHaveBeenCalled()
  })

  it('deletes the category and returns true when called by an admin', async () => {
    isAdmin.mockResolvedValue(true)
    Category.deleteOne.mockResolvedValue(undefined)

    const res = await DELETE(makeDeleteRequest('cat1'))

    expect(res.status).toBe(200)
    expect(await res.json()).toBe(true)
    expect(Category.deleteOne).toHaveBeenCalledWith({ _id: 'cat1' })
  })
})
