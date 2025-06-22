"use client";

import React, { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const ProfilePage = () => {
  const { user } = useUserStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    userName: user?.userName || "",
    email: user?.email || "",
  });

  const handleSave = () => {
    // TODO: Implement profile update API call
    console.log("Saving profile:", formData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={() => {
                    // TODO: Implement avatar upload
                    console.log("Upload avatar");
                  }}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-gray-500">@{user.userName}</p>
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
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="userName">Username</Label>
                <Input
                  id="userName"
                  value={isEditing ? formData.userName : user.userName}
                  onChange={(e) =>
                    handleInputChange("userName", e.target.value)
                  }
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={isEditing ? formData.email : user.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
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
                    }}
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
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {user.chats?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Chats</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {user.friends?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Friends</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
