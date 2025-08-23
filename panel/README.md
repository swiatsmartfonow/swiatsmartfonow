# 🖼️ Image Management Panel

A complete image management system with automatic resizing, AWS S3 storage, and PostgreSQL database integration.

## ✨ Features

- **Drag & Drop Upload**: Modern interface with drag and drop file upload
- **Automatic Resizing**: Creates small (200px), medium (800px), and original versions
- **AWS S3 Integration**: Secure cloud storage with public access
- **PostgreSQL Database**: Stores metadata and URLs using Neon DB
- **CRUD Operations**: Full create, read, update, delete functionality
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Comprehensive validation and error messages
- **Real-time Preview**: Instant image preview and management

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- AWS S3 bucket configured
- Neon PostgreSQL database

### Installation

1. **Install dependencies**:
   ```bash
   cd panel
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   # Database
   NEON_DATABASE_URL=postgresql://username:password@host:5432/database
   
   # AWS S3
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=us-east-1
   S3_BUCKET=your-bucket-name
   
   # Server
   PORT=3001
   NODE_ENV=development
   ```

3. **Setup database**:
   ```bash
   # Run the SQL schema (neon.sql) in your Neon database
   # Or use the existing schema if already created
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Open in browser**:
   ```
   http://localhost:3001
   ```

## 📁 Project Structure

```
panel/
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
├── neon.sql              # Database schema
├── public/
│   └── index.html        # Frontend interface
├── images.js             # Database operations (legacy)
└── upload.js             # Upload handler (legacy)
```

## 🔧 API Endpoints

### Images

- `GET /api/images` - Get all images
- `POST /api/upload` - Upload new image (multipart/form-data)
- `POST /api/images` - Add image by URL (legacy)
- `PUT /api/images/:id` - Update image metadata
- `DELETE /api/images/:id` - Delete image
- `GET /api/health` - Health check

### Upload Format

```javascript
// FormData for file upload
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('author', 'Author Name');

fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

### Response Format

```json
{
  "id": "123",
  "author": "John Doe",
  "urls": {
    "small": "https://bucket.s3.amazonaws.com/small-image.jpg",
    "medium": "https://bucket.s3.amazonaws.com/medium-image.jpg",
    "original": "https://bucket.s3.amazonaws.com/original-image.jpg"
  },
  "width": 5000,
  "height": 3333,
  "created_at": "2024-01-20T10:30:00Z"
}
```

## 🛠️ Configuration

### AWS S3 Setup

1. Create an S3 bucket
2. Set bucket policy for public read access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```
3. Create IAM user with S3 permissions
4. Add credentials to `.env`

### Neon Database Setup

1. Create account at [neon.tech](https://neon.tech)
2. Create new database
3. Run the schema from `neon.sql`
4. Add connection string to `.env`

### Image Processing

- **Small**: 200px width, JPEG quality 80%
- **Medium**: 800px width, JPEG quality 85%
- **Original**: Unchanged, original format
- **Supported formats**: JPEG, PNG, WebP, GIF
- **Max file size**: 10MB

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Rate limiting**: 100 requests per 15 minutes
- **File validation**: Type and size checks
- **CORS protection**: Configurable origins
- **Input sanitization**: SQL injection prevention

## 📱 Frontend Features

- **Drag & Drop**: Intuitive file upload
- **Progress Bar**: Upload progress indication
- **Image Preview**: Thumbnail generation
- **Responsive Grid**: Mobile-friendly layout
- **Real-time Stats**: Image count and storage
- **Error Handling**: User-friendly messages

## 🧪 Testing

```bash
# Start development server
npm run dev

# Test upload endpoint
curl -X POST -F "file=@test.jpg" -F "author=Test" http://localhost:3001/api/upload

# Test health endpoint
curl http://localhost:3001/api/health
```

## 🚀 Production Deployment

1. **Environment**:
   ```env
   NODE_ENV=production
   PORT=3001
   ```

2. **Process Manager**:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "image-panel"
   ```

3. **Nginx Proxy** (optional):
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     
     location / {
       proxy_pass http://localhost:3001;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection**:
   - Check `NEON_DATABASE_URL` format
   - Verify SSL settings
   - Test connection with `npm run test-db`

2. **S3 Upload Errors**:
   - Verify AWS credentials
   - Check bucket permissions
   - Confirm region settings

3. **File Upload Issues**:
   - Check file size limits
   - Verify supported formats
   - Review server logs

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm start

# Check server logs
tail -f logs/server.log
```

## 📄 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**Built with ❤️ using Node.js, Express, Sharp, AWS S3, and PostgreSQL**