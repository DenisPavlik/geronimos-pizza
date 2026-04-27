import { GET, POST, PUT, DELETE } from '@/app/api/menu-items/route'
import { MenuItem } from '@/models/MenuItem'
import { isAdmin } from '@/libs/isAdmin'

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/models/MenuItem', () => ({
  MenuItem: {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  },
}))

jest.mock('@/libs/isAdmin', () => ({
  isAdmin: jest.fn(),
}))

// ─── fixtures ─────────────────────────────────────────────────────────────────

const ITEM = { _id: 'item1', name: 'Margherita', basePrice: 10 }
const NEW_ITEM_DATA = { name: 'Pepperoni', basePrice: 12 }

function makeRequest(body) {
  return { json: jest.fn().mockResolvedValue(body) }
}

function makeDeleteRequest(id) {
  return { url: `http://localhost/api/menu-items?_id=${id}` }
}

// ─── GET ──────────────────────────────────────────────────────────────────────

describe('GET /api/menu-items', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns all menu items publicly without auth', async () => {
    MenuItem.find.mockResolvedValue([ITEM])

    // GET takes no request argument
    const res = await GET()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([ITEM])
    expect(isAdmin).not.toHaveBeenCalled()
  })
})

// ─── POST ─────────────────────────────────────────────────────────────────────

describe('POST /api/menu-items', () => {
  beforeEach(() => jest.clearAllMocks())

  // These routes have no separate 401 path — isAdmin() returns false for both
  // unauthenticated and non-admin sessions, so both cases yield 403.
  it('returns 403 when there is no session (no 401 in this route)', async () => {
    isAdmin.mockResolvedValue(false)

    const res = await POST(makeRequest(NEW_ITEM_DATA))

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ error: 'Forbidden' })
    expect(MenuItem.create).not.toHaveBeenCalled()
  })

  it('returns 403 for a non-admin authenticated user', async () => {
    isAdmin.mockResolvedValue(false)

    const res = await POST(makeRequest(NEW_ITEM_DATA))

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ error: 'Forbidden' })
    expect(MenuItem.create).not.toHaveBeenCalled()
  })

  it('creates and returns the new item when called by an admin', async () => {
    isAdmin.mockResolvedValue(true)
    MenuItem.create.mockResolvedValue({ _id: 'item2', ...NEW_ITEM_DATA })

    const res = await POST(makeRequest(NEW_ITEM_DATA))

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ name: 'Pepperoni', basePrice: 12 })
    expect(MenuItem.create).toHaveBeenCalledWith(NEW_ITEM_DATA)
  })
})

// ─── PUT ──────────────────────────────────────────────────────────────────────

describe('PUT /api/menu-items', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 for a non-admin user', async () => {
    isAdmin.mockResolvedValue(false)

    const res = await PUT(makeRequest({ _id: 'item1', name: 'Updated' }))

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ error: 'Forbidden' })
    expect(MenuItem.findByIdAndUpdate).not.toHaveBeenCalled()
  })

  it('updates the item and returns true when called by an admin', async () => {
    isAdmin.mockResolvedValue(true)
    MenuItem.findByIdAndUpdate.mockResolvedValue(undefined)

    const res = await PUT(makeRequest({ _id: 'item1', name: 'Updated', basePrice: 15 }))

    expect(res.status).toBe(200)
    expect(await res.json()).toBe(true)
    expect(MenuItem.findByIdAndUpdate).toHaveBeenCalledWith('item1', { name: 'Updated', basePrice: 15 })
  })
})

// ─── DELETE ───────────────────────────────────────────────────────────────────

describe('DELETE /api/menu-items', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 for a non-admin user', async () => {
    isAdmin.mockResolvedValue(false)

    const res = await DELETE(makeDeleteRequest('item1'))

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ error: 'Forbidden' })
    expect(MenuItem.deleteOne).not.toHaveBeenCalled()
  })

  it('deletes the item and returns true when called by an admin', async () => {
    isAdmin.mockResolvedValue(true)
    MenuItem.deleteOne.mockResolvedValue(undefined)

    const res = await DELETE(makeDeleteRequest('item1'))

    expect(res.status).toBe(200)
    expect(await res.json()).toBe(true)
    expect(MenuItem.deleteOne).toHaveBeenCalledWith({ _id: 'item1' })
  })
})
