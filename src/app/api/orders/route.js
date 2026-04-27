import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import { Order } from "@/models/Order";
import { isAdmin } from "@/libs/isAdmin";

export async function GET(req) {
  await mongoose.connect(process.env.MONGODB_URI);

  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  const admin = await isAdmin();

  const url = new URL(req.url);
  const _id = url.searchParams.get('_id');
  if (_id) {
    if (!userEmail) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const order = await Order.findById(_id);
    if (!order) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    if (!admin && order.userEmail !== userEmail) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    return Response.json(order);
  }

  if (admin) {
    return Response.json(await Order.find());
  }

  if (userEmail) {
    return Response.json(await Order.find({ userEmail }));
  }

  return Response.json([]);
}
