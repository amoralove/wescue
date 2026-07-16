import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatInterface } from "@/components/chat/ChatInterface";

export const metadata = {
  title: "Find Your Match - Wescues",
  description: "Chat with our AI to find rescue dogs that match your lifestyle.",
};

export default function ChatPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[120px] pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div
            className="inline-block bg-forest text-white font-heading font-bold text-base px-5 py-1.5 border-3 border-pencil shadow-[4px_4px_0px_0px_#2d2d2d] mb-4 -rotate-2"
            style={{
              borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
            }}
          >
            Find Your Match
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
            Let&apos;s find your perfect dog
          </h1>
          <p className="text-lg opacity-70 max-w-md mx-auto">
            Answer a few quick questions — like talking to a friend at the shelter.
          </p>
        </div>

        <ChatInterface />
      </main>
      <Footer />
    </>
  );
}
