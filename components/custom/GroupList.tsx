import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { currency } from "@/utils/Constants";
import { Group } from "@/utils/Types";

interface GroupListProps {
  groups: Group[];
  onGroupClick: (group: Group) => void;
}

export function GroupList({ groups, onGroupClick }: GroupListProps) {
  // Get a colored gradient class based on name hash for beautiful mobile group icons
  const getAvatarGradient = (name: string) => {
    const gradients = [
      "from-rose-500 to-orange-500 text-white",
      "from-emerald-500 to-teal-500 text-white",
      "from-blue-500 to-indigo-500 text-white",
      "from-purple-500 to-pink-500 text-white",
      "from-amber-500 to-yellow-500 text-white"
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return gradients[sum % gradients.length];
  };

  if (groups.length === 0) {
    return (
      <Card className="border-dashed bg-card/50">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <Users className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-muted-foreground">No groups yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Tap the plus button below to create one!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const displayMembers = group.members.join(", ");

        return (
          <div
            key={group.id}
            onClick={() => onGroupClick(group)}
            className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm hover:bg-muted/40 transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-base font-bold shadow-inner",
                  getAvatarGradient(group.name)
                )}
              >
                {group.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">{group.name}</h3>
                <p className="truncate text-xs text-muted-foreground mt-0.5">
                  {group.description || "No description"}
                </p>
                <p className="truncate text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-1">
                  <Users className="h-3 w-3 inline" /> {displayMembers}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              {group.balance > 0 ? (
                <div>
                  <p className="text-[10px] font-medium text-emerald-500/80">you are owed</p>
                  <p className="text-sm font-bold text-emerald-500">{currency.format(group.balance)}</p>
                </div>
              ) : group.balance < 0 ? (
                <div>
                  <p className="text-[10px] font-medium text-orange-500/80">you owe</p>
                  <p className="text-sm font-bold text-orange-500">
                    {currency.format(Math.abs(group.balance))}
                  </p>
                </div>
              ) : (
                <p className="text-xs font-semibold text-muted-foreground">settled up</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
