import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { User } from "@/types/types";
import { useState } from "react";
import UserCard from "../userProfile/userCard";
import { Button } from "../ui/button";
import { UserApi } from "@/api/userApi";

type Props = {};

const CreateChatModal = (props: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleSearch = async () => {
    const results = await UserApi.searchUsersWithNameOrEmail(searchQuery);
    setSearchResults(results);
    console.log(results);
  };

  return (
    <Dialog>
      <DialogTrigger>add group</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Search for a user to add to your friends list.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name-1">Search</Label>
            <Input
              id="name-1"
              name="name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="username-1">Search Results</Label>
            {searchResults.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatModal;
