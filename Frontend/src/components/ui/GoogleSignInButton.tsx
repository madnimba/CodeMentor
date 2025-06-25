import { useEffect } from "react";

interface GoogleSignInButtonProps {
  clientId: string;
  onCredential: (idToken: string) => void;
  buttonText?: string;
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  width?: "full" | "auto";
}

export function GoogleSignInButton({
  clientId,
  onCredential,
  buttonText = "Continue with Google",
  theme = "outline",
  size = "large",
}: GoogleSignInButtonProps) {
  useEffect(() => {
    // @ts-ignore
    if (window.google && clientId) {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response.credential) {
            onCredential(response.credential);
          }
        },
      });
      // @ts-ignore
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme, size, text: "continue_with", width: "full" ,type:"standard"}
      );
    }
  }, [clientId, onCredential, theme, size, buttonText]);

  return <div id="google-signin-btn" style={{ width: "100%" }} />;
} 