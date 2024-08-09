import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '../contexts/AuthContext';
import NavigationWrapper from '../components/ControlPanel/NavigationWrapper';

export const metadata: Metadata = {
  metadataBase: new URL('https://replaiced.com'), // Replace with your actual domain
  title: "ReplAIced",
  description: "ReplAIced - A cutting-edge platform for AI security challenges, competitive gameplay, and vulnerability testing.",
  keywords: "AI security, machine learning, cybersecurity, vulnerability assessment, competitive gaming, AI models, security challenges, ReplAIced, technology innovation, digital safety",
  openGraph: {
    title: "ReplAIced - AI Security Challenge Arena",
    description: "Join ReplAIced to challenge AI models, discover vulnerabilities, and redefine security standards in a competitive environment.",
    url: "https://replaiced.com",
    images: ["/default-logo.png"], // Make sure this path is correct
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavigationWrapper>
            {children}
          </NavigationWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}