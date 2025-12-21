'use client'
import Image from "next/image";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import supabase from "./components/supabase";
import { useRouter } from "next/navigation";

import { useAuth } from "./components/AuthContext";
export default function Home() {
  const router = useRouter();
 const {user} = useAuth()
  console.log("Session on Home Page:", user);
  if(user) {
    router.push('/MainApp');
    return null;
  }

  return (
     <div className="min-h-screen flex flex-col  overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-br from-indigo-50/50 via-white to-transparent -z-10 pointer-events-none" />
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl -z-10" />
      
  
      
      <main className="flex-grow">
        <HeroSection />
      </main>

      <Footer />
    </div>
  );
}
