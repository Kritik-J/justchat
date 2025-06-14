import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class StorageService {
  #s3Client: S3Client;
  #bucket: string;
  #region: string;
  #accessKeyId: string;
  #secretAccessKey: string;

  constructor(
    bucket: string,
    region: string,
    accessKeyId: string,
    secretAccessKey: string
  ) {
    this.#bucket = bucket;
    this.#region = region;
    this.#accessKeyId = accessKeyId;
    this.#secretAccessKey = secretAccessKey;

    this.#s3Client = new S3Client({
      region: this.#region,
      credentials: {
        accessKeyId: this.#accessKeyId,
        secretAccessKey: this.#secretAccessKey,
      },
    });
  }

  async getPresignedUrl(filepath: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.#bucket,
        Key: `${filepath}`,
      });

      const url = await getSignedUrl(this.#s3Client, command, {
        expiresIn: 120 * 60,
      });

      return url;
    } catch (error) {
      throw new Error("Failed to get presigned url");
    }
  }

  async upload(file: any, filePath: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.#bucket,
      Key: filePath,
      Body: file,
      ContentType: contentType,
    });

    return await this.#s3Client.send(command);
  }

  async delete(filepath: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.#bucket,
      Key: filepath,
    });

    return await this.#s3Client.send(command);
  }

  async get(filepath: string) {
    const command = new GetObjectCommand({
      Bucket: this.#bucket,
      Key: filepath,
    });

    return await this.#s3Client.send(command);
  }
}
