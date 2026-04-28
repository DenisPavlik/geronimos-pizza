import { MenuItem } from "@/models/MenuItem";
import mongoose from "mongoose";
import { isAdmin } from "@/libs/isAdmin";

export async function POST(req) {
  await mongoose.connect(process.env.MONGODB_URI);
  const data = await req.json();
  if (await isAdmin()) {
    const menuItemDoc = await MenuItem.create(data);
    return Response.json(menuItemDoc);
  }
  return Response.json({ error: "Forbidden" }, { status: 403 });
}

export async function PUT(req) {
  await mongoose.connect(process.env.MONGODB_URI);
  if (await isAdmin()) {
    const { _id, ...data } = await req.json();
    await MenuItem.findByIdAndUpdate(_id, data);
    return Response.json(true);
  }
  return Response.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET() {
  await mongoose.connect(process.env.MONGODB_URI);
  return Response.json(await MenuItem.find());
}

export async function DELETE(req) {
  await mongoose.connect(process.env.MONGODB_URI);
  const url = new URL(req.url);
  const _id = url.searchParams.get("_id");
  if (await isAdmin()) {
    await MenuItem.deleteOne({ _id });
    return Response.json(true);
  }
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
