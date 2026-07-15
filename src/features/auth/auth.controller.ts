import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    const result = await authService.register({ name, email, password });
    
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    sendSuccess(res, { user: result.user, token: result.token }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.login({ email, password });
    
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    sendSuccess(res, { user: result.user, token: result.token }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    
    console.log('[Google OAuth] Received token:', token ? `${token.substring(0, 10)}...` : 'MISSING');
    
    const googleUser = await verifyGoogleToken(token);
    
    console.log('[Google OAuth] Verified user:', { email: googleUser.email, sub: googleUser.sub });
    
    const result = await authService.googleAuth({
      email: googleUser.email,
      name: googleUser.name,
      googleId: googleUser.sub,
      avatar: googleUser.picture,
    });
    
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    sendSuccess(res, { user: result.user, token: result.token }, 'Google login successful');
  } catch (error) {
    console.error('[Google OAuth] Error:', error instanceof Error ? error.message : error);
    next(error);
  }
};

export const githubLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new AppError('GitHub authorization code is required', 400);
    }

    const githubUser = await exchangeGithubCode(code);

    const result = await authService.githubAuth({
      email: githubUser.email,
      name: githubUser.name,
      githubId: githubUser.id.toString(),
      avatar: githubUser.avatar_url,
    });

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, { user: result.user, token: result.token }, 'GitHub login successful');
  } catch (error) {
    next(error);
  }
};

export const facebookLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new AppError('Facebook authorization code is required', 400);
    }

    const accessToken = await exchangeFacebookCode(code);
    const facebookUser = await verifyFacebookToken(accessToken);

    const result = await authService.facebookAuth({
      email: facebookUser.email,
      name: facebookUser.name,
      facebookId: facebookUser.id,
      avatar: facebookUser.picture?.data?.url,
    });

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, { user: result.user, token: result.token }, 'Facebook login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    const user = await authService.getCurrentUser(req.user._id);
    
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    const user = await authService.updateProfile(req.user._id, req.body);
    
    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    const { currentPassword, newPassword } = req.body;
    
    await authService.changePassword(req.user._id, currentPassword, newPassword);
    
    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

async function verifyGoogleToken(code: string): Promise<GoogleUser> {
  const tokenParams = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirect_uri: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`,
    grant_type: 'authorization_code',
  });

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams,
  });

  const tokens = await tokenResponse.json() as Record<string, string>;

  if (!tokenResponse.ok || tokens.error) {
    console.error('[Google OAuth] Token exchange failed:', {
      status: tokenResponse.status,
      error: tokens.error,
      error_description: tokens.error_description,
    });
    throw new AppError(tokens.error_description || 'Google token exchange failed', 401);
  }

  if (!tokens.id_token) {
    console.error('[Google OAuth] No id_token in response:', Object.keys(tokens));
    throw new AppError('No id_token received from Google', 401);
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`
  );

  if (!response.ok) {
    console.error('[Google OAuth] Token verification failed:', response.status);
    throw new AppError('Invalid Google token', 401);
  }

  const data = await response.json() as Record<string, string>;

  return {
    sub: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

interface GithubUser {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
}

async function exchangeGithubCode(code: string): Promise<GithubUser> {
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  if (!tokenResponse.ok) {
    throw new AppError('Failed to exchange GitHub code', 401);
  }

  const tokenData = await tokenResponse.json() as Record<string, string>;

  if (tokenData.error) {
    throw new AppError(tokenData.error_description || 'GitHub OAuth failed', 401);
  }

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: 'application/json',
    },
  });

  if (!userResponse.ok) {
    throw new AppError('Failed to fetch GitHub user info', 401);
  }

  const userData = await userResponse.json() as Record<string, unknown>;

  let email = userData.email as string | undefined;

  if (!email) {
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
      },
    });

    if (emailsResponse.ok) {
      const emails = await emailsResponse.json() as Array<{ primary: boolean; verified: boolean; email: string }>;
      const primaryEmail = emails.find((e) => e.primary && e.verified);
      const verifiedEmail = emails.find((e) => e.verified);
      email = primaryEmail?.email || verifiedEmail?.email || emails[0]?.email;
    }
  }

  if (!email) {
    throw new AppError('GitHub account has no verified email', 400);
  }

  return {
    id: userData.id as number,
    email,
    name: (userData.name as string) || (userData.login as string),
    avatar_url: userData.avatar_url as string | undefined,
  };
}

interface FacebookUser {
  id: string;
  email: string;
  name: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

async function verifyFacebookToken(accessToken: string): Promise<FacebookUser> {
  const response = await fetch(
    `https://graph.facebook.com/me?fields=id,email,name,picture.type(large)&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new AppError('Invalid Facebook token', 401);
  }

  const data = await response.json() as Record<string, unknown>;

  if (data.error) {
    throw new AppError((data.error as { message?: string }).message || 'Facebook token verification failed', 401);
  }

  if (!data.email) {
    throw new AppError('Facebook account has no email', 400);
  }

  return {
    id: data.id as string,
    email: data.email as string,
    name: data.name as string,
    picture: data.picture as FacebookUser['picture'],
  };
}

async function exchangeFacebookCode(code: string): Promise<string> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/callback`)}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`
  );

  if (!response.ok) {
    throw new AppError('Failed to exchange Facebook code', 401);
  }

  const data = await response.json() as Record<string, unknown>;

  if (data.error) {
    throw new AppError((data.error as { message?: string }).message || 'Facebook code exchange failed', 401);
  }

  return data.access_token as string;
}
