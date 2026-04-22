import { v4 as uuidv4 } from "uuid";
import { supabase } from "../config/supabase.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export class UploadService {
  static async uploadProof(file, userId) {
    const extension = file.originalname.split(".").pop();
    const path = `proofs/${userId}/${uuidv4()}.${extension}`;

    const { error } = await supabase.storage
      .from(env.supabaseStorageBucket)
      .upload(path, file.buffer, {
        cacheControl: "3600",
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw new AppError("Failed to upload proof image", 500, error.message);
    }

    const { data } = supabase.storage.from(env.supabaseStorageBucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
