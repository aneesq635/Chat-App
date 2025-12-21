import { createContext, useContext, useEffect, useState } from "react";
import supabase from "./supabase";

// import { socketURL } from "./socketInstance";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // creating hooks
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();

  

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session initialization error:", error);
          return;
        }

        if (session) {
          setUser(session.user);
          
          setAccessToken(session.access_token);
          setRefreshToken(session.refresh_token);
        }
    //      if (session?.provider_token || session?.provider_refresh_token) {
    //     console.log("Google tokens found, storing in database...");
        
    //     try {
    //       const response = await fetch(`${socketURL}/storeGoogleTokens`, {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify({
    //           user_id: session.user.id,
    //           provider_token: session.provider_token,
    //           provider_refresh_token: session.provider_refresh_token,
    //           expires_at: session.expires_at,
    //           expires_in: session.expires_in
    //         })
    //       });
          
    //       const data = await response.json();
    //       console.log("Tokens stored successfully:", data);
          
    //       if (data.success) {
    //         setGoogleAccessToken(session.provider_token);
    //         setGoogleRefreshToken(session.provider_refresh_token);
    //       }
    //     } catch (err) {
    //       console.error("Error storing Google tokens:", err);
    //     }
    //   }
      } catch (error) {
        console.error("Unexpected error during session initialization:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      setRefreshToken(session?.refresh_token ?? null);
    //   setGoogleAccessToken(session?.provider_token ?? null);
    //   setGoogleRefreshToken(session?.provider_refresh_token ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshAccessToken = async () => {
    if (!refreshToken) return false;

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        console.error("Token refresh error:", error);
        return false;
      }

      if (session) {
        setAccessToken(session.access_token);
        setRefreshToken(session.refresh_token);
        setUser(session.user);
        // setGoogleAccessToken(session.provider_token);
        // setGoogleRefreshToken(session.provider_refresh_token);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Unexpected error during token refresh:", error);
      return false;
    }
  };
//  const refreshGoogleToken = async () => {
//   try {
//     const response = await fetch(`${socketURL}/api1/googleAccessToken`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         user_id: user.id,
//       }),
//     });

//     const data = await response.json();
//     console.log("Google token response:", data);

//     if (response.ok && data.access_token) {
//       setGoogleAccessToken(data.access_token);
//       return data;
//     } else {
//       // Handle refresh token issues
//       if (
//         data.error === "No refresh token found for user" ||
//         data.error === "User has no refresh token stored" ||
//         data.error === "No tokens found for user"
//       ) {
//         console.log("Redirecting to login due to token issues");
        
//         window.location.href = "/login";
//       }
//       return null;
//     }
//   } catch (err) {
//     console.error("Error refreshing Google token:", err)
//   }
// };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    //   setGoogleAccessToken(null);
    //   setGoogleRefreshToken(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accessToken,
        refreshAccessToken,
        // googleAccessToken,
        // googleRefreshToken,
        // refreshGoogleToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 

