import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import { User } from "@/models/User";
import { UserInfo } from "@/models/UserInfo";
import { isAdmin } from "@/libs/isAdmin";

export async function PUT(req) {
  await mongoose.connect(process.env.MONGODB_URI);
  const data = await req.json();
  const { _id, name, image, ...otherUserInfo } = data;

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let filter = {};
  if (_id) {
    if (!(await isAdmin())) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    filter = { _id };
  } else {
    filter = { email };
  }

  const user = await User.findOne(filter);
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }
  await User.updateOne(filter, { name, image });
  await UserInfo.findOneAndUpdate({ email: user.email }, otherUserInfo, { upsert: true });

  return Response.json(true);
}

export async function GET(req) {
  await mongoose.connect(process.env.MONGODB_URI);

  const url = new URL(req.url);
  const _id = url.searchParams.get("_id");

  let filterUser = {};
  if (_id) {
    filterUser = { _id };
  } else {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return Response.json({});
    }
    filterUser = { email };
  }
  const user = await User.findOne(filterUser).lean();
  if (!user) {
    return Response.json({});
  }
  const userInfo = await UserInfo.findOne({ email: user.email }).lean();
  return Response.json({ ...user, ...userInfo });
}
