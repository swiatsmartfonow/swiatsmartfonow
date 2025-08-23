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

async function checkBucketConfig() {
  try {
    console.log('🔍 Checking S3 bucket configuration...');
    console.log('Bucket:', process.env.AWS_S3_BUCKET_NAME);
    
    // Check bucket policy
    try {
      const policy = await s3.getBucketPolicy({
        Bucket: process.env.AWS_S3_BUCKET_NAME
      }).promise();
      console.log('📋 Current bucket policy:');
      console.log(JSON.stringify(JSON.parse(policy.Policy), null, 2));
    } catch (policyError) {
      console.log('⚠️ No bucket policy found or error:', policyError.code);
    }
    
    // Check bucket ACL
    try {
      const acl = await s3.getBucketAcl({
        Bucket: process.env.AWS_S3_BUCKET_NAME
      }).promise();
      console.log('🔐 Bucket ACL:');
      console.log('Owner:', acl.Owner);
      console.log('Grants:', acl.Grants);
    } catch (aclError) {
      console.log('⚠️ Error getting bucket ACL:', aclError.code);
    }
    
    // Check public access block
    try {
      const publicAccessBlock = await s3.getPublicAccessBlock({
        Bucket: process.env.AWS_S3_BUCKET_NAME
      }).promise();
      console.log('🚫 Public Access Block:');
      console.log(publicAccessBlock.PublicAccessBlockConfiguration);
    } catch (blockError) {
      console.log('⚠️ Error getting public access block:', blockError.code);
    }
    
  } catch (error) {
    console.error('❌ Error checking bucket:', error);
  }
}

checkBucketConfig();