import { upsertStreamUser } from '../lib/stream.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';

export async function signup(req, res) {
    // Handle signup logic here
    const { email, password, fullName } = req.body;

    try {
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

      {
        /*
        // 1. Define an array of your favorite avatar styles.
    const avatarStyles = ['adventurer', 'bottts', 'micah', 'pixel-art', 'fun-emoji'];

    // 2. Pick a random style from the array.
    const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];

    // 3. Generate a unique random seed.
    const randomSeed = randomUUID();

    // 4. Combine them to create the final URL.
    const avatarUrl = `https://api.dicebear.com/8.x/${randomStyle}/svg?seed=${encodeURIComponent(randomSeed)}`;
   
        */
      }
    // Use the random seed with your chosen style (e.g., "micah").
    {/* const randomSeed = crypto.randomUUID();

     const avatarUrl = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(randomSeed)}`;// --- CHANGE END ---
*/}

  // 1. Define an array of your favorite avatar styles.
    const avatarStyles = ['adventurer', 'bottts', 'micah', 'pixel-art', 'fun-emoji'];

    // 2. Pick a random style from the array.
    const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];

    // 3. Generate a unique random seed.
    const randomSeed = crypto.randomUUID();

    // 4. Combine them to create the final URL.
    const avatarUrl = `https://api.dicebear.com/8.x/${randomStyle}/svg?seed=${encodeURIComponent(randomSeed)}`;
   
        const newUser = new User({
            email,
            password,
            fullName,
            profilePic: avatarUrl // Assign the new reliable avatar URL
        });
        await newUser.save();

        // create a new user in stream 
        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });
            console.log(`Stream user upserted successfully for ${newUser.fullName}`);

        } catch (error) {
            console.error("Error upserting Stream user:", error);
        }

        // account token
        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        );

        res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        res.status(201).json({ success: true, user: newUser });

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export async function login(req, res) {

   try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


export async function logout(req, res) {
 res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}


export async function onboard(req, res) {
     try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
