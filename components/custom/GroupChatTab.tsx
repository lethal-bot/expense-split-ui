import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Message } from "@/utils/Types";

interface GroupChatTabProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export function GroupChatTab({ messages, onSendMessage }: GroupChatTabProps) {
  const [typedMessage, setTypedMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat window when new message arrives or component mounts
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    onSendMessage(typedMessage);
    setTypedMessage("");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 border rounded-2xl bg-card/50 overflow-hidden shadow-inner h-[55vh]">
      {/* Scrollable messages area */}
      <div className="flex-grow p-4 overflow-y-auto space-y-3.5 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-xs text-muted-foreground">
              No chat history. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === "You";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[75%] gap-0.5",
                  isMe ? "self-end items-end" : "self-start items-start"
                )}
              >
                {!isMe && (
                  <span className="text-[10px] font-bold text-muted-foreground px-1">
                    {msg.sender}
                  </span>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-muted-foreground/60 px-1 mt-0.5">
                  {msg.timestamp}
                </span>
              </div>
            );
          })
        )}
        {/* Scroll Anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t bg-card flex gap-2 items-center">
        <Input
          value={typedMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
          placeholder="Type a message..."
          className="rounded-xl border-border bg-muted/30 focus-visible:ring-primary flex-grow text-sm py-5"
        />
        <Button type="submit" size="icon" className="rounded-xl h-10 w-10 shrink-0 shadow-md">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
