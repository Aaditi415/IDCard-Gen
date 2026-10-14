
import "dotenv/config";
import mongoose from "mongoose";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import connectDB from "../config/database.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";

const rl = readline.createInterface({ input, output });

try {
  const name = "Demo School";
  const slug = "demo-school";

  const email = (
    await rl.question("Enter the demo admin email: ")
  ).trim().toLowerCase();

  const password = await rl.question(
    "Enter a password (minimum 12 characters): "
  );

  const adminName = (
    await rl.question("Enter the admin name: ")
  ).trim();

  if (!email || !adminName || password.length < 12) {
    throw new Error(
      "Email and admin name are required; password must be at least 12 characters."
    );
  }

  await connectDB();

  let organization = await Organization.findOne({ slug });

  if (!organization) {
    organization = await Organization.create({
      name,
      slug,
      type: "school",
      email,
      status: "active",
    });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error(
      "That email already exists. Use a different email; no user was changed."
    );
  }

  await User.create({
    name: adminName,
    email,
    password,
    role: "orgadmin",
    organizationId: organization._id,
    status: "active",
  });

  console.log("\nDemo organization and admin created successfully!");
  console.log("Organization:", organization.name);
  console.log("Admin email:", email);
  console.log("Role: orgadmin");
  console.log("Organization ID:", organization._id.toString());
} catch (error) {
  console.error("\nSetup failed:", error.message);
  process.exitCode = 1;
} finally {
  rl.close();
  await mongoose.disconnect().catch(() => {});
}
