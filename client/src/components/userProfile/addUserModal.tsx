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
import { useState, useEffect, useRef } from "react";
import { User } from "@/types/types";
import { UserApi } from "@/api/userApi";
import UserCard from "./userCard";

const AddUserModal = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const prevQuery = useRef<string>("");

  useEffect(() => {
    // Only search if query changed and is not empty
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      prevQuery.current = "";
      return;
    }

    // Clear previous timeout if exists
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      // Only search if query actually changed
      if (searchQuery.trim() !== prevQuery.current) {
        try {
          const response = await UserApi.searchUsersWithNameOrEmail(
            searchQuery
          );
          setSearchResults(response);
          console.log(response);
          prevQuery.current = searchQuery.trim();
        } catch (err) {
          setSearchResults([]);
        }
      }
    }, 500);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchQuery]);



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
        <Button >Save changes</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddUserModal;
