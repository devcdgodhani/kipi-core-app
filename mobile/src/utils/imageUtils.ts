/**
 * Utility to safely extract URL from various image data formats returned by the backend.
 * Handles string URIs, populated FileStorage objects, and media arrays.
 */
export const getSafeImageUrl = (imageSource: any): string | null => {
  if (!imageSource) return null;

  // If it's already a string, return it
  if (typeof imageSource === 'string') {
    return imageSource;
  }

  // If it's a populated FileStorage object or a banner/product object
  if (typeof imageSource === 'object') {
    // 1. Check for preSignedUrl (common in our backend enrichment)
    if (imageSource.preSignedUrl) return imageSource.preSignedUrl;
    
    // 2. Check for direct url field
    if (imageSource.url) return imageSource.url;
    
    // 3. Check for mobile image specifically if it's a banner object
    if (imageSource.mobileImageId) {
      if (typeof imageSource.mobileImageId === 'string') return imageSource.mobileImageId;
      return imageSource.mobileImageId.preSignedUrl || imageSource.mobileImageId.url || null;
    }

    // 4. Check for standard imageId property
    if (imageSource.imageId) {
      if (typeof imageSource.imageId === 'string') return imageSource.imageId;
      return imageSource.imageId.preSignedUrl || imageSource.imageId.url || null;
    }

    // 5. Check for mainImage (if product object passed)
    if (imageSource.mainImage) {
      if (typeof imageSource.mainImage === 'string') return imageSource.mainImage;
      return imageSource.mainImage.preSignedUrl || imageSource.mainImage.url || null;
    }

    // 6. Check for fileStorageId (common in media arrays)
    if (imageSource.fileStorageId) {
      if (typeof imageSource.fileStorageId === 'string') return imageSource.fileStorageId;
      return imageSource.fileStorageId.preSignedUrl || imageSource.fileStorageId.url || null;
    }
  }

  return null;
};
