"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import liff from "@line/liff";

const LiffContext = createContext({
  liffProfile: null,
  isLoggedIn: false,
  isLoading: true,
  lineAccessToken: "",
  // expose the raw liff (may be null in dev or before init)
  liff: null,
  // safe wrappers so your app won’t crash outside LIFF
  actions: {
    closeWindow: () => {},
    openWindow: (_url, _external) => {},
    text: () => {},
    // local login for non-LINE environments
    login: async (_username, _password) => {},
    logout: () => {},
  },
});

const liffenvId = process.env.NEXT_PUBLIC_LIFF_ID;
const server = process.env.NEXT_PUBLIC_SERVER_OPTION; // "dev" | "prod" etc.

export function LiffProvider({ children }) {
  const [liffProfile, setLiffProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lineAccessToken, setLineAccessToken] = useState("");
  const [liffReady, setLiffReady] = useState(false);
  const inClient = () => liff.isInClient();

  useEffect(() => {
    const longProfile = {
      userId: "U006fb519ba07650932c6981af95d0620",
      displayName: "Long👁️‍🗨️",
      pictureUrl:
        "https://profile.line-scdn.net/0hPsTql5LvD1x5CB7EtsVxYglYDDZaeVZOVjxHahgOUGhMPU9ZVDxIORwJAj5BOhxZAWxBakoIV21bTUB3DWgHYz9BU24mUxsKPhhEezdwJwJNQTdDFRZGXRB2BRAsbhxKUDFHXDVTUDIMbD5jU2oBcTpMFWpFQCxrN19jCnw6Yd8WCngJVG9GOE4BU2_M",
      email: "long@example.com",
    };

    const testProfile = {
      userId: "U669f6092308023f227aa435c803b2e74",
      displayName: "Zzz59🧚🏻♀️🌈",
      pictureUrl: "https://lh3.googleusercontent.com/d/1eXgDln7TvPQGiMpzaUdo7l2hKmsh8Kvc",
    };

    const lineAccessTokenDev = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
    const init = async () => {
      if (server === "dev") {
        // Dev mode: mock login/profile, mark as ready
        setIsLoggedIn(true);
        setLiffProfile(longProfile); // or longProfile
        setLineAccessToken(lineAccessTokenDev);
        setLiffReady(true); // no real LIFF in dev
        setIsLoading(false);
        return;
      }

      try {
        await liff.init({ liffId: liffenvId });
        setLiffReady(true);

        // If running inside the LINE client, use LIFF login flow.
        // If not in client, do NOT call liff.login(); provide local login instead.
        if (inClient()) {
          if (liff.isLoggedIn()) {
            setIsLoggedIn(true);
            const profile = await liff.getProfile();
            setLiffProfile(profile);
            const accessToken = liff.getAccessToken();
            console.log("Access token liff provider: ", accessToken);
            setLineAccessToken(accessToken || "");
            setIsLoading(false);
          } else {
            // inside LINE client but not logged in: trigger LIFF login
            liff.login();
          }
        } else {
          // Not inside LINE client: try a persisted local profile first
          const saved = globalThis.localStorage?.getItem("local_liff_profile");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setLiffProfile(parsed);
              setIsLoggedIn(true);
            } catch (e) {
              console.warn("[LIFF] failed to parse local profile", e);
              globalThis.localStorage?.removeItem("local_liff_profile");
            }
          }
          // Allow app to render and let callers use actions.login for username/password
          setIsLoading(false);
        }
      } catch (e) {
        console.error("[LIFF init error]", e);
        // Allow non-LIFF usage if init fails
        const saved = globalThis.localStorage?.getItem("local_liff_profile");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setLiffProfile(parsed);
            setIsLoggedIn(true);
          } catch (err) {
            globalThis.localStorage?.removeItem("local_liff_profile");
          }
        }
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Safe wrappers so components can call without worrying about environment
  const actions = {
    closeWindow: () => {
      try {
        if (server === "dev") {
          console.warn("[LIFF] closeWindow noop in dev");
          // As a dev fallback, just navigate away or no-op.
          return;
        }
        if (inClient()) {
          liff.closeWindow();
        } else {
          // Fallback when opened in external browser
          window.close();
        }
      } catch (e) {
        console.error("[LIFF closeWindow error]", e);
      }
    },
    openWindow: (url, external = false) => {
      try {
        if (server === "dev") {
          window.open(url, "_blank");
          return;
        }
        liff.openWindow({ url, external });
      } catch (e) {
        console.error("[LIFF openWindow error]", e);
      }
    },
    text: async (message) => {
      try {
        if (server === "dev") {
          console.warn("[LIFF] text noop in dev:", message);
          return { status: "dev-noop" };
        }
        if (!inClient()) {
          console.warn("[LIFF] text() works only inside LINE client chat.");
          return { status: "unsupported" };
        }
        if (!message || typeof message !== "string") {
          return {
            status: "error",
            error: "message must be a non-empty string",
          };
        }
        await liff.sendMessages([{ type: "text", text: message }]);
        return { status: "sent" };
      } catch (e) {
        console.error("[LIFF text error]", e);
        return { status: "error", error: e?.message };
      }
    },
    // Share via shareTargetPicker (safe wrapper)
    share: async (message) => {
      try {
        if (server === "dev") {
          console.warn("[LIFF] share noop in dev:", message);
          // Dev fallback: copy to clipboard
          try {
            await navigator.clipboard.writeText(typeof message === "string" ? message : JSON.stringify(message));
            return { status: "dev-copied" };
          } catch (e) {
            return { status: "dev-failed", error: e?.message };
          }
        }
        if (!inClient() || !liff?.shareTargetPicker) {
          console.warn("[LIFF] shareTargetPicker not available outside LINE client");
          return { status: "unsupported" };
        }
        const payload = typeof message === "string" ? [{ type: "text", text: message }] : message;
        await liff.shareTargetPicker(payload);
        return { status: "shared" };
      } catch (e) {
        console.error("[LIFF share error]", e);
        return { status: "error", error: e?.message };
      }
    },
    // Share a location by sending a text containing a map link (safe and simple)
    shareLocation: async ({ latitude, longitude, title = "ตำแหน่งร้าน", address = "" } = {}) => {
      try {
        const lat = latitude ?? process.env.NEXT_PUBLIC_SHOP_LAT ?? "13.736717";
        const lng = longitude ?? process.env.NEXT_PUBLIC_SHOP_LNG ?? "100.523186";
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        const message = `${title}\n${address ? address + "\n" : ""}${mapsUrl}`;

        if (server === "dev") {
          try {
            await navigator.clipboard.writeText(message);
            return { status: "dev-copied" };
          } catch (e) {
            return { status: "dev-failed", error: e?.message };
          }
        }

        if (!inClient() || !liff?.shareTargetPicker) {
          console.warn("[LIFF] shareTargetPicker not available outside LINE client");
          return { status: "unsupported" };
        }

        await liff.shareTargetPicker([{ type: "text", text: message }]);
        return { status: "shared" };
      } catch (e) {
        console.error("[LIFF shareLocation error]", e);
        return { status: "error", error: e?.message };
      }
    },
    // Local login/logout for non-LINE environments.
    login: async (username, password) => {
      // Very small mock auth: accept any non-empty username/password in dev
      // In production, wire this to your auth endpoint.
      if (!username || !password) {
        return { status: "error", error: "username and password required" };
      }
      try {
        // Create a minimal profile shape similar to LIFF's profile
        const profile = {
          userId: `local-${username}`,
          displayName: username,
          pictureUrl: null,
          email: null,
        };

        globalThis.localStorage?.setItem("local_liff_profile", JSON.stringify(profile));
        setLiffProfile(profile);
        setIsLoggedIn(true);
        return { status: "ok", profile };
      } catch (e) {
        console.error("[LIFF local login error]", e);
        return { status: "error", error: e?.message };
      }
    },
    logout: () => {
      try {
        // Clear local session
        globalThis.localStorage?.removeItem("local_liff_profile");
        setLiffProfile(null);
        setIsLoggedIn(false);
        // If inside LINE client, also call liff.logout()
        if (liffReady && inClient() && liff?.logout) {
          try {
            liff.logout();
          } catch (e) {
            console.warn("[LIFF logout]", e);
          }
        }
      } catch (e) {
        console.error("[LIFF logout error]", e);
      }
    },
  };

  if (isLoading) {
    return <div className="gradient-background flex h-dvh w-full items-center justify-center">Loading...</div>;
  }

  return (
    <LiffContext.Provider
      value={{
        liffProfile,
        isLoggedIn,
        isLoading,
        lineAccessToken,
        liff: liffReady ? liff : null,
        actions,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
}

export const useLiff = () => useContext(LiffContext);
