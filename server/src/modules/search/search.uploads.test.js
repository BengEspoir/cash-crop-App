const express = require('express');
const request = require('supertest');
const {
  searchImageUpload,
  IMAGE_MAX_BYTES
} = require('./search.uploads');

const buildApp = () => {
  const app = express();
  app.post('/image', searchImageUpload, (req, res) => {
    res.json({ received: req.file?.mimetype });
  });
  return app;
};

describe('marketplace search uploads', () => {
  test('accepts a supported agricultural image format', async () => {
    const response = await request(buildApp())
      .post('/image')
      .attach('image', Buffer.from('image-data'), {
        filename: 'crop.png',
        contentType: 'image/png'
      });

    expect(response.status).toBe(200);
    expect(response.body.received).toBe('image/png');
  });

  test('rejects unsupported image formats and oversized payloads', async () => {
    const unsupported = await request(buildApp())
      .post('/image')
      .attach('image', Buffer.from('not-image'), {
        filename: 'crop.txt',
        contentType: 'text/plain'
      });
    expect(unsupported.status).toBe(400);
    expect(unsupported.body.message).toMatch(/unsupported image format/i);

    const oversized = await request(buildApp())
      .post('/image')
      .attach('image', Buffer.alloc(IMAGE_MAX_BYTES + 1), {
        filename: 'crop.jpg',
        contentType: 'image/jpeg'
      });
    expect(oversized.status).toBe(400);
    expect(oversized.body.message).toMatch(/too large/i);
  });
});
