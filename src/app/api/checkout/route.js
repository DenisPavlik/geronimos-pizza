import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { Order } from "@/models/Order";
import { MenuItem } from "@/models/MenuItem";
import { authOptions } from "@/libs/authOptions";
const stripe = require("stripe")(process.env.STRIPE_SK);

export async function POST(req) {
  await mongoose.connect(process.env.MONGODB_URI);

  const { cartProducts, address } = await req.json();
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  const stripeLineItems = [];
  for (const cartProduct of cartProducts) {
    const productInfo = await MenuItem.findById(cartProduct._id);
    if (!productInfo) {
      continue;
    }
    let productPrice = productInfo.basePrice;
    if (cartProduct.size) {
      const size = productInfo.sizes.find(
        (size) => size._id.toString() === cartProduct.size._id.toString()
      );
      if (size) {
        productPrice += size.price;
      }
    }
    if (cartProduct.extras?.length > 0) {
      for (const cartProductExtraThing of cartProduct.extras) {
        const extraThingInfo = productInfo.extraIngredientPrices.find(
          (extra) =>
            extra._id.toString() === cartProductExtraThing._id.toString()
        );
        if (extraThingInfo) {
          productPrice += extraThingInfo.price;
        }
      }
    }

    const productName = cartProduct.name;

    stripeLineItems.push({
      quantity: 1,
      price_data: {
        currency: "USD",
        product_data: {
          name: productName,
        },
        unit_amount: productPrice * 100,
      },
    });
  }

  // Pre-generate the order ID so it can be referenced in Stripe metadata
  // before the Order document is written to the database.
  // This ensures no Order is created if Stripe session creation fails.
  const orderId = new mongoose.Types.ObjectId();

  const stripeSession = await stripe.checkout.sessions.create({
    line_items: stripeLineItems,
    mode: "payment",
    customer_email: userEmail,
    success_url:
      process.env.NEXTAUTH_URL +
      "orders/" +
      orderId.toString() +
      "?clear-cart=1",
    cancel_url: process.env.NEXTAUTH_URL + "cart?canceled=1",
    metadata: { orderId: orderId.toString() },
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery fee",
          type: "fixed_amount",
          fixed_amount: { amount: 500, currency: "USD" },
        },
      },
    ],
  });

  await Order.create({
    _id: orderId,
    userEmail,
    ...address,
    cartProducts,
    paid: false,
  });

  return Response.json(stripeSession.url);
}
