
import { Avatar,AvatarImage } from "@radix-ui/react-avatar";
import { useAppStore } from "@/store"
import { HOST, LOGOUT_ROUTE } from "@/utils/constants";
import { TooltipContent, TooltipTrigger,Tooltip } from "@/components/ui/tooltip";
import { FiEdit2 } from "react-icons/fi";
import { IoPowerSharp} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import axios from "axios";

const ProfileInfo = () => {
    const {userInfo,setUserInfo} = useAppStore();
    const navigate =useNavigate();

    const logOut = async () =>{
        try{
            const response = await apiClient.post(LOGOUT_ROUTE,{},{withCredentials:true});
            if(response.status===200){
                navigate("/auth");
                setUserInfo(null);
            }
        } catch(error){
            console.log(error);
        }
    };
  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]">
        <div className="flex gap-3 items-center justify-center ">
            <div className="w-12 h-12 relative">
                <Avatar className="h-12 w-12  rounded-full overflow-hidden">
              {userInfo.image ? (
                <AvatarImage
                  src={`${HOST}/${userInfo.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`uppercase h-12 w-12  text-lg border-[1px] flex items-center justify-center rounded-full 
                    
                    `}
                >
                  {userInfo.firstName
                    ? userInfo.firstName.charAt(0)
                    : userInfo.email.charAt(0)}
                </div>
              )}
            </Avatar>
            </div>
            <div>
                {
                    userInfo.firstName && userInfo.lastName ? `${userInfo.firstName} ${userInfo.lastName}`:""
                }
            </div>
        </div>
        <div className="flex gap-5 ">
            <Tooltip>
  <TooltipTrigger><FiEdit2 className="text-purple-500 text-xl font-medium" onClick={()=>navigate('/profile')}/></TooltipTrigger>
  <TooltipContent>
    Edit Profile
  </TooltipContent>
</Tooltip>
<Tooltip>
  <TooltipTrigger><IoPowerSharp className="text-red-500 text-xl font-medium" onClick={logOut}/></TooltipTrigger>
  <TooltipContent>
    LogOut
  </TooltipContent>
</Tooltip>
        </div>
    </div>
  )
}

export default ProfileInfo