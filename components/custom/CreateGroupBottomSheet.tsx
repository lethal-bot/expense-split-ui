import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MemberEmailInput } from "./MemberEmailInput";

interface CreateGroupBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, description: string, userIds: string[]) => void;
  isLoading?: boolean;
}

export function CreateGroupBottomSheet({
  isOpen,
  onClose,
  onCreateGroup,
  isLoading = false
}: CreateGroupBottomSheetProps) {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [members, setMembers] = useState<Array<{ email: string; userId: string | null }>>([{ email: "", userId: null }]);

  // Reset inputs when sheet closes or opens
  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setGroupDescription("");
      setMembers([{ email: "", userId: null }]);
    }
  }, [isOpen]);

  const handleEmailChange = (index: number, val: string) => {
    setMembers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], email: val, userId: null };
      return copy;
    });
  };

  const handleUserFound = (index: number, userId: string | null) => {
    setMembers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], userId };
      return copy;
    });
  };

  const handleAddEmailField = () => {
    setMembers((prev) => [...prev, { email: "", userId: null }]);
  };

  const handleRemoveEmailField = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    // Filter out unregistered members and map to userIds
    const validUserIds = members
      .filter((m) => m.email.trim() !== "" && m.userId !== null)
      .map((m) => m.userId as string);
    onCreateGroup(groupName, groupDescription, validUserIds);
  };

  return (
    <>
      {/* Bottom Sheet Modal Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 pointer-events-none opacity-0",
          isOpen && "pointer-events-auto opacity-100"
        )}
        onClick={onClose}
      />

      {/* Slide-up Bottom Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 max-h-[85vh] bg-card rounded-t-2xl border-t border-border shadow-2xl p-6 z-[110] transform transition-transform duration-300 ease-out overflow-y-auto pb-12",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Drag handle decoration */}
        <div className="mx-auto w-12 h-1.5 rounded-full bg-muted mb-4 cursor-pointer" onClick={onClose} />

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Create a new group</h2>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="groupName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Group Name *
            </label>
            <Input
              id="groupName"
              placeholder="e.g. Goa Trip, Flatmates"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="rounded-xl border-border bg-muted/30 focus-visible:ring-primary h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="groupDesc" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description / Notes
            </label>
            <Input
              id="groupDesc"
              placeholder="e.g. Rent splitting, travel bills"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="rounded-xl border-border bg-muted/30 focus-visible:ring-primary h-11"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Group Members (Emails)
              </label>
              <button
                type="button"
                onClick={handleAddEmailField}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Friend
              </button>
            </div>

            <div className="space-y-3">
              {/* Always include 'You' read-only indicator */}
              <div className="flex items-center gap-2">
                <Input
                  disabled
                  value="You (Group Creator)"
                  className="rounded-xl border-border bg-muted/50 text-muted-foreground cursor-not-allowed h-11"
                />
              </div>

              {members.map((member, idx) => (
                <MemberEmailInput
                  key={idx}
                  value={member.email}
                  onChange={(val) => handleEmailChange(idx, val)}
                  onRemove={() => handleRemoveEmailField(idx)}
                  showRemove={members.length > 1}
                  onUserFound={(userId) => handleUserFound(idx, userId)}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={isLoading} className="w-full rounded-xl py-6 font-semibold shadow-md">
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
