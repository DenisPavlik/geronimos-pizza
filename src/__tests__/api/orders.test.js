import { GET } from '@/app/api/orders/route'
import { Order } from '@/models/Order'
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

jest.mock('@/models/Order', () => ({
  Order: {
    find: jest.fn(),
    findById: jest.fn(),
  },
}))

jest.mock('@/libs/isAdmin', () => ({
  isAdmin: jest.fn(),
}))

// ─── fixtures ─────────────────────────────────────────────────────────────────

const SESSION = { user: { email: 'user@example.com' } }
const OWN_ORDER = { _id: 'ord1', userEmail: 'user@example.com', paid: true }
const OTHER_ORDER = { _id: 'ord2', userEmail: 'other@example.com', paid: false }

function makeRequest(search = '') {
  return { url: `http://localhost/api/orders${search}` }
}

// ─── GET (list) ───────────────────────────────────────────────────────────────

describe('GET /api/orders — list', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns [] when there is no session and no _id', async () => {
    getServerSession.mockResolvedValue(null)
    isAdmin.mockResolvedValue(false)

    const res = await GET(makeRequest())

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
    expect(Order.find).not.toHaveBeenCalled()
  })

  it("returns the user's own orders when authenticated and not admin", async () => {
    getServerSession.mockResolvedValue(SESSION)
    isAdmin.mockResolvedValue(false)
    Order.find.mockResolvedValue([OWN_ORDER])

    const res = await GET(makeRequest())

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([OWN_ORDER])
    expect(Order.find).toHaveBeenCalledWith({ userEmail: 'user@example.com' })
  })

  it('returns all orders when the caller is an admin', async () => {
    getServerSession.mockResolvedValue(SESSION)
    isAdmin.mockResolvedValue(true)
    Order.find.mockResolvedValue([OWN_ORDER, OTHER_ORDER])

    const res = await GET(makeRequest())

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([OWN_ORDER, OTHER_ORDER])
    // admin path calls Order.find() with no filter
    expect(Order.find).toHaveBeenCalledTimes(1)
    expect(Order.find).not.toHaveBeenCalledWith(expect.objectContaining({ userEmail: expect.anything() }))
  })
})

// ─── GET (single order by _id) ────────────────────────────────────────────────

describe('GET /api/orders?_id=...', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when there is no session', async () => {
    getServerSession.mockResolvedValue(null)
    isAdmin.mockResolvedValue(false)

    const res = await GET(makeRequest('?_id=ord1'))

    expect(res.status).toBe(401)
    expect(await res.json()).toMatchObject({ error: 'Unauthorized' })
    expect(Order.findById).not.toHaveBeenCalled()
  })

  it('returns 404 when the order does not exist', async () => {
    getServerSession.mockResolvedValue(SESSION)
    isAdmin.mockResolvedValue(false)
    Order.findById.mockResolvedValue(null)

    const res = await GET(makeRequest('?_id=missing'))

    expect(res.status).toBe(404)
    expect(await res.json()).toMatchObject({ error: 'Not found' })
  })

  it("returns 403 when a non-admin requests another user's order", async () => {
    getServerSession.mockResolvedValue(SESSION)
    isAdmin.mockResolvedValue(false)
    Order.findById.mockResolvedValue(OTHER_ORDER)

    const res = await GET(makeRequest('?_id=ord2'))

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ error: 'Forbidden' })
  })

  it("returns the order when a user requests their own order", async () => {
    getServerSession.mockResolvedValue(SESSION)
    isAdmin.mockResolvedValue(false)
    Order.findById.mockResolvedValue(OWN_ORDER)

    const res = await GET(makeRequest('?_id=ord1'))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(OWN_ORDER)
  })

  it("returns any order when the caller is an admin", async () => {
    getServerSession.mockResolvedValue(SESSION)
    isAdmin.mockResolvedValue(true)
    Order.findById.mockResolvedValue(OTHER_ORDER)

    const res = await GET(makeRequest('?_id=ord2'))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(OTHER_ORDER)
  })
})
