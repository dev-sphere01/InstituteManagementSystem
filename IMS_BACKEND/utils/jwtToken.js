// Create Token and saving in cookie
const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();

    // options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    // Create clean user object without sensitive fields
    const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // This will include full role data with permissions
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        loginAttempts: user.loginAttempts,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        phone: user.phone,
        address: user.address,
        isPassNew: user.isPassNew // Add isPassNew to response
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user: userResponse,
        token,
    });
};

module.exports = sendToken;