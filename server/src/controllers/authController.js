//const authService = require('../services/authService');

async function signup(req, res, next) {
  console.log('Signup request received');
  try {
    console.log('Signup request body:', req.body);
    const { name, email, password } = req.body;
    //const { user, token } = await authService.signup({ name, email, password });

    res.status(201).json({
      status: 'success',
     // token,
      //data: { user },
    });
  } catch (error) {
    //next(error);
    console.error('Error during signup:', error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    //const { user, token } = await authService.login({ email, password });

    res.status(200).json({
      status: 'success',
      //token,
      //data: { user },
    });
  } catch (error) {
    next(error);
  }
}

async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;
    //const { resetToken, expiresAt } = await authService.requestPasswordReset(email);

    res.status(200).json({
      status: 'success',
      //data: {
      //  resetToken,
      //  expiresAt,
      //},
    });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const token = req.params.token || req.body.token;
    const { password } = req.body;
    //const { user, token: authToken } = await authService.resetPassword({ token, password });

    res.status(200).json({
      status: 'success',
      //token: authToken,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  signup,
  login,
  requestPasswordReset,
  resetPassword,
};