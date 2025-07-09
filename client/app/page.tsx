import { TerminalLayout } from "@/components/TerminalLayout";
import { HomeClient } from "./_components/HomeClient";

export default function Home() {
  return (
    <TerminalLayout cli="--init">
      <div className="glitch my-4">
        <h1 className="font-sixtyfour typing-text text-4xl font-bold text-green-400 md:text-5xl">
          CODE RUSH
        </h1>
      </div>

      <HomeClient />
    </TerminalLayout>
  );
}
