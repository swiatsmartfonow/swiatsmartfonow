const AWS = require('aws-sdk');
const { Pool } = require('pg');
const sharp = require('sharp');
const multipart = require('lambda-multipart-parser');
const { v4: uuidv4 } = require('uuid');

// AWS S3 configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let client;
  
  try {
    // Parse multipart form data
    const result = await multipart.parse(event);
    const { files, author } = result;

    if (!files || files.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No files provided' })
      };
    }

    client = await pool.connect();
    const uploadedImages = [];

    for (const file of files) {
      if (!file.content || !file.filename) {
        continue;
      }

      try {
        // Generate unique filename
        const fileExtension = file.filename.split('.').pop();
        const uniqueFilename = `${uuidv4()}.${fileExtension}`;

        // Process image with Sharp
        const originalBuffer = file.content;
        const metadata = await sharp(originalBuffer).metadata();

        // Create different sizes
        const smallBuffer = await sharp(originalBuffer)
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer();

        const mediumBuffer = await sharp(originalBuffer)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();

        // Upload to S3
        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        const baseKey = `images/${uniqueFilename.split('.')[0]}`;

        const uploadPromises = [
          s3.upload({
            Bucket: bucketName,
            Key: `${baseKey}_small.jpg`,
            Body: smallBuffer,
            ContentType: 'image/jpeg'
          }).promise(),
          s3.upload({
            Bucket: bucketName,
            Key: `${baseKey}_medium.jpg`,
            Body: mediumBuffer,
            ContentType: 'image/jpeg'
          }).promise(),
          s3.upload({
            Bucket: bucketName,
            Key: `${baseKey}_original.${fileExtension}`,
            Body: originalBuffer,
            ContentType: file.contentType || 'image/jpeg'
          }).promise()
        ];

        const [smallUpload, mediumUpload, originalUpload] = await Promise.all(uploadPromises);

        // Prepare URLs object
        const urls = {
          small: smallUpload.Location,
          medium: mediumUpload.Location,
          original: originalUpload.Location
        };

        // Save to database
        const dbResult = await client.query(
          'INSERT INTO images (author, urls, width, height) VALUES ($1, $2, $3, $4) RETURNING *',
          [author || 'Anonymous', JSON.stringify(urls), metadata.width, metadata.height]
        );

        uploadedImages.push(dbResult.rows[0]);

      } catch (fileError) {
        console.error(`Error processing file ${file.filename}:`, fileError);
        // Continue with other files
      }
    }

    if (uploadedImages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No files were successfully processed' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: `Successfully uploaded ${uploadedImages.length} image(s)`,
        images: uploadedImages
      })
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};