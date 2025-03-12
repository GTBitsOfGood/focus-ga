import dbConnect from "@/server/db/dbConnect";
import DisabilityModel from "@/server/db/models/DisabilityModel";
import { createDisability } from "@/server/db/actions/DisabilityActions";

export async function POST(request: Request) {
  try {
    await dbConnect();
    console.log("Database connection successful.");

    const dummyDisability = await createDisability({ name: "Ping Test Disability" });
    console.log("Successfully created dummy disability:", dummyDisability._id);
    await DisabilityModel.findByIdAndDelete(dummyDisability._id);
    console.log("Successfully deleted dummy disability:", dummyDisability._id);
  } catch (error) {
    console.error("Error during database ping:", error);
    throw error;
  }

  return Response.json({ status: 200, message: "Database ping successful" });
}