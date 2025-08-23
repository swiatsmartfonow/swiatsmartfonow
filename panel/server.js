const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Database connection
const getDbClient = () => {
  return new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
};

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  },
});

// Helper function to upload to S3
async function uploadToS3(buffer, key, mimetype) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'public-read',
  };
  
  try {
    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload to S3');
  }
}

// Helper function to generate image versions
async function generateImageVersions(buffer, originalName, mimetype) {
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
  
  try {
    // Get original metadata
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;
    
    // Generate small version (200px width)
    const smallBuffer = await sharp(buffer)
      .resize({ width: 200, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    const smallMeta = await sharp(smallBuffer).metadata();
    
    // Generate medium version (800px width)
    const mediumBuffer = await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    const mediumMeta = await sharp(mediumBuffer).metadata();
    
    // Upload all versions to S3
    const [smallUrl, mediumUrl, originalUrl] = await Promise.all([
      uploadToS3(smallBuffer, `small-${timestamp}-${uuid}-${cleanName}`, 'image/jpeg'),
      uploadToS3(mediumBuffer, `medium-${timestamp}-${uuid}-${cleanName}`, 'image/jpeg'),
      uploadToS3(buffer, `original-${timestamp}-${uuid}-${cleanName}`, mimetype)
    ]);
    
    return {
      urls: {
        small: smallUrl,
        medium: mediumUrl,
        original: originalUrl
      },
      dimensions: {
        small: { width: smallMeta.width, height: smallMeta.height },
        medium: { width: mediumMeta.width, height: mediumMeta.height },
        original: { width: originalWidth, height: originalHeight }
      },
      originalWidth,
      originalHeight
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
}

// API Routes

// GET /api/images - Get all images
app.get('/api/images', async (req, res) => {
  const client = getDbClient();
  
  try {
    await client.connect();
    
    const result = await client.query(
      'SELECT * FROM images ORDER BY created_at DESC'
    );
    
    const images = result.rows.map(row => ({
      id: row.id.toString(),
      author: row.author,
      urls: row.urls,
      width: row.width,
      height: row.height,
      created_at: row.created_at,
      // Compatibility with existing slider
      url: row.urls?.medium || row.urls?.original,
      download_url: row.urls?.medium || row.urls?.original
    }));
    
    res.json(images);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  } finally {
    await client.end();
  }
});

// POST /api/upload - Upload new image
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const client = getDbClient();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    await client.connect();
    
    const { author = 'Anonymous' } = req.body;
    const { buffer, originalname, mimetype } = req.file;
    
    // Generate image versions
    const imageData = await generateImageVersions(buffer, originalname, mimetype);
    
    // Save to database
    const result = await client.query(
      'INSERT INTO images (author, urls, width, height) VALUES ($1, $2, $3, $4) RETURNING *',
      [
        author,
        JSON.stringify(imageData.urls),
        imageData.originalWidth,
        imageData.originalHeight
      ]
    );
    
    const savedImage = {
      ...result.rows[0],
      urls: imageData.urls,
      dimensions: imageData.dimensions
    };
    
    res.status(201).json({
      message: 'Image uploaded successfully',
      image: savedImage
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message 
    });
  } finally {
    await client.end();
  }
});

// POST /api/images - Add image by URL (legacy support)
app.post('/api/images', async (req, res) => {
  const client = getDbClient();
  
  try {
    await client.connect();
    
    const { url, author = 'Custom Author', width = 5000, height = 3333 } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // For URL-based images, create a simple structure
    const urls = {
      small: url,
      medium: url,
      original: url
    };
    
    const result = await client.query(
      'INSERT INTO images (author, urls, width, height) VALUES ($1, $2, $3, $4) RETURNING *',
      [author, JSON.stringify(urls), width, height]
    );
    
    res.status(201).json({
      message: 'Image URL added successfully',
      image: result.rows[0]
    });
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to add image' });
  } finally {
    await client.end();
  }
});

// PUT /api/images/:id - Update image
app.put('/api/images/:id', async (req, res) => {
  const client = getDbClient();
  
  try {
    await client.connect();
    
    const { id } = req.params;
    const { author, width, height } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    const result = await client.query(
      'UPDATE images SET author = $1, width = $2, height = $3 WHERE id = $4 RETURNING *',
      [author, width, height, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({
      message: 'Image updated successfully',
      image: result.rows[0]
    });
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update image' });
  } finally {
    await client.end();
  }
});

// DELETE /api/images/:id - Delete image
app.delete('/api/images/:id', async (req, res) => {
  const client = getDbClient();
  
  try {
    await client.connect();
    
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    // Get image data before deletion for S3 cleanup
    const imageResult = await client.query(
      'SELECT urls FROM images WHERE id = $1',
      [id]
    );
    
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Delete from database
    await client.query('DELETE FROM images WHERE id = $1', [id]);
    
    // Optional: Clean up S3 files (uncomment if needed)
    /*
    const urls = imageResult.rows[0].urls;
    if (urls && typeof urls === 'object') {
      const deletePromises = Object.values(urls).map(url => {
        if (typeof url === 'string' && url.includes(process.env.S3_BUCKET)) {
          const key = url.split('/').pop();
          return s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: key }).promise();
        }
      }).filter(Boolean);
      
      await Promise.all(deletePromises);
    }
    */
    
    res.json({ message: 'Image deleted successfully' });
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  } finally {
    await client.end();
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const client = getDbClient();
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      s3: process.env.S3_BUCKET ? 'configured' : 'not configured'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message 
    });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Image Management Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💾 Database: ${process.env.NEON_DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`☁️  S3 Bucket: ${process.env.S3_BUCKET || 'Not configured'}`);
});

module.exports = app;