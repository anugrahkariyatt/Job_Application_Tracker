"use client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/authSlice";
import {
  getCurrentUser,
  login,
  logout,
  refresh,
  register,
} from "@/features/auth/api/auth.api";
import { AxiosError } from "axios";
export default function TestPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const handleLogin = async () => {
    try {
      const response = await login({
        email: "abhi@gmail.com",
        password: "12345678",
      });

      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };
  const handleReg = async () => {
    try {
      const response = await register({
        name: "admin ",
        email: "abdd@gmail.com",
        password: "12345678",
        role: "recruiter",
      });

      console.log(response);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data);
      } else {
        console.error(error);
      }
    }
  };
  const handleRefresh = async () => {
    try {
      await refresh();

      console.log("Token refreshed successfully");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data);
      } else {
        console.error(error);
      }
    }
  };
  const getCurrentUserProfile = async () => {
    try {
      const response = await getCurrentUser();

      console.log(response);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data);
      } else {
        console.error(error);
      }
    }
  };
  const logoutfun = async () => {
    try {
      const response = await logout();
      dispatch(clearUser());

      console.log(response);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data);
      } else {
        console.error(error);
      }
    }
  };
  const test = async () => {
    try {
      const response = await getCurrentUser();

      dispatch(setUser(response.user));
    } catch (error) {
      dispatch(clearUser());
    }
  };
  const clear = () => {
    dispatch(clearUser());
    console.log(user);
  };
  return (
    <>
      {" "}
      <button onClick={handleLogin}>Test Login</button>;
      <button onClick={handleReg}>Test Register</button>;
      <button onClick={handleRefresh}>Test Refresh</button>;
      <button onClick={getCurrentUserProfile}>Test CurrentUser</button>;
      <button onClick={logoutfun}>Test Logout</button>;
      <button onClick={test}>Test Redux</button>
      <button onClick={clear}>Clear Redux</button>
    </>
  );
}
