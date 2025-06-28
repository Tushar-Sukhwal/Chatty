"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Camera,
  Save,
  Upload,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserApi } from "@/api/userApi";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";

const ProfilePage = () => {
  const { user, setUser } = useUserStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: "",
  });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    userName: user?.userName || "",
    email: user?.email || "",
  });

  const debouncedUsername = useDebounce(formData.userName, 500);

  // Check username availability when debounced username changes
  useEffect(() => {
    if (
      isEditing &&
      debouncedUsername &&
      debouncedUsername !== user?.userName &&
      debouncedUsername.length >= 3
    ) {
      checkUsernameAvailability(debouncedUsername);
    } else if (debouncedUsername === user?.userName) {
      setUsernameStatus({
        checking: false,
        available: true,
        message: "This is your current username",
      });
    } else if (debouncedUsername.length < 3 && debouncedUsername.length > 0) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: "Username must be at least 3 characters",
      });
    } else {
      setUsernameStatus({
        checking: false,
        available: null,
        message: "",
      });
    }
  }, [debouncedUsername, isEditing, user?.userName]);

  const checkUsernameAvailability = async (username: string) => {
    setUsernameStatus((prev) => ({ ...prev, checking: true }));
    try {
      const result = await UserApi.checkUsernameAvailability(username);
      setUsernameStatus({
        checking: false,
        available: result.available,
        message: result.message,
      });
    } catch (error) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: "Error checking username availability",
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.userName.trim()) {
      toast.error("Name and username are required");
      return;
    }

    if (formData.userName.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (usernameStatus.available === false) {
      toast.error("Please choose an available username");
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await UserApi.updateProfile({
        name: formData.name,
        userName: formData.userName,
      });
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const avatarUrl = await UserApi.uploadAvatar(file);
      if (user) {
        const updatedUser = { ...user, avatar: avatarUrl };
        setUser(updatedUser);
        toast.success("Avatar updated successfully");
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    } finally {
      setIsUploadingAvatar(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getUsernameStatusIcon = () => {
    if (usernameStatus.checking) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (usernameStatus.available === true) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (usernameStatus.available === false) {
      return <X className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getUsernameStatusColor = () => {
    if (usernameStatus.available === true)
      return "text-green-600 dark:text-green-400";
    if (usernameStatus.available === false)
      return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 dark:text-muted-foreground dark:hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">
              Profile
            </h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Profile Card */}
        <Card className="mb-6 shadow-sm dark:border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">
                  {user.name}
                </h2>
                <p className="text-gray-500 dark:text-muted-foreground">
                  @{user.userName}
                </p>
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={isEditing ? formData.name : user.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50 dark:bg-muted" : ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="userName">Username</Label>
                <div className="relative">
                  <Input
                    id="userName"
                    value={isEditing ? formData.userName : user.userName}
                    onChange={(e) =>
                      handleInputChange("userName", e.target.value)
                    }
                    disabled={!isEditing}
                    className={`${
                      !isEditing ? "bg-gray-50 dark:bg-muted" : ""
                    } ${isEditing ? "pr-10" : ""}`}
                  />
                  {isEditing && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getUsernameStatusIcon()}
                    </div>
                  )}
                </div>
                {isEditing && usernameStatus.message && (
                  <p className={`text-sm ${getUsernameStatusColor()}`}>
                    {usernameStatus.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled={true}
                  className="bg-gray-50 dark:bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="flex items-center gap-2"
                    disabled={isSaving || usernameStatus.available === false}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name || "",
                        userName: user.userName || "",
                        email: user.email || "",
                      });
                      setUsernameStatus({
                        checking: false,
                        available: null,
                        message: "",
                      });
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="shadow-sm dark:border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-800/20">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {user.chats?.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-muted-foreground">
                  Chats
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-800/20">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {user.friends?.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-muted-foreground">
                  Friends
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
