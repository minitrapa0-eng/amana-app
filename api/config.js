require("dotenv").config();

module.exports = {
  port:        process.env.PORT        || 4000,
  nodeEnv:     process.env.NODE_ENV    || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwt: {
    accessSecret:   process.env.JWT_ACCESS_SECRET   || "dev_access_secret",
    refreshSecret:  process.env.JWT_REFRESH_SECRET  || "dev_refresh_secret",
    accessExpires:  process.env.JWT_ACCESS_EXPIRES  || "15m",
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  },
  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    lockoutMinutes:   parseInt(process.env.LOCKOUT_MINUTES, 10)   || 15,
    bcryptRounds:     10,
  },
};
