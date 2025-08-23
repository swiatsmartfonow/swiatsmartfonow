const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// In-memory storage for demo purposes
let imagesStore = [
  {
    id: '1',
    author: 'Demo User',
    urls: {
      small: 'https://picsum.photos/200/133?random=1',
      medium: 'https://picsum.photos/800/533?random=1',
      original: 'https://picsum.photos/5000/3333?random=1'
    },
    width: 5000,
    height: 3333,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    author: 'Sample Author',
    urls: {
      small: 'https://picsum.photos/200/300?random=2',
      medium: 'https://picsum.photos/800/1200?random=2',
      original: 'https://picsum.photos/4000/6000?random=2'
    },
    width: 4000,
    height: 6000,
    created_at: new Date().toISOString()
  }
];

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
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024,
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

// Helper function to simulate image processing
async function processImageDemo(buffer, originalName) {
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  
  try {
    // Get original metadata
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;
    
    // For demo, we'll use Picsum Photos as placeholder URLs
    const randomId = Math.floor(Math.random() * 1000);
    
    return {
      urls: {
        small: `https://picsum.photos/200/${Math.floor(200 * originalHeight / originalWidth)}?random=${randomId}`,
        medium: `https://picsum.photos/800/${Math.floor(800 * originalHeight / originalWidth)}?random=${randomId}`,
        original: `https://picsum.photos/${originalWidth}/${originalHeight}?random=${randomId}`
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
  try {
    const images = imagesStore.map(row => ({
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
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// POST /api/upload - Upload new image (demo mode)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { author = 'Anonymous' } = req.body;
    const { buffer, originalname, mimetype } = req.file;
    
    // Process image (demo version)
    const imageData = await processImageDemo(buffer, originalname);
    
    // Save to memory store
    const newImage = {
      id: (imagesStore.length + 1).toString(),
      author,
      urls: imageData.urls,
      width: imageData.originalWidth,
      height: imageData.originalHeight,
      created_at: new Date().toISOString()
    };
    
    imagesStore.unshift(newImage);
    
    res.status(201).json({
      message: 'Image uploaded successfully (demo mode)',
      image: newImage
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message 
    });
  }
});

// POST /api/images - Add image by URL
app.post('/api/images', async (req, res) => {
  try {
    const { url, author = 'Custom Author', width = 5000, height = 3333 } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const urls = {
      small: url,
      medium: url,
      original: url
    };
    
    const newImage = {
      id: (imagesStore.length + 1).toString(),
      author,
      urls,
      width,
      height,
      created_at: new Date().toISOString()
    };
    
    imagesStore.unshift(newImage);
    
    res.status(201).json({
      message: 'Image URL added successfully',
      image: newImage
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// PUT /api/images/:id - Update image
app.put('/api/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { author, width, height } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    const imageIndex = imagesStore.findIndex(img => img.id === id);
    
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    imagesStore[imageIndex] = {
      ...imagesStore[imageIndex],
      author: author || imagesStore[imageIndex].author,
      width: width || imagesStore[imageIndex].width,
      height: height || imagesStore[imageIndex].height
    };
    
    res.json({
      message: 'Image updated successfully',
      image: imagesStore[imageIndex]
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// DELETE /api/images/:id - Delete image
app.delete('/api/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    const imageIndex = imagesStore.findIndex(img => img.id === id);
    
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    imagesStore.splice(imageIndex, 1);
    
    res.json({ message: 'Image deleted successfully' });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'demo mode (in-memory)',
    s3: 'demo mode (using Picsum Photos)',
    mode: 'demonstration'
  });
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
  console.log(`🚀 Image Management Demo Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💾 Database: Demo mode (in-memory storage)`);
  console.log(`☁️  S3 Bucket: Demo mode (using Picsum Photos)`);
  console.log(`🎯 Mode: Demonstration - no real database or S3 required`);
});

module.exports = app;