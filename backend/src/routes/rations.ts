import express from 'express';
import { authenticateToken, requireMember } from '../middleware/auth';
import { RationItemModel } from '../models/RationItem';
import { MemberQuotaModel } from '../models/MemberQuota';
import { ShopStockModel, ShopModel } from '../models/ShopStock';
import { FamilyMemberModel } from '../models/FamilyMember';
import { logger } from '../utils/logger';
import { ApiResponse, Language } from '../types';

const router = express.Router();

// All ration routes require authentication
router.use(authenticateToken);

// GET /api/rations/items - Get ration items
router.get('/items', async (req, res) => {
  try {
    const { category, search, language = 'en' } = req.query;
    
    let items;
    
    if (search) {
      items = RationItemModel.searchByName(search as string, language as Language);
    } else if (category) {
      items = RationItemModel.findByCategory(category as string);
    } else {
      items = RationItemModel.findAllActive();
    }

    // Get user's language preference for localized names
    const userLanguage = (req.user && req.user.rationCardId) ? 'en' : language as Language;

    const localizedItems = items.map(item => ({
      id: item.id,
      name: RationItemModel.getLocalizedName(item, userLanguage),
      nameTranslations: item.nameTranslations,
      category: item.category,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      imageUrl: item.imageUrl,
      isActive: item.isActive
    }));

    const categories = RationItemModel.getCategories();

    res.json({
      success: true,
      data: {
        items: localizedItems,
        categories,
        totalItems: localizedItems.length,
        filters: {
          category: category || null,
          search: search || null,
          language: userLanguage
        }
      },
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error getting ration items:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get ration items',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// GET /api/rations/quota/:memberId - Get member quota
router.get('/quota/:memberId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }

    const { memberId } = req.params;

    // Validate member belongs to user
    const isValidMember = FamilyMemberModel.validateMemberBelongsToUser(memberId, req.user.id);
    if (!isValidMember) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied to this family member',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }

    const quotas = MemberQuotaModel.findByMemberId(memberId);
    const quotaSummary = MemberQuotaModel.getQuotaSummary(memberId);
    const member = FamilyMemberModel.findById(memberId);

    // Enrich quotas with item details
    const enrichedQuotas = quotas.map(quota => {
      const item = RationItemModel.findById(quota.itemId);
      const remainingQuota = quota.monthlyLimit - quota.currentUsed;
      const usagePercent = quota.monthlyLimit > 0 ? (quota.currentUsed / quota.monthlyLimit) * 100 : 0;

      return {
        id: quota.id,
        itemId: quota.itemId,
        itemName: item?.name || 'Unknown Item',
        itemUnit: item?.unit || 'unit',
        monthlyLimit: quota.monthlyLimit,
        currentUsed: quota.currentUsed,
        remainingQuota,
        usagePercent: Math.round(usagePercent),
        resetDate: quota.resetDate,
        status: remainingQuota <= 0 ? 'exhausted' : remainingQuota <= quota.monthlyLimit * 0.2 ? 'low' : 'available'
      };
    });

    res.json({
      success: true,
      data: {
        member: member ? {
          id: member.id,
          name: member.name,
          age: member.age
        } : null,
        quotas: enrichedQuotas,
        summary: quotaSummary
      },
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error getting member quota:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get member quota',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// GET /api/rations/stock/:shopId - Get shop stock
router.get('/stock/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = ShopModel.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SHOP_NOT_FOUND',
          message: 'Shop not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }

    const stock = ShopStockModel.findByShopId(shopId);
    const stockSummary = ShopStockModel.getStockSummary(shopId);
    const lowStockItems = ShopStockModel.getLowStockItems(shopId);

    // Enrich stock with item details
    const enrichedStock = stock.map((stockItem: any) => {
      const item = RationItemModel.findById(stockItem.itemId);
      const effectivePrice = stockItem.priceOverride || item?.pricePerUnit || 0;

      return {
        id: stockItem.id,
        itemId: stockItem.itemId,
        itemName: item?.name || 'Unknown Item',
        itemUnit: item?.unit || 'unit',
        itemCategory: item?.category || 'other',
        availableQuantity: stockItem.availableQuantity,
        basePrice: item?.pricePerUnit || 0,
        effectivePrice,
        priceOverride: stockItem.priceOverride,
        lastUpdated: stockItem.lastUpdated,
        status: stockItem.availableQuantity <= 0 ? 'out_of_stock' : 
                stockItem.availableQuantity <= 10 ? 'low_stock' : 'in_stock'
      };
    });

    res.json({
      success: true,
      data: {
        shop: {
          id: shop.id,
          name: shop.name,
          address: shop.address,
          phoneNumber: shop.phoneNumber
        },
        stock: enrichedStock,
        summary: stockSummary,
        lowStockItems: lowStockItems.length
      },
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error getting shop stock:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get shop stock',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// GET /api/rations/shops - Get available shops
router.get('/shops', async (req, res) => {
  try {
    const { city, pincode } = req.query;
    
    let shops;
    
    if (city) {
      shops = ShopModel.findByCity(city as string);
    } else if (pincode) {
      shops = ShopModel.findByPincode(pincode as string);
    } else {
      shops = ShopModel.findAllActive();
    }

    const shopsWithSummary = shops.map(shop => {
      const summary = ShopStockModel.getStockSummary(shop.id);
      return {
        id: shop.id,
        name: shop.name,
        address: shop.address,
        phoneNumber: shop.phoneNumber,
        stockSummary: summary
      };
    });

    res.json({
      success: true,
      data: {
        shops: shopsWithSummary,
        totalShops: shopsWithSummary.length,
        filters: {
          city: city || null,
          pincode: pincode || null
        }
      },
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error getting shops:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get shops',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// GET /api/rations/availability - Check item availability for member
router.get('/availability', requireMember, async (req, res) => {
  try {
    const { itemId, quantity, shopId } = req.query;

    if (!itemId || !quantity || !shopId || !req.member) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'itemId, quantity, shopId are required',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }

    const requestedQuantity = parseFloat(quantity as string);
    
    // Check quota availability
    const quotaCheck = MemberQuotaModel.checkAvailableQuota(
      req.member.id, 
      itemId as string, 
      requestedQuantity
    );

    // Check stock availability
    const stockCheck = ShopStockModel.checkAvailability(
      shopId as string,
      itemId as string,
      requestedQuantity
    );

    const item = RationItemModel.findById(itemId as string);
    const shop = ShopModel.findById(shopId as string);

    const canPurchase = quotaCheck.available && stockCheck.available;

    res.json({
      success: true,
      data: {
        item: item ? {
          id: item.id,
          name: item.name,
          unit: item.unit,
          pricePerUnit: item.pricePerUnit
        } : null,
        shop: shop ? {
          id: shop.id,
          name: shop.name
        } : null,
        member: {
          id: req.member.id,
          name: req.member.name
        },
        requestedQuantity,
        quotaCheck,
        stockCheck,
        canPurchase,
        estimatedCost: canPurchase ? requestedQuantity * (item?.pricePerUnit || 0) : 0
      },
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to check availability',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

export default router;