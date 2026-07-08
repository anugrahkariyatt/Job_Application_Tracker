import bcrpyt from "bcrypt";

export const comparePassword = async (
  password: string,
  hashPassword: string,
) => {
  return await bcrpyt.compare(password, hashPassword);
};
