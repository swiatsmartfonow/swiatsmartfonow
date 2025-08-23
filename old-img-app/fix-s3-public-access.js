const AWS = require('aws-sdk');

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

async function fixPublicAccess() {
  try {
    console.log('🔧 Fixing S3 bucket public access...');
    console.log('Bucket:', process.env.AWS_S3_BUCKET_NAME);
    
    // Step 1: Remove public access block
    console.log('🚫 Removing public access block...');
    await s3.deletePublicAccessBlock({
      Bucket: process.env.AWS_S3_BUCKET_NAME
    }).promise();
    console.log('✅ Public access block removed');
    
    // Step 2: Set bucket policy for public read access
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${process.env.AWS_S3_BUCKET_NAME}/*`
        }
      ]
    };
    
    console.log('📋 Setting bucket policy for public read access...');
    await s3.putBucketPolicy({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    }).promise();
    console.log('✅ Bucket policy set successfully');
    
    console.log('🎉 S3 bucket is now configured for public read access!');
    console.log('🔗 Files should now be accessible via direct URLs');
    
  } catch (error) {
    console.error('❌ Error fixing public access:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

fixPublicAccess();