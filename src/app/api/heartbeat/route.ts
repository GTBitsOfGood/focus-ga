import dbConnect from "@/server/db/dbConnect";
import DummyModel from "@/server/db/models/DummyModel";

export async function GET() {
  await dbConnect();

  await DummyModel.create({ name: "dummy" });
  return Response.json({ status: "ok" });
}
