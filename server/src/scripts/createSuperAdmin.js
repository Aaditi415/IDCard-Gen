import "dotenv/config";
import mongoose from "mongoose";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

import connectDB from "../config/database.js";
import User from "../models/User.js";

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

async function createSuperAdmin() {
  try {
    const name = (await rl.question("Super Admin name: ")).trim();
    const email = (await rl.question("Super Admin email: "))
      .trim()
      .toLowerCase();
    const password = await rl.question("Super Admin password: ");

    if (!name || !email || password.length < 12) {
      throw new Error(
        "Name and email are required. Password must be at least 12 characters."
      );
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from server/.env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from server/.env");
    }

    await connectDB();

    const existingAdmin = await User.findOne({
      role: "superadmin",
    }).select("_id");

    if (existingAdmin) {
      throw new Error(
        "A Super Admin already exists. No new account was created."
      );
    }

    const existingEmail = await User.findOne({ email }).select("_id");

    if (existingEmail) {
      throw new Error(
        "This email is already registered. Please use another email."
      );
    }

    await User.create({
      name,
      email,
      password,
      role: "superadmin",
      organizationId: null,
      status: "active",
    });

    console.log("\nSuper Admin created successfully!");
    console.log(`Email: ${email}`);
    console.log("You can now test the login endpoint.");
  } catch (error) {
    console.error("\nCould not create Super Admin:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

createSuperAdmin();
