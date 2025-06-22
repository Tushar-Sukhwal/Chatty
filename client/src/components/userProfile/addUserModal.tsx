import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { User } from "@/types/types";

const AddUserModal = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const handleAddUser = () => {
    // TODO: add user
    console.log("add user");
  };

  const handleSearch = () => {
    // TODO: search for user
    console.log("search for user");

    
  };

  return (
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
            defaultValue="Pedro Duarte"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="username-1">Search Results</Label>
          {searchResults.map((user) => (
            <div key={user._id}>{user.userName}</div>
          ))}
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddUserModal;
