# Custom Thumbnail Upload Feature

This document explains the enhanced thumbnail functionality that allows users to upload custom thumbnails for comic books.

## Overview

The thumbnail system has been enhanced to support two types of thumbnails:

1. **Generated Thumbnails**: Automatically created from cover pages within the comic book file
2. **Custom Thumbnails**: User-uploaded images that serve as alternative thumbnails

## Database Schema Changes

The `comic_book_thumbnails` table has been updated with the following changes:

### New Fields:
- `comic_book_id` (required): Direct reference to the comic book
- `comic_book_cover_id` (optional): Reference to cover page (null for custom thumbnails)
- `thumbnail_type`: Either "generated" or "custom"
- `name` (optional): Display name for custom thumbnails
- `description` (optional): Description for custom thumbnails
- `uploaded_by` (optional): User ID who uploaded custom thumbnail

### Relationship Changes:
- Thumbnails can now be linked directly to comic books OR through cover pages
- Custom thumbnails bypass the page→cover→thumbnail chain
- Generated thumbnails maintain the existing page→cover→thumbnail relationship

## API Endpoints

### Create Custom Thumbnail
**POST** `/api/comic-books/:id/thumbnails`

**Authentication**: Required (Bearer token)

**Content-Type**: `multipart/form-data`

**Request Body**:
```
image: File (required) - Image file (JPEG, PNG, WebP)
name: string (optional) - Display name for the thumbnail
description: string (optional) - Description of the thumbnail
```

**Response** (201 Created):
```json
{
  "message": "Custom thumbnail created successfully",
  "thumbnail": {
    "id": 123,
    "filePath": "/app/cache/thumbnails/custom/custom_thumbnail_456_1673024400000.jpg",
    "name": "My Custom Thumbnail",
    "description": "A beautiful custom cover",
    "type": "custom"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid file type or missing image
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Comic book not found
- `500 Internal Server Error`: Server error

### Get All Thumbnails
**GET** `/api/comic-books/:id/thumbnails`

Returns both generated and custom thumbnails for a comic book.

**Response**:
```json
{
  "thumbnails": [
    {
      "id": 1,
      "comic_book_id": 456,
      "comic_book_cover_id": 789,
      "file_path": "/app/cache/thumbnails/generated_456_page1.jpg",
      "thumbnail_type": "generated",
      "name": null,
      "description": null,
      "uploaded_by": null,
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "comic_book_id": 456,
      "comic_book_cover_id": null,
      "file_path": "/app/cache/thumbnails/custom/custom_thumbnail_456_1673024400000.jpg",
      "thumbnail_type": "custom",
      "name": "My Custom Thumbnail",
      "description": "A beautiful custom cover",
      "uploaded_by": 123,
      "created_at": "2025-01-01T11:00:00Z",
      "updated_at": "2025-01-01T11:00:00Z"
    }
  ],
  "message": "Fetched comic book thumbnails successfully"
}
```

## Usage Examples

### Using curl:
```bash
# Upload a custom thumbnail
curl -X POST http://localhost:3000/api/comic-books/456/thumbnails \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/your/image.jpg" \
  -F "name=My Custom Cover" \
  -F "description=A custom thumbnail I created"

# Get all thumbnails for a comic
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/api/comic-books/456/thumbnails
```

### Using JavaScript (with FormData):
```javascript
const uploadCustomThumbnail = async (comicId, imageFile, name, description) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  if (name) formData.append('name', name);
  if (description) formData.append('description', description);

  const response = await fetch(`/api/comic-books/${comicId}/thumbnails`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });

  return response.json();
};

// Example usage
const fileInput = document.getElementById('thumbnail-upload');
const file = fileInput.files[0];

uploadCustomThumbnail(456, file, 'My Custom Thumbnail', 'A beautiful cover')
  .then(result => console.log('Upload successful:', result))
  .catch(error => console.error('Upload failed:', error));
```

## File Storage

### Generated Thumbnails:
- Stored in: `/app/cache/thumbnails/`
- Named: `thumbnail_<comic_id>_<page_number>.jpg`

### Custom Thumbnails:
- Stored in: `/app/cache/thumbnails/custom/`
- Named: `custom_thumbnail_<comic_id>_<timestamp>.jpg`

## Supported File Types

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

## Security Features

- **Authentication Required**: Only authenticated users can upload thumbnails
- **File Type Validation**: Only image files are accepted
- **User Tracking**: Custom thumbnails track which user uploaded them
- **Path Security**: Files are stored in controlled directories

## Database Migration

After updating the schema, run:

```bash
deno task db:generate
deno task db:migrate
```

This will create the necessary migration to update the thumbnails table structure.

## Future Enhancements

Potential improvements for the custom thumbnail system:

1. **Image Processing**: Automatic resizing and optimization of uploaded images
2. **Multiple Sizes**: Generate multiple thumbnail sizes (small, medium, large)
3. **Thumbnail Management**: UI for managing and deleting custom thumbnails
4. **Default Selection**: Allow users to set a default thumbnail for each comic
5. **Bulk Upload**: Support for uploading multiple thumbnails at once
6. **Image Metadata**: Extract and store image metadata (dimensions, format, etc.)

## Migration Notes

- Existing generated thumbnails will continue to work without changes
- The `comic_book_cover_id` field is now optional to support custom thumbnails
- All thumbnails now require a `comic_book_id` to be set
- The worker code has been updated to populate both fields for generated thumbnails