"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, User, Code, Bell, Shield } from "lucide-react"

export default function SettingsPage() {
  const { user, userProfile, signOut } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    avatar: userProfile?.avatar || "",
  })

  const [preferences, setPreferences] = useState({
    defaultLanguage: "javascript",
    fontSize: 14,
    theme: "dark",
    autoSave: true,
    soundEffects: true,
  })

  const [notifications, setNotifications] = useState({
    contestStart: true,
    submissionResults: true,
    newMessages: true,
    leaderboardUpdates: false,
  })

  const handleSaveProfile = async () => {
    try {
      // Save profile changes
      console.log("Saving profile:", profile)
      // await apiService.updateProfile(profile)
    } catch (error) {
      console.error("Failed to save profile:", error)
    }
  }

  const handleSavePreferences = () => {
    localStorage.setItem("codeclash_preferences", JSON.stringify(preferences))
    console.log("Preferences saved")
  }

  const handleSaveNotifications = () => {
    localStorage.setItem("codeclash_notifications", JSON.stringify(notifications))
    console.log("Notification settings saved")
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
            </div>
            <div className="flex items-center space-x-2">
              <img
                src={userProfile?.avatar || "/placeholder.svg"}
                alt={userProfile?.name || "User"}
                className="h-8 w-8 rounded-full"
              />
              <span className="text-white">{userProfile?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
              <TabsTrigger value="profile" className="text-white data-[state=active]:bg-slate-700">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="editor" className="text-white data-[state=active]:bg-slate-700">
                <Code className="h-4 w-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-slate-700">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="text-white data-[state=active]:bg-slate-700">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                  <CardDescription className="text-slate-400">
                    Update your personal information and profile settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <img
                      src={profile.avatar || "/placeholder.svg"}
                      alt="Profile"
                      className="h-20 w-20 rounded-full border-2 border-slate-600"
                    />
                    <div>
                      <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                        Change Avatar
                      </Button>
                      <p className="text-sm text-slate-400 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">
                        Display Name
                      </Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-slate-700 border-slate-600 text-slate-400"
                      />
                      <p className="text-xs text-slate-500">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} className="bg-purple-600 hover:bg-purple-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="editor">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Editor Preferences</CardTitle>
                  <CardDescription className="text-slate-400">
                    Customize your coding environment and editor settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white">Default Language</Label>
                      <Select
                        value={preferences.defaultLanguage}
                        onValueChange={(value) => setPreferences({ ...preferences, defaultLanguage: value })}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="javascript" className="text-white">
                            JavaScript
                          </SelectItem>
                          <SelectItem value="python" className="text-white">
                            Python
                          </SelectItem>
                          <SelectItem value="java" className="text-white">
                            Java
                          </SelectItem>
                          <SelectItem value="cpp" className="text-white">
                            C++
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Font Size</Label>
                      <Select
                        value={preferences.fontSize.toString()}
                        onValueChange={(value) => setPreferences({ ...preferences, fontSize: Number(value) })}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {[12, 14, 16, 18, 20].map((size) => (
                            <SelectItem key={size} value={size.toString()} className="text-white">
                              {size}px
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Auto-save Code</Label>
                        <p className="text-sm text-slate-400">Automatically save your code as you type</p>
                      </div>
                      <Switch
                        checked={preferences.autoSave}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, autoSave: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Sound Effects</Label>
                        <p className="text-sm text-slate-400">Play sounds for submissions and notifications</p>
                      </div>
                      <Switch
                        checked={preferences.soundEffects}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, soundEffects: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSavePreferences} className="bg-purple-600 hover:bg-purple-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Notification Settings</CardTitle>
                  <CardDescription className="text-slate-400">
                    Choose what notifications you want to receive during contests.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Contest Start</Label>
                        <p className="text-sm text-slate-400">Get notified when contests begin</p>
                      </div>
                      <Switch
                        checked={notifications.contestStart}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, contestStart: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Submission Results</Label>
                        <p className="text-sm text-slate-400">Get notified about your submission results</p>
                      </div>
                      <Switch
                        checked={notifications.submissionResults}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, submissionResults: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">New Messages</Label>
                        <p className="text-sm text-slate-400">Get notified about new chat messages</p>
                      </div>
                      <Switch
                        checked={notifications.newMessages}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, newMessages: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Leaderboard Updates</Label>
                        <p className="text-sm text-slate-400">Get notified about ranking changes</p>
                      </div>
                      <Switch
                        checked={notifications.leaderboardUpdates}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, leaderboardUpdates: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications} className="bg-purple-600 hover:bg-purple-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <CardDescription className="text-slate-400">
                    Manage your account security and privacy settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Account Status</h4>
                      <p className="text-sm text-slate-300 mb-3">Your account is secured with Google authentication.</p>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-green-400">Verified</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-700 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Data Privacy</h4>
                      <p className="text-sm text-slate-300 mb-3">
                        Your code submissions and contest data are stored securely.
                      </p>
                      <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-600">
                        Download My Data
                      </Button>
                    </div>

                    <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Danger Zone</h4>
                      <p className="text-sm text-slate-300 mb-3">
                        Permanently delete your account and all associated data.
                      </p>
                      <Button variant="destructive" onClick={signOut}>
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
