import { Document, Schema } from "mongoose";
import { TimeStamps } from "./common";

export interface IPlan extends Document, TimeStamps {}
