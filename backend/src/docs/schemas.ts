/**
 * @swagger
 * components:
 *   schemas:
 *     Lot:
 *       type: object
 *       required:
 *         - lotNumber
 *         - sku
 *         - sourceType
 *         - costPerUnit
 *         - initialQuantity
 *       properties:
 *         _id:
 *           type: string
 *           description: Lot ID
 *         lotNumber:
 *           type: string
 *           description: Unique lot number
 *         sku:
 *           type: string
 *           description: SKU ID reference
 *         sourceType:
 *           type: string
 *           enum: [SELF_MANUFACTURE, SUPPLIER]
 *         supplierId:
 *           type: string
 *           description: Supplier user ID (if sourceType is SUPPLIER)
 *         manufacturingDate:
 *           type: string
 *           format: date-time
 *         expiryDate:
 *           type: string
 *           format: date-time
 *         costPerUnit:
 *           type: number
 *         initialQuantity:
 *           type: number
 *         currentQuantity:
 *           type: number
 *         reservedQuantity:
 *           type: number
 *         soldQuantity:
 *           type: number
 *         damagedQuantity:
 *           type: number
 *         qualityCheckStatus:
 *           type: string
 *           enum: [PENDING, PASSED, FAILED]
 *     
 *     Price:
 *       type: object
 *       required:
 *         - sku
 *         - mrp
 *         - sellingPrice
 *       properties:
 *         _id:
 *           type: string
 *         sku:
 *           type: string
 *         mrp:
 *           type: number
 *         sellingPrice:
 *           type: number
 *         costPrice:
 *           type: number
 *         marginAmount:
 *           type: number
 *         marginPercentage:
 *           type: number
 *         bulkPricingRules:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               minQuantity:
 *                 type: number
 *               maxQuantity:
 *                 type: number
 *               price:
 *                 type: number
 *         isActive:
 *           type: boolean
 *     
 *     Inventory:
 *       type: object
 *       properties:
 *         sku:
 *           type: string
 *         totalQuantity:
 *           type: number
 *         availableQuantity:
 *           type: number
 *         reservedQuantity:
 *           type: number
 *         lowStockThreshold:
 *           type: number
 *         reorderPoint:
 *           type: number
 *     
 *     PaymentConfig:
 *       type: object
 *       properties:
 *         entityType:
 *           type: string
 *           enum: [CATEGORY, PRODUCT]
 *         entityId:
 *           type: string
 *         codEnabled:
 *           type: boolean
 *         prepaidEnabled:
 *           type: boolean
 *         codCharges:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [FIXED, PERCENTAGE]
 *             value:
 *               type: number
 *     
 *     Coupon:
 *       type: object
 *       required:
 *         - code
 *         - discountType
 *         - discountValue
 *         - applicability
 *       properties:
 *         code:
 *           type: string
 *         description:
 *           type: string
 *         discountType:
 *           type: string
 *           enum: [PERCENTAGE, FIXED, BOGO]
 *         discountValue:
 *           type: number
 *         applicability:
 *           type: string
 *           enum: [CART, CATEGORY, PRODUCT, USER_SEGMENT]
 *         minCartValue:
 *           type: number
 *         maxDiscountCap:
 *           type: number
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 */

export {};
