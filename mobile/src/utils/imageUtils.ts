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

    // 4. Check for standard imageId property which might be nested object
    if (imageSource.imageId) {
      if (typeof imageSource.imageId === 'string') return imageSource.imageId;
      return imageSource.imageId.preSignedUrl || imageSource.imageId.url || null;
    }
  }

  return null;
};
