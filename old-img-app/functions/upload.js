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
  console.log('🚀 Upload API called:', event.httpMethod);
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('✋ Handling OPTIONS preflight request');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let client;
  
  try {
    console.log('📋 Parsing multipart form data...');
    // Parse multipart form data
    const result = await multipart.parse(event);
    const { files, author } = result;
    
    console.log(`📁 Received ${files ? files.length : 0} files, author: ${author}`);

    if (!files || files.length === 0) {
      console.log('❌ No files provided');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No files provided' })
      };
    }

    console.log('🔌 Connecting to database...');
    client = await pool.connect();
    const uploadedImages = [];

    for (const file of files) {
      if (!file.content || !file.filename) {
        console.log('⚠️ Skipping file - missing content or filename');
        continue;
      }

      try {
        console.log(`📸 Processing file: ${file.filename} (${file.content.length} bytes)`);
        
        // Generate unique filename
        const fileExtension = file.filename.split('.').pop();
        const uniqueFilename = `${uuidv4()}.${fileExtension}`;
        console.log(`🆔 Generated unique filename: ${uniqueFilename}`);

        // Process image with Sharp
        const originalBuffer = file.content;
        const metadata = await sharp(originalBuffer).metadata();
        console.log(`🔍 Image metadata: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

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
        console.log(`☁️ Uploading to S3 bucket: ${bucketName}, base key: ${baseKey}`);

        const uploadPromises = [
          s3.upload({
            Bucket: bucketName,
            Key: `${baseKey}_small.jpg`,
            Body: smallBuffer,
            ContentType: 'image/jpeg',
            CacheControl: 'max-age=31536000'
          }).promise(),
          s3.upload({
            Bucket: bucketName,
            Key: `${baseKey}_medium.jpg`,
            Body: mediumBuffer,
            ContentType: 'image/jpeg',
            CacheControl: 'max-age=31536000'
          }).promise(),
          s3.upload({
            Bucket: bucketName,
            Key: `${baseKey}_original.${fileExtension}`,
            Body: originalBuffer,
            ContentType: file.contentType || 'image/jpeg',
            CacheControl: 'max-age=31536000'
          }).promise()
        ];

        console.log('⏳ Uploading 3 image variants to S3...');
        const [smallUpload, mediumUpload, originalUpload] = await Promise.all(uploadPromises);
        console.log('✅ S3 uploads completed successfully');

        // Prepare URLs object
        const urls = {
          small: smallUpload.Location,
          medium: mediumUpload.Location,
          original: originalUpload.Location
        };
        console.log('🔗 Generated URLs:', urls);

        // Save to database
        console.log('💾 Saving to database...');
        const dbResult = await client.query(
          'INSERT INTO images (author, urls, width, height) VALUES ($1, $2, $3, $4) RETURNING *',
          [author || 'Anonymous', JSON.stringify(urls), metadata.width, metadata.height]
        );
        console.log(`✅ Saved to database with ID: ${dbResult.rows[0].id}`);

        uploadedImages.push(dbResult.rows[0]);

      } catch (fileError) {
        console.error(`❌ Error processing file ${file.filename}:`, fileError);
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