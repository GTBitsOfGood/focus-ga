import dbConnect from "@/server/db/dbConnect";
import CommentLikeModel from "@/server/db/models/CommentLikeModel";
import CommentModel from "@/server/db/models/CommentModel";
import DisabilityModel from "@/server/db/models/DisabilityModel";
import PostLikeModel from "@/server/db/models/PostLikeModel";
import PostModel from "@/server/db/models/PostModel";
import PostSaveModel from "@/server/db/models/PostSaveModel";
import ReportModel from "@/server/db/models/ReportModel";
import NotificationModel from "@/server/db/models/NotificationModel";
import UserModel from "@/server/db/models/UserModel";

export async function POST(request: Request) {
  try {
    await dbConnect();

    // clear the database
    await CommentLikeModel.deleteMany({});
    await CommentModel.deleteMany({});
    await DisabilityModel.deleteMany({});
    await PostLikeModel.deleteMany({});
    await PostModel.deleteMany({});
    await PostSaveModel.deleteMany({});
    await ReportModel.deleteMany({});
    await UserModel.deleteMany({});
    await NotificationModel.deleteMany({});
    console.log("Successfully cleared database.");
  } catch (e) {
    console.log(e);
    throw e;
  }

  console.log("Successfully seeded database.");
  return Response.json({ status: 200 });
}
