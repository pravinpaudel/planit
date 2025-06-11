const { UserService } = require("../service/userService");

async function handleLogin(req, res) {
  try {

    // Validate request body
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user exists
    const user = await UserService.getUserByEmail(req.body.email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify password
    const hash = UserService.createHash(req.body.password, user.salt);
    if (hash !== user.password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate token
    const token = await UserService.generateUserToken({ email: user.email });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function handleRegister(req, res) {
  try {
    // Validate request body
    if (!req.body.email || !req.body.password || !req.body.firstName) {
      return res.status(400).json({ error: "All fields are required" });
    }
    await UserService.createUser(req.body);

    // Generate token after successful registration
    const token = await UserService.generateUserToken({ email: req.body.email });
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  handleLogin,
  handleRegister
};