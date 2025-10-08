"use client"
import { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";

interface ChatLayoutProps {
    defaultLayout: number[] | undefined;
}

const ChatLayout = ({ defaultLayout = [30, 70] }: ChatLayoutProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenWidth = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        if (typeof window !== "undefined") {
            checkScreenWidth();
            window.addEventListener("resize", checkScreenWidth);
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("resize", checkScreenWidth);
            }
        };
    }, []);

    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="h-full min-h-[85vh] w-full rounded-lg border"
            onLayout={(sizes: number[]) => {
                document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}; path=/`;
            }}
        >
            {/* Sidebar Panel */}
            <ResizablePanel
                defaultSize={defaultLayout[0]}
                collapsedSize={4}
                collapsible={true}
                minSize={15}
                maxSize={40}
                className={`
                    min-w-[250px] bg-background border-r
                    ${isCollapsed ? "min-w-[50px] transition-all duration-300" : ""}
                `}
                onCollapse={() => setIsCollapsed(true)}
                onExpand={() => setIsCollapsed(false)}
            >
                <div className="p-4 h-full">
                    <h2 className="font-semibold mb-4">Chats</h2>
                    {/* Sidebar content */}
                    <div className="space-y-2">
                        <div className="p-2 rounded hover:bg-accent cursor-pointer">Chat 1</div>
                        <div className="p-2 rounded hover:bg-accent cursor-pointer">Chat 2</div>
                        <div className="p-2 rounded hover:bg-accent cursor-pointer">Chat 3</div>
                    </div>
                </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-border w-1" />

            {/* Main Chat Panel */}
            <ResizablePanel defaultSize={defaultLayout[1]}>
                <div className="h-full flex flex-col">
                    {/* Chat Header */}
                    <div className="border-b p-4 bg-background">
                        <h2 className="font-semibold">Chat Title</h2>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-auto">
                        <div className="space-y-4">
                            <div className="flex justify-start">
                                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                                    Hello wassup!
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                                    Doing good
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t p-4 bg-background">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Type your message..."
                                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default ChatLayout;

