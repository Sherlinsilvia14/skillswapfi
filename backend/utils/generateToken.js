import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'skillswap_default_jwt_secret_key_change_in_production';
  const jwtExpireEnv = process.env.JWT_EXPIRE?.trim();
  const expiresIn = jwtExpireEnv && jwtExpireEnv !== '0' && jwtExpireEnv.toLowerCase() !== '0s' && jwtExpireEnv.toLowerCase() !== '0m' && jwtExpireEnv.toLowerCase() !== '0h'
    ? jwtExpireEnv
    : '7d';

  return jwt.sign({ id }, secret, {
    expiresIn
  });
};

export default generateToken;
