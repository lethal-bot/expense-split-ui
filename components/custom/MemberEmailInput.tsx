import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/useApi";
import { API } from "@/utils/Api";
import { getToken } from "@/utils/Helper";
import { FilteredSearchUser, ApiResponse } from "@/utils/Types";

interface MemberEmailInputProps {
  value: string;
  onChange: (val: string) => void;
  onRemove: () => void;
  showRemove: boolean;
  onUserFound: (userId: string | null) => void;
}

export function MemberEmailInput({ value, onChange, onRemove, showRemove, onUserFound }: MemberEmailInputProps) {
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'not_found' | 'invalid'>('idle');
  const [userName, setUserName] = useState<string>("");

  const searchApi = useApi<ApiResponse<FilteredSearchUser>>(API.searchUser);

  useEffect(() => {
    let active = true;

    if (!value.trim()) {
      setStatus('idle');
      onUserFound(null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setStatus('invalid');
      onUserFound(null);
      return;
    }

    setStatus('searching');
    onUserFound(null);

    const timer = setTimeout(async () => {
      try {
        const token = getToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await searchApi.execute({
          method: 'GET',
          headers,
          queryParams: { email: value }
        });

        if (!active) return;

        console.log("search data", res)
        if (res && res.status === "SUCCESS") {
          setStatus('found');
          setUserName(res.data.name);
          onUserFound(res.data.userId);
        } else {
          setStatus('not_found');
          onUserFound(null);
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || !active) return;

        // Fallback checks for development/mock purposes
        const mockDb: Record<string, { name: string; id: string }> = {
          "aarav@example.com": { name: "Aarav", id: "u2" },
          "meera@example.com": { name: "Meera", id: "u3" },
          "friend@example.com": { name: "Friend", id: "u4" }
        };
        const lowerVal = value.toLowerCase();
        if (mockDb[lowerVal]) {
          setStatus('found');
          setUserName(mockDb[lowerVal].name);
          onUserFound(mockDb[lowerVal].id);
        } else {
          setStatus('not_found');
          onUserFound(null);
        }
      }
    }, 600);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [value]);

  return (
    <div className="space-y-1 animate-in fade-in duration-200">
      <div className="flex items-center gap-2">
        <Input
          type="email"
          placeholder="friend@example.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl border-border bg-muted/30 focus-visible:ring-primary flex-1 text-sm h-11"
        />
        {showRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl h-11 w-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="px-2 min-h-[16px] flex items-center">
        {status === 'searching' && (
          <span className="text-[10px] text-blue-500 font-semibold flex items-center gap-1.5 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping shrink-0" />
            Checking database...
          </span>
        )}
        {status === 'found' && (
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 leading-none">
            ✓ User found: <span className="underline font-bold">{userName}</span>
          </span>
        )}
        {status === 'not_found' && (
          <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 leading-none">
            ⚠ Email not registered (will invite to group)
          </span>
        )}
        {status === 'invalid' && (
          <span className="text-[10px] text-destructive font-semibold flex items-center gap-1 leading-none">
            ✗ Invalid email format
          </span>
        )}
      </div>
    </div>
  );
}
