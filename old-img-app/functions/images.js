const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
  console.log(`🚀 Images API called: ${event.httpMethod} ${event.path}`);
  console.log('📋 Query params:', event.queryStringParameters);
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
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

  let client;
  
  try {
    client = await pool.connect();
    
    switch (event.httpMethod) {
      case 'GET':
        return await handleGet(client, event, headers);
      case 'POST':
        return await handlePost(client, event, headers);
      case 'DELETE':
        return await handleDelete(client, event, headers);
      case 'PUT':
        return await handlePut(client, event, headers);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Database error:', error);
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

// GET - Retrieve all images
async function handleGet(client, event, headers) {
  try {
    console.log('🔍 Fetching images from database...');
    const result = await client.query('SELECT * FROM images ORDER BY created_at DESC');
    console.log(`✅ Found ${result.rows.length} images in database`);
    
    // Log first image for debugging
    if (result.rows.length > 0) {
      console.log('📸 First image sample:', {
        id: result.rows[0].id,
        filename: result.rows[0].filename,
        urls: typeof result.rows[0].urls === 'string' ? 'string' : 'object',
        created_at: result.rows[0].created_at
      });
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.rows)
    };
  } catch (error) {
    console.error('❌ Error fetching images:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch images' })
    };
  }
}

// POST - Create new image record
async function handlePost(client, event, headers) {
  try {
    const { author, urls, width, height } = JSON.parse(event.body);
    
    if (!author || !urls) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Author and URLs are required' })
      };
    }

    const result = await client.query(
      'INSERT INTO images (author, urls, width, height) VALUES ($1, $2, $3, $4) RETURNING *',
      [author, JSON.stringify(urls), width || null, height || null]
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(result.rows[0])
    };
  } catch (error) {
    console.error('Error creating image:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create image record' })
    };
  }
}

// DELETE - Delete image by ID
async function handleDelete(client, event, headers) {
  try {
    const id = event.queryStringParameters?.id;
    
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image ID is required' })
      };
    }

    const result = await client.query('DELETE FROM images WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Image not found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Image deleted successfully', image: result.rows[0] })
    };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete image' })
    };
  }
}

// PUT - Update image by ID
async function handlePut(client, event, headers) {
  try {
    const id = event.queryStringParameters?.id;
    const { author, width, height } = JSON.parse(event.body);
    
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image ID is required' })
      };
    }

    const result = await client.query(
      'UPDATE images SET author = COALESCE($1, author), width = COALESCE($2, width), height = COALESCE($3, height) WHERE id = $4 RETURNING *',
      [author, width, height, id]
    );
    
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Image not found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.rows[0])
    };
  } catch (error) {
    console.error('Error updating image:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update image' })
    };
  }
}