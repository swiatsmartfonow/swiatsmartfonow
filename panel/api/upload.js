import { Client } from "pg";
import formidable from "formidable";
import fs from "fs";
import AWS from "aws-sdk";
import sharp from "sharp";

export const config = { api: { bodyParser: false } };

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const client = new Client({ connectionString: process.env.NEON_DATABASE_URL });

async function uploadToS3(buffer, key, mimetype) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    ACL: "public-read",
  };
  const data = await s3.upload(params).promise();
  return data.Location;
}

export default async function handler(req, res) {
  await client.connect();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File parse error" });

    const file = files.file;
    const fileContent = fs.readFileSync(file.filepath);
    const timestamp = Date.now();
    const originalName = file.originalFilename.replace(/\s+/g, "-");

    try {
      // Pobranie wymiarów oryginału
      const metadata = await sharp(fileContent).metadata();
      const widthOriginal = metadata.width || 0;
      const heightOriginal = metadata.height || 0;

      // Generowanie wersji small (200px szerokości)
      const smallBuffer = await sharp(fileContent)
        .resize({ width: 200 })
        .toBuffer();
      const smallMeta = await sharp(smallBuffer).metadata();
      const smallUrl = await uploadToS3(smallBuffer, `small-${timestamp}-${originalName}`, file.mimetype);

      // Generowanie wersji medium (800px szerokości)
      const mediumBuffer = await sharp(fileContent)
        .resize({ width: 800 })
        .toBuffer();
      const mediumMeta = await sharp(mediumBuffer).metadata();
      const mediumUrl = await uploadToS3(mediumBuffer, `medium-${timestamp}-${originalName}`, file.mimetype);

      // Upload oryginału
      const originalUrl = await uploadToS3(fileContent, `original-${timestamp}-${originalName}`, file.mimetype);

      // Zapis do Neon DB
      const result = await client.query(
        "INSERT INTO images (author, urls, width, height) VALUES ($1, $2, $3, $4) RETURNING *",
        [
          fields.author || "Anonymous",
          JSON.stringify({
            small: smallUrl,
            medium: mediumUrl,
            original: originalUrl,
          }),
          widthOriginal,
          heightOriginal,
        ]
      );

      res.status(200).json({ message: "Uploaded", image: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload or processing error" });
    }
  });
}