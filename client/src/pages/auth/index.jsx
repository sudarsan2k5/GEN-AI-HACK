import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import Background from "../../assets/login2.png";
import Victory from "../../assets/victory.svg";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {apiClient} from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";


const Auth = () => {
  const navigate =useNavigate();
  const {setUserInfo} =useAppStore();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setconfirmPassword] = useState("")

  const validateLogin = () =>{
    if(!email.length){
      toast.error("Email is Required.");
      return false;
    }
    if(!password.length){
      toast.error("Password is Required.");
      return false;
    }
    return true;
  }

  const validateSignup = () =>{
    if(!email.length){
      toast.error("Email is Required.");
      return false;
    }
    if(!password.length){
      toast.error("Password is Required.");
      return false;
    }
    if(password != confirmPassword){
      toast.error("Password and confirm password is not same.");
      return false;
    }
    return true;
  }

  const handleLogin = async () => {
  if (validateLogin()) {
    try {
      const response = await apiClient.post(
        LOGIN_ROUTE,
        { email, password },
        { withCredentials: true }
      );

      if (response.data?.user?.id) {
        setUserInfo(response.data.user);
        if (response.data.user.profileSetup) {
          navigate("/chat", { replace: true });
        } else {
          navigate("/profile", { replace: true });
        }
      }

      console.log("Login Response:", response.data);
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
    }
  }
};


  const handleSignup=async () =>{
    if(validateSignup()){
      const response= await apiClient.post(SIGNUP_ROUTE,{email,password},{withCredentials:true});
      if(response.status===201){
        setUserInfo(response.data.user);
        navigate("/profile");
      }
      console.log({response});
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center bg-gray-100">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl 
        w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] rounded-3xl flex items-center justify-center">
        
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl text-center">Welcome</h1>
              <img src={Victory} alt="Victory Emoji" className="h-[100px]" />
            </div>
            <p className="font-medium text-center">
              Fill in details to get started with the best chat app!
            </p>
          </div>

          <div className="flex items-center justify-center w-full">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 
                  rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 
                  p-3 transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 
                  rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 
                  p-3 transition-all duration-300"
                >
                  SignUp
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="flex flex-col gap-5 mt-10">
                <input placeholder="Email" type="email" className="rounded-full p-6" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                <input placeholder="Password" type="password" className="rounded-full p-6" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                <Button className="rounded-full p-6" onClick={handleLogin}>Login</Button>
              </TabsContent>
              <TabsContent value="signup" className="flex flex-col gap-5 mt-10">
                <input placeholder="Email" type="email" className="rounded-full p-6" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                <input placeholder="Password" type="password" className="rounded-full p-6" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                <input placeholder="Confirm Password" type="password" className="rounded-full p-6" value={confirmPassword} onChange={(e)=>setconfirmPassword(e.target.value)}/>
                <Button className="rounded-full p-6" onClick={handleSignup}>SignUp</Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center">
          <img src={Background} alt= "background login" className="h-[500px]"/>
        </div>
      </div>
    </div>
  );
};

export default Auth;
