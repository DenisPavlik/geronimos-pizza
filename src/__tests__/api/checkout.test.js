import { POST } from '@/app/api/checkout/route'
import { Order } from '@/models/Order'
import { MenuItem } from '@/models/MenuItem'
import { getServerSession } from 'next-auth'

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  Types: {
    ObjectId: jest.fn().mockImplementation(() => ({
      toString: jest.fn().mockReturnValue('test-order-id'),
    })),
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/libs/authOptions', () => ({
  authOptions: {},
}))

jest.mock('@/models/Order', () => ({
  Order: {
    create: jest.fn(),
  },
}))

jest.mock('@/models/MenuItem', () => ({
  MenuItem: {
    findById: jest.fn(),
  },
}))

// Store the mockCreate reference via a property on the constructor so that
// jest.clearAllMocks() doesn't lose the reference across tests.
jest.mock('stripe', () => {
  const mockCreate = jest.fn()
  const StripeConstructor = jest.fn(() => ({
    checkout: { sessions: { create: mockCreate } },
  }))
  StripeConstructor.__mockCreate = mockCreate
  return StripeConstructor
})

// ─── fixtures ─────────────────────────────────────────────────────────────────

const SESSION = { user: { email: 'user@example.com' } }
const STRIPE_URL = 'https://checkout.stripe.com/pay/test_session'
const ADDRESS = {
  phone: '111222333',
  streetAddress: '123 Main St',
  postalCode: '12345',
  city: 'Kyiv',
  country: 'Ukraine',
}

const MENU_ITEM = {
  _id: 'item1',
  basePrice: 10,
  sizes: [{ _id: 'size-L', price: 3 }],
  extraIngredientPrices: [{ _id: 'extra-cheese', price: 2 }],
}

function makeRequest(body) {
  return { json: jest.fn().mockResolvedValue(body) }
}

function getStripeCreate() {
  return jest.requireMock('stripe').__mockCreate
}

// ─── POST ─────────────────────────────────────────────────────────────────────

describe('POST /api/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getStripeCreate().mockResolvedValue({ url: STRIPE_URL })
    Order.create.mockResolvedValue(undefined)
  })

  it('creates a Stripe session and an Order, then returns the checkout URL', async () => {
    getServerSession.mockResolvedValue(SESSION)
    MenuItem.findById.mockResolvedValue(MENU_ITEM)

    const cartProduct = { _id: 'item1', name: 'Margherita', size: null, extras: [] }
    const res = await POST(makeRequest({ cartProducts: [cartProduct], address: ADDRESS }))

    expect(res.status).toBe(200)
    expect(await res.json()).toBe(STRIPE_URL)

    expect(getStripeCreate()).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        customer_email: 'user@example.com',
        metadata: { orderId: 'test-order-id' },
        line_items: [
          expect.objectContaining({
            quantity: 1,
            price_data: expect.objectContaining({
              unit_amount: 1000, // basePrice 10 * 100
            }),
          }),
        ],
      })
    )

    expect(Order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userEmail: 'user@example.com',
        cartProducts: [cartProduct],
        paid: false,
        ...ADDRESS,
      })
    )
  })

  it('skips cart products that are not found in the database', async () => {
    getServerSession.mockResolvedValue(SESSION)
    MenuItem.findById.mockResolvedValue(null) // product not found

    const cartProduct = { _id: 'ghost-item', name: 'Ghost', size: null, extras: [] }
    const res = await POST(makeRequest({ cartProducts: [cartProduct], address: ADDRESS }))

    expect(res.status).toBe(200)
    // line_items should be empty since the product was skipped
    expect(getStripeCreate()).toHaveBeenCalledWith(
      expect.objectContaining({ line_items: [] })
    )
  })

  it('adds the selected size price on top of the base price', async () => {
    getServerSession.mockResolvedValue(SESSION)
    MenuItem.findById.mockResolvedValue(MENU_ITEM)

    const cartProduct = {
      _id: 'item1',
      name: 'Margherita',
      size: { _id: 'size-L' }, // matches MENU_ITEM.sizes[0]
      extras: [],
    }
    await POST(makeRequest({ cartProducts: [cartProduct], address: ADDRESS }))

    expect(getStripeCreate()).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 1300, // (10 + 3) * 100
            }),
          }),
        ],
      })
    )
  })

  it('adds extra ingredient prices on top of the base price', async () => {
    getServerSession.mockResolvedValue(SESSION)
    MenuItem.findById.mockResolvedValue(MENU_ITEM)

    const cartProduct = {
      _id: 'item1',
      name: 'Margherita',
      size: null,
      extras: [{ _id: 'extra-cheese' }], // matches MENU_ITEM.extraIngredientPrices[0]
    }
    await POST(makeRequest({ cartProducts: [cartProduct], address: ADDRESS }))

    expect(getStripeCreate()).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 1200, // (10 + 2) * 100
            }),
          }),
        ],
      })
    )
  })
})
