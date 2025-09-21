import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import { apiClient } from "@/lib/api-client";
import { CREATE_VOICE_CHANNEL_ROUTE, GET_USER_VOICE_CHANNELS_ROUTE } from "@/utils/constants";
import { FaPlus } from "react-icons/fa";
import { Volume2 } from "lucide-react";
import MultipleSelector from "@/components/ui/multiselector";
import { toast } from "sonner";

const CreateVoiceChannel = () => {
  const { addVoiceChannel, setVoiceChannels } = useAppStore();
  const [newVoiceChannelModal, setNewVoiceChannelModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [voiceChannelName, setVoiceChannelName] = useState("");
  const [maxUsers, setMaxUsers] = useState(99);
  const [bitrate, setBitrate] = useState(64000);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await apiClient.get("/api/contacts/get-all-contacts", {
          withCredentials: true,
        });
        setAllContacts(response.data.contacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    getData();
  }, []);

  const createVoiceChannel = async () => {
    try {
      if (voiceChannelName.length > 0) {
        const response = await apiClient.post(
          CREATE_VOICE_CHANNEL_ROUTE,
          {
            name: voiceChannelName,
            members: selectedContacts.map((contact) => contact.value),
            maxUsers,
            bitrate,
            isPublic,
          },
          { withCredentials: true }
        );
        
        if (response.status === 201) {
          addVoiceChannel(response.data.voiceChannel);
          setNewVoiceChannelModal(false);
          setVoiceChannelName("");
          setSelectedContacts([]);
          setMaxUsers(99);
          setBitrate(64000);
          setIsPublic(true);
          toast.success("Voice channel created successfully!");
          
          // Refresh voice channels list
          const voiceChannelsResponse = await apiClient.get(GET_USER_VOICE_CHANNELS_ROUTE, {
            withCredentials: true,
          });
          if (voiceChannelsResponse.data.voiceChannels) {
            setVoiceChannels(voiceChannelsResponse.data.voiceChannels);
          }
        }
      }
    } catch (error) {
      console.error("Error creating voice channel:", error);
      toast.error("Failed to create voice channel");
    }
  };

  return (
    <>
      <Dialog open={newVoiceChannelModal} onOpenChange={setNewVoiceChannelModal}>
        <DialogTrigger>
          <FaPlus className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300" />
        </DialogTrigger>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Volume2 className="text-[#8338ec]" size={24} />
              Create Voice Channel
            </DialogTitle>
            <DialogDescription>
              Create a new voice channel for real-time conversations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-5 flex-1">
            <Input
              placeholder="Voice Channel Name"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              onChange={(e) => setVoiceChannelName(e.target.value)}
              value={voiceChannelName}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Max Users</label>
                <select
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(Number(e.target.value))}
                  className="w-full p-3 bg-[#2c2e3b] border-none rounded-lg text-white"
                >
                  <option value={2}>2 Users</option>
                  <option value={5}>5 Users</option>
                  <option value={10}>10 Users</option>
                  <option value={25}>25 Users</option>
                  <option value={50}>50 Users</option>
                  <option value={99}>99 Users</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Audio Quality</label>
                <select
                  value={bitrate}
                  onChange={(e) => setBitrate(Number(e.target.value))}
                  className="w-full p-3 bg-[#2c2e3b] border-none rounded-lg text-white"
                >
                  <option value={64000}>64 kbps</option>
                  <option value={96000}>96 kbps</option>
                  <option value={128000}>128 kbps</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Channel Type</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded bg-[#2c2e3b] border-gray-600"
                  />
                  <label htmlFor="isPublic" className="text-sm text-white">
                    Public (visible to everyone)
                  </label>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">
                  Add Members {isPublic ? "(Optional)" : "(Required for private channels)"}
                </label>
                <MultipleSelector
                  className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
                  defaultOptions={allContacts}
                  placeholder="Select contacts"
                  value={selectedContacts}
                  onChange={setSelectedContacts}
                  emptyIndicator={
                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                      No contacts found.
                    </p>
                  }
                />
              </div>
            </div>
            
            <div className="mt-auto">
              <Button
                className="w-full bg-[#8338ec] hover:bg-[#7530d6] text-white"
                onClick={createVoiceChannel}
                disabled={!voiceChannelName.trim()}
              >
                Create Voice Channel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateVoiceChannel;
