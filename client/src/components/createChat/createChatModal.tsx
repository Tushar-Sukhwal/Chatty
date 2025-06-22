import { useState } from "react";
import { useUiStore } from "@/store/uiStore";
import { useUserStore } from "@/store/userStore";
import { UserApi } from "@/api/userApi";
import { ChatApi } from "@/api/chatApi";
import { SharedDialog } from "@/components/ui/shared-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Search, UserPlus } from "lucide-react";
import { User } from "@/types/types";

export default function CreateChatModal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { isCreateChatModalOpen, setIsCreateChatModalOpen } = useUiStore();
  const { user } = useUserStore();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const users = await UserApi.searchUsersWithNameOrEmail(searchQuery);
      setSearchResults(users);
    } catch (error) {
      console.error("Failed to search users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateChat = async (userId: string) => {
    try {
      await ChatApi.createChat(userId);
      setIsCreateChatModalOpen(false);
      setSearchResults([]);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  return (
    <SharedDialog
      isOpen={isCreateChatModalOpen}
      onClose={() => {
        setIsCreateChatModalOpen(false);
        setSearchResults([]);
        setSearchQuery("");
      }}
      title="Start a New Chat"
    >
      <div className="flex flex-col gap-4 py-4">
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Search Results</h3>
            <div className="space-y-2">
              {searchResults.map((result) => (
                <div
                  key={result._id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <img src={result.avatar} alt={result.userName} />
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{result.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCreateChat(result._id)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SharedDialog>
  );
}
