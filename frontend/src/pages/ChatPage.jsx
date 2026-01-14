import { useParams } from "react-router";
import { useState, useEffect } from "react";
import useAuthUser from "../hooks/useAuthUser.js";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, chatWithAI, wakeAI } from "../lib/api.js";
import ChatLoader from "../components/ChatLoader.jsx";
import CallButton from "../components/CallButton.jsx";
import { useThemeStore } from "../store/useThemeStore.js";
import { THEMES } from "../constants/index.js";
import { MessageSquareText } from "lucide-react";

const AI_AGENT_ID = "64b6e5b8e9b0e2b9c8b7f3a1";
const LANGUAGES = ["English", "German", "French", "Italian", "Portuguese", "Hindi", "Spanish", "Thai"];


import {
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Window,
  Chat,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ThemeSelector from "../components/ThemeSelector.jsx";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;


const ChatPage = () => {

  const { theme } = useThemeStore();

  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const isAI = targetUserId === AI_AGENT_ID;

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, //this will only run if authUser is available
  });

  // 1. Connection Effect: Connects user to Stream Chat (Run once per user/token)
  useEffect(() => {
    if (!tokenData?.token || !authUser) return;

    const client = StreamChat.getInstance(STREAM_API_KEY);
    let isMounted = true;

    const connect = async () => {
      try {
        if (client.userID !== authUser._id) {
          if (client.userID) await client.disconnectUser();
          await client.connectUser({
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          }, tokenData.token);
        }

        if (isMounted) {
          setChatClient(client);
        }
      } catch (error) {
        console.error("Error connecting user:", error);
        toast.error("Failed to connect to chat.");
      }
    };

    connect();

    return () => {
      isMounted = false;
    };
  }, [authUser, tokenData]);

  // 2. Channel Effect: Switches channel when targetUserId changes
  useEffect(() => {
    if (!chatClient || !targetUserId) return;

    const loadChannel = async () => {
      setLoading(true);
      try {
        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = chatClient.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();
        setChannel(currChannel);

        // Cold Start / Welcome Message Check
        if (targetUserId === AI_AGENT_ID && currChannel.state.messages.length === 0) {
          wakeAI(channelId);
        }
      } catch (error) {
        console.error("Error loading channel:", error);
        toast.error("Failed to load chat channel.");
      } finally {
        setLoading(false);
      }
    };

    loadChannel();
  }, [chatClient, targetUserId, authUser]);

  // Listen for messages to AI
  useEffect(() => {
    if (!channel || !isAI) return;

    const handleNewMessage = async (event) => {
      if (event.user && event.user.id === authUser._id) {
        // User sent a message to AI
        try {
          await chatWithAI(channel.id, event.message.text, targetLanguage);
        } catch (err) {
          console.error("Failed to chat with AI", err);
        }
      }
    };

    channel.on('message.new', handleNewMessage);

    return () => {
      channel.off('message.new', handleNewMessage);
    };
  }, [channel, isAI, targetLanguage, authUser]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      })

      toast.success("Video call link sent successfully!");
    }
  }

  if (loading || !chatClient || !channel) return <ChatLoader />;

  const root = document.documentElement;
  const currentTheme = THEMES.find(t => t.name === theme);

  root.style.setProperty('--bgcolor', currentTheme?.colors[2]);

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            {!isAI && <CallButton handleVideoCall={handleVideoCall} />}

            {isAI && (
              <div className="absolute top-3 right-3 z-10 p-1.5 rounded-lg shadow-md border border-base-300 flex items-center gap-2">
                <MessageSquareText className="size-4 opacity-70" />
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="select bg-accent select-sm select-bordered w-full "
                >
                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
            )}

            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>

    </div>
  )
}

export default ChatPage