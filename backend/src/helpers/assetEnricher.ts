import { fileStorageService } from '../services/concrete/fileStorageService';
import { FILE_TYPE } from '../constants';

export const enrichProductWithPresignedUrls = async (product: any) => {
  if (!product) return;

  // Enrich Main Image
  if (product.mainImage && typeof product.mainImage === 'object') {
    await fileStorageService.ensurePresignedUrl(product.mainImage);
  }

  // Enrich Media
  if (product.media && Array.isArray(product.media)) {
    await Promise.all(product.media.map(async (m: any) => {
      if (m.fileStorageId && typeof m.fileStorageId === 'object') {
        await fileStorageService.ensurePresignedUrl(m.fileStorageId);
        m.url = m.fileStorageId.preSignedUrl;
      }
    }));
  }

  // Enrich SKUs
  if (product.skus && Array.isArray(product.skus)) {
    await Promise.all(product.skus.map(async (sku: any) => {
      if (sku.media && Array.isArray(sku.media)) {
        await Promise.all(sku.media.map(async (m: any) => {
          if (m.fileStorageId && typeof m.fileStorageId === 'object') {
            await fileStorageService.ensurePresignedUrl(m.fileStorageId);
            m.url = m.fileStorageId.preSignedUrl;
          }
        }));
      }
    }));
  }
};

export const enrichBannerWithPresignedUrls = async (banner: any) => {
  if (!banner) return;

  if (banner.imageId && typeof banner.imageId === 'object') {
    await fileStorageService.ensurePresignedUrl(banner.imageId);
  }

  if (banner.mobileImageId && typeof banner.mobileImageId === 'object') {
    await fileStorageService.ensurePresignedUrl(banner.mobileImageId);
  }
};

export const enrichOrderWithPresignedUrls = async (order: any) => {
  if (!order || !order.items) return;

  await Promise.all(order.items.map(async (item: any) => {
    // If productId is populated, enrich it
    if (item.productId && typeof item.productId === 'object') {
      await enrichProductWithPresignedUrls(item.productId);
      // Optionally update the item.image if it's missing or we want latest
      if (!item.image || item.image.includes('placeholder')) {
        item.image = item.productId.mainImage?.preSignedUrl || item.productId.mainImage;
      }
    }
    
    // If skuId is populated, enrich it
    if (item.skuId && typeof item.skuId === 'object') {
      await enrichProductWithPresignedUrls(item.skuId);
      if (item.skuId.media && item.skuId.media.length > 0) {
        item.image = item.skuId.media[0].fileStorageId?.preSignedUrl || item.skuId.media[0].url;
      }
    }
  }));
};

export const enrichCategoryWithPresignedUrls = async (category: any) => {
  if (!category) return;

  if (category.image && typeof category.image === 'object') {
    await fileStorageService.ensurePresignedUrl(category.image);
  }
};
