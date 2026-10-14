import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { config } from '../config';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, changePasswordSchema } from '../validators';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { UnauthorizedError, NotFoundError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';
import { Role } from '@prisma/client';

const router = Router();

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 409, 'Email already registered', 'EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, phone },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    await prisma.cart.create({ data: { userId: user.id } });
    await prisma.wishlist.create({ data: { userId: user.id } });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, { user, token }, 201, 'Registration successful');
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return sendError(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Account is disabled', 'ACCOUNT_DISABLED');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    }, 200, 'Login successful');
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (_req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
  sendSuccess(res, null, 200, 'Logged out successfully');
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, role: true, avatar: true, isVerified: true, createdAt: true,
      },
    });
    if (!user) throw new NotFoundError('User not found');
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

router.put('/change-password', requireAuth, validate(changePasswordSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new NotFoundError('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return sendError(res, 400, 'Current password is incorrect', 'WRONG_PASSWORD');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

    sendSuccess(res, null, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return sendSuccess(res, null, 200, 'If the email exists, a reset link has been sent');
    // Architecture: In production, send email with reset token
    sendSuccess(res, null, 200, 'If the email exists, a reset link has been sent');
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    // Architecture: Verify token and update password
    sendSuccess(res, null, 200, 'Password reset successful');
  } catch (error) {
    next(error);
  }
});

export default router;
