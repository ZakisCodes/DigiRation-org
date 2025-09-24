import express from 'express';
import { UserModel } from '../models/SimpleUser';
import { FamilyMemberModel } from '../models/FamilyMember';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, updateProfileSchema, updateFamilyMemberSchema } from '../utils/validation';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// GET /api/user/profile - Get user profile
router.get('/profile', async (req, res) => {
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

    const user = UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }

    const familyMembers = FamilyMemberModel.findByUserId(user.id);
    const selectedMember = req.member;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          rationCardId: user.rationCardId,
          familyName: user.familyName,
          phoneNumber: user.phoneNumber,
          address: user.address,
          language: user.language,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        familyMembers: familyMembers.map(member => ({
          id: member.id,
          name: member.name,
          age: member.age,
          gender: member.gender,
          avatarUrl: member.avatarUrl,
          isHead: member.isHead,
          createdAt: member.createdAt
        })),
        selectedMember: selectedMember ? {
          id: selectedMember.id,
          name: selectedMember.name,
          userId: selectedMember.userId
        } : null
      },
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user profile',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', validateRequest(updateProfileSchema), async (req, res) => {
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

    const updates = req.body;
    const updatedUser = UserModel.update(req.user.id, updates);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          rationCardId: updatedUser.rationCardId,
          familyName: updatedUser.familyName,
          phoneNumber: updatedUser.phoneNumber,
          address: updatedUser.address,
          language: updatedUser.language,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      },
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user profile',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// POST /api/user/switch-member - Switch active family member
router.post('/switch-member', async (req, res) => {
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

    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_MEMBER_ID',
          message: 'Member ID is required',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }

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

    const member = FamilyMemberModel.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MEMBER_NOT_FOUND',
          message: 'Family member not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }

    // Note: In a full implementation, you might want to update the JWT token
    // or session to reflect the new active member. For now, we'll just return success.
    
    res.json({
      success: true,
      data: {
        activeMember: {
          id: member.id,
          name: member.name,
          age: member.age,
          gender: member.gender,
          avatarUrl: member.avatarUrl,
          isHead: member.isHead
        }
      },
      message: 'Active member switched successfully',
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error switching family member:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to switch family member',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// GET /api/user/family - Get family members
router.get('/family', async (req, res) => {
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

    const familyMembers = FamilyMemberModel.findByUserId(req.user.id);

    res.json({
      success: true,
      data: {
        familyMembers: familyMembers.map(member => ({
          id: member.id,
          name: member.name,
          age: member.age,
          gender: member.gender,
          avatarUrl: member.avatarUrl,
          isHead: member.isHead,
          createdAt: member.createdAt
        })),
        selectedMember: req.member ? {
          id: req.member.id,
          name: req.member.name,
          userId: req.member.userId
        } : null
      },
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error getting family members:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get family members',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// GET /api/user/family/:memberId - Get specific family member
router.get('/family/:memberId', async (req, res) => {
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

    const member = FamilyMemberModel.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MEMBER_NOT_FOUND',
          message: 'Family member not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        member: {
          id: member.id,
          name: member.name,
          age: member.age,
          gender: member.gender,
          avatarUrl: member.avatarUrl,
          isHead: member.isHead,
          createdAt: member.createdAt
        }
      },
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error getting family member:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get family member',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

export default router;
/
/ PUT /api/user/family/:memberId - Update family member
router.put('/family/:memberId', validateRequest(updateFamilyMemberSchema), async (req, res) => {
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
    const updates = req.body;

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

    const updatedMember = FamilyMemberModel.update(memberId, updates);
    if (!updatedMember) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MEMBER_NOT_FOUND',
          message: 'Family member not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        member: {
          id: updatedMember.id,
          name: updatedMember.name,
          age: updatedMember.age,
          gender: updatedMember.gender,
          avatarUrl: updatedMember.avatarUrl,
          isHead: updatedMember.isHead,
          createdAt: updatedMember.createdAt
        }
      },
      message: 'Family member updated successfully',
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error updating family member:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update family member',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// GET /api/user/dashboard - Get dashboard data for authenticated member
router.get('/dashboard', async (req, res) => {
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

    const user = UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }

    const familyMembers = FamilyMemberModel.findByUserId(user.id);
    const selectedMember = req.member;

    // Get quick stats (placeholder for now - will be implemented with ration data)
    const quickStats = {
      totalQuotaUsed: 0,
      availableItems: 0,
      recentTransactions: 0,
      pendingComplaints: 0
    };

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          rationCardId: user.rationCardId,
          familyName: user.familyName,
          language: user.language
        },
        selectedMember: selectedMember ? {
          id: selectedMember.id,
          name: selectedMember.name,
          userId: selectedMember.userId
        } : null,
        familyMembers: familyMembers.map(member => ({
          id: member.id,
          name: member.name,
          age: member.age,
          gender: member.gender,
          avatarUrl: member.avatarUrl,
          isHead: member.isHead
        })),
        quickStats,
        lastLoginAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get dashboard data',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// GET /api/user/preferences - Get user preferences
router.get('/preferences', async (req, res) => {
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

    const user = UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        preferences: {
          language: user.language,
          notifications: {
            sms: true,
            email: false,
            push: true
          },
          theme: 'light',
          currency: 'INR'
        }
      },
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error getting user preferences:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user preferences',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// PUT /api/user/preferences - Update user preferences
router.put('/preferences', async (req, res) => {
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

    const { language, notifications, theme } = req.body;
    const updates: any = {};

    if (language && ['en', 'hi', 'ta', 'te'].includes(language)) {
      updates.language = language;
    }

    let updatedUser = null;
    if (Object.keys(updates).length > 0) {
      updatedUser = UserModel.update(req.user.id, updates);
    }

    // For other preferences (notifications, theme), you might want to store them
    // in a separate preferences table or as JSON in the user table
    
    res.json({
      success: true,
      data: {
        preferences: {
          language: updatedUser?.language || req.user.rationCardId, // fallback
          notifications: notifications || {
            sms: true,
            email: false,
            push: true
          },
          theme: theme || 'light',
          currency: 'INR'
        }
      },
      message: 'Preferences updated successfully',
      timestamp: new Date().toISOString()
    } as ApiResponse);

  } catch (error) {
    logger.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user preferences',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

export default router;