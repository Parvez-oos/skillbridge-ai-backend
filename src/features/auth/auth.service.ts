import { User, IUser } from '../user/user.model';
import { generateToken } from '../../utils/jwt';
import { AppError } from '../../middleware/error.middleware';
import { JwtPayload } from '../../types/shared';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface GoogleAuthInput {
  email: string;
  name: string;
  googleId: string;
  avatar?: string;
}

interface GithubAuthInput {
  email: string;
  name: string;
  githubId: string;
  avatar?: string;
}

interface FacebookAuthInput {
  email: string;
  name: string;
  facebookId: string;
  avatar?: string;
}

export const register = async (input: RegisterInput): Promise<{ user: IUser; token: string }> => {
  const { name, email, password } = input;
  
  const existingUser = await User.findOne({ email });
  
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }
  
  const user = await User.create({
    name,
    email,
    password,
    provider: 'local',
  });
  
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  
  const token = generateToken(payload);
  
  return { user, token };
};

export const login = async (input: LoginInput): Promise<{ user: IUser; token: string }> => {
  const { email, password } = input;
  
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !user.password) {
    throw new AppError('Invalid email or password', 401);
  }
  
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }
  
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  
  const token = generateToken(payload);
  
  return { user, token };
};

export const googleAuth = async (input: GoogleAuthInput): Promise<{ user: IUser; token: string }> => {
  const { email, name, googleId, avatar } = input;
  
  let user = await User.findOne({ $or: [{ email }, { googleId }] });
  
  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.provider = 'google';
      if (avatar) {
        user.avatar = avatar;
      }
      await user.save();
    }
  } else {
    user = await User.create({
      name,
      email,
      googleId,
      avatar,
      provider: 'google',
      isEmailVerified: true,
    });
  }
  
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  
  const token = generateToken(payload);
  
  return { user, token };
};

export const githubAuth = async (input: GithubAuthInput): Promise<{ user: IUser; token: string }> => {
  const { email, name, githubId, avatar } = input;

  let user = await User.findOne({ $or: [{ email }, { githubId }] });

  if (user) {
    if (!user.githubId) {
      user.githubId = githubId;
      user.provider = 'github';
      if (avatar) {
        user.avatar = avatar;
      }
      await user.save();
    }
  } else {
    user = await User.create({
      name,
      email,
      githubId,
      avatar,
      provider: 'github',
      isEmailVerified: true,
    });
  }

  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const token = generateToken(payload);

  return { user, token };
};

export const facebookAuth = async (input: FacebookAuthInput): Promise<{ user: IUser; token: string }> => {
  const { email, name, facebookId, avatar } = input;

  let user = await User.findOne({ $or: [{ email }, { facebookId }] });

  if (user) {
    if (!user.facebookId) {
      user.facebookId = facebookId;
      user.provider = 'facebook';
      if (avatar) {
        user.avatar = avatar;
      }
      await user.save();
    }
  } else {
    user = await User.create({
      name,
      email,
      facebookId,
      avatar,
      provider: 'facebook',
      isEmailVerified: true,
    });
  }

  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const token = generateToken(payload);

  return { user, token };
};

export const getCurrentUser = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return user;
};

export const updateProfile = async (
  userId: string,
  updates: { name?: string; avatar?: string }
): Promise<IUser> => {
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return user;
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select('+password');
  
  if (!user || !user.password) {
    throw new AppError('User not found', 404);
  }
  
  const isPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }
  
  user.password = newPassword;
  await user.save();
};
