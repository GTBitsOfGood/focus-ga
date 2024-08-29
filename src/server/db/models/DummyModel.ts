import mongoose from "mongoose";
import { Schema } from "mongoose";

const dummySchema = new Schema({
  name: String,
});

const DummyModel =
  mongoose.models?.Dummy ?? mongoose.model("Dummy", dummySchema);

export default DummyModel;
