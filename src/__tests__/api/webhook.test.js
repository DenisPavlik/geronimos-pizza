import { POST } from '@/app/api/webhook/route'
import { Order } from '@/models/Order'

jest.mock('@/models/Order', () => ({
  Order: {
    updateOne: jest.fn(),
  },
}))

// Store mockConstructEvent as a property on the constructor so the reference
// survives jest.clearAllMocks() across tests.
jest.mock('stripe', () => {
  const mockConstructEvent = jest.fn()
  const StripeConstructor = jest.fn(() => ({
    webhooks: { constructEvent: mockConstructEvent },
  }))
  StripeConstructor.__mockConstructEvent = mockConstructEvent
  return StripeConstructor
})

// ─── helpers ──────────────────────────────────────────────────────────────────

function getConstructEvent() {
  return jest.requireMock('stripe').__mockConstructEvent
}

function makeRequest({ sig = 'valid-sig', body = 'raw-body' } = {}) {
  return {
    headers: { get: jest.fn().mockReturnValue(sig) },
    text: jest.fn().mockResolvedValue(body),
  }
}

function makeEvent(overrides = {}) {
  return {
    type: 'checkout.session.completed',
    data: {
      object: {
        payment_status: 'paid',
        metadata: { orderId: 'ord-123' },
        ...overrides,
      },
    },
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

describe('POST /api/webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Order.updateOne.mockResolvedValue(undefined)
  })

  it('returns 400 when the Stripe signature is invalid', async () => {
    getConstructEvent().mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const res = await POST(makeRequest({ sig: 'bad-sig' }))

    expect(res.status).toBe(400)
    expect(Order.updateOne).not.toHaveBeenCalled()
  })

  it('marks the order as paid when payment_status is "paid"', async () => {
    getConstructEvent().mockReturnValue(makeEvent())

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(await res.json()).toBe('ok')
    expect(Order.updateOne).toHaveBeenCalledWith({ _id: 'ord-123' }, { paid: true })
  })

  it('does not update the order when payment_status is not "paid"', async () => {
    getConstructEvent().mockReturnValue(
      makeEvent({ payment_status: 'unpaid' })
    )

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(Order.updateOne).not.toHaveBeenCalled()
  })

  it('returns 200 "ok" for unrelated event types without touching the Order', async () => {
    getConstructEvent().mockReturnValue({ type: 'payment_intent.created', data: { object: {} } })

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(await res.json()).toBe('ok')
    expect(Order.updateOne).not.toHaveBeenCalled()
  })
})
