const AWS = require('aws-sdk');
const fs = require('fs');

// Load environment variables manually
process.env.AWS_ACCESS_KEY_ID = 'AKIA4AC3X37BJBIIKSWK';
process.env.AWS_SECRET_ACCESS_KEY = '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';
process.env.AWS_REGION = 'us-east-2';
process.env.AWS_S3_BUCKET_NAME = 'img-slider-swiatsmarfonow';

// AWS S3 configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function testS3Upload() {
  try {
    console.log('Testing S3 upload...');
    console.log('Bucket:', process.env.AWS_S3_BUCKET_NAME);
    console.log('Region:', process.env.AWS_REGION);
    
    // Read test image
    const testImageBuffer = fs.readFileSync('./test-image.jpg');
    
    // Try upload without ACL
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: 'test-uploads/test-image-' + Date.now() + '.jpg',
      Body: testImageBuffer,
      ContentType: 'image/jpeg'
    };
    
    console.log('Upload params:', {
      Bucket: uploadParams.Bucket,
      Key: uploadParams.Key,
      ContentType: uploadParams.ContentType
    });
    
    const result = await s3.upload(uploadParams).promise();
    console.log('Upload successful!');
    console.log('Location:', result.Location);
    console.log('ETag:', result.ETag);
    
  } catch (error) {
    console.error('Upload failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Status code:', error.statusCode);
    console.error('Full error:', error);
  }
}

testS3Upload();