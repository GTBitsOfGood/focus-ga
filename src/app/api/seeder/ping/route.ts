import dbConnect from "@/server/db/dbConnect";
import DisabilityModel from "@/server/db/models/DisabilityModel";
import { createDisability } from "@/server/db/actions/DisabilityActions";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const dummyDisability = await createDisability({ name: "Ping" });
    console.log("Successfully created dummy disability:", dummyDisability._id);
    await DisabilityModel.findByIdAndDelete(dummyDisability._id);
  } catch (error) {
    throw error;
  }
  return Response.json({ status: 200 });
}