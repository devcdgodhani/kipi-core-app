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

  // If it's a populated FileStorage object
  if (typeof imageSource === 'object') {
    // Check for preSignedUrl (common in our backend enrichment)
    if (imageSource.preSignedUrl) return imageSource.preSignedUrl;
    
    // Check for direct url field
    if (imageSource.url) return imageSource.url;
    
    // Check for imageId property which might be nested object
    if (imageSource.imageId && typeof imageSource.imageId === 'object') {
      return imageSource.imageId.preSignedUrl || imageSource.imageId.url || null;
    }
  }

  return null;
};
