import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { hashPassword } from "../utils/hashPassword.js";
import { RegisterInput } from "../validations/auth.validation.js";

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await User.findOne({
    email: data.email,
  });
  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }
  const hashedPassword = await hashPassword(data.password);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role,
  });

  return {
    id: user._id,
    fullName: user.name,
    email: user.email,
    role: user.role,
  };
};
