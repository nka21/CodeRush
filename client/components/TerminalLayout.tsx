"use client";

import { useTypingAnimation } from "@/hooks/useTypingAnimation";
import { usePathname } from "next/navigation";
import React, { memo, useEffect, useState } from "react";

type TerminalHeaderProps = {
  title: string;
  roomId?: string;
  currentParticipants?: number;
  maxParticipants?: number;
};

const TerminalHeader = memo((props: TerminalHeaderProps) => {
  const { title, roomId, currentParticipants, maxParticipants } = props;
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-[#333] bg-[#2d2d2d] px-5 py-3">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500" aria-label="Close" />
        <div
          className="h-3 w-3 rounded-full bg-yellow-500"
          aria-label="Minimize"
        />
        <div
          className="h-3 w-3 rounded-full bg-green-500"
          aria-label="Maximize"
        />
        <div className="ml-2 text-sm text-white opacity-80">{title}</div>
      </div>
      {pathname.startsWith("/room") && (
        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-2 text-[#00ff00]">
            <div className="rounded-[3px] bg-[#333] px-2 py-1">
              {roomId || "----"}
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            {/* 参加者数分の緑色ドット（アニメーション付き） */}
            {Array.from({ length: currentParticipants ?? 0 }, (_, index) => (
              <div
                key={`active-${index}`}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"
              />
            ))}
            {/* 残りのスロット分の灰色ドット */}
            {Array.from(
              { length: (maxParticipants ?? 4) - (currentParticipants ?? 0) },
              (_, index) => (
                <div
                  key={`empty-${index}`}
                  className="h-1.5 w-1.5 rounded-full bg-gray-700"
                />
              ),
            )}
            <span>{`${currentParticipants ?? 0}/${maxParticipants ?? 4}`}</span>
          </div>
        </div>
      )}
    </header>
  );
});

type TerminalFooterProps = {
  currentTime: string;
};

const TerminalFooter = memo((props: TerminalFooterProps) => {
  const { currentTime } = props;

  return (
    <footer className="flex justify-between border-t border-[#333] bg-[#2d2d2d] px-5 py-2 text-xs text-gray-400">
      <span>Ready</span>
      <span>Connected to server</span>
      <time>{currentTime}</time>
    </footer>
  );
});

// === TerminalLayout ===
type TerminalLayoutProps = {
  children: React.ReactNode;
  title?: string;
  currentPath?: string;
  cli?: string;
  roomId?: string;
  currentParticipants?: number;
  maxParticipants?: number;
  onTypingComplete?: () => void;
};

export const TerminalLayout = memo((props: TerminalLayoutProps) => {
  const {
    children,
    title = "code-rush@progate",
    currentPath = "aws@progate",
    cli,
    roomId,
    currentParticipants,
    maxParticipants,
    onTypingComplete,
  } = props;

  const [currentLocalTime, setCurrentLocalTime] = useState<string>("");

  // タイピングアニメーション用
  const commandText = `./code-rush ${cli || ""}`;
  const { displayedText, isComplete } = useTypingAnimation({
    text: commandText,
    baseSpeed: 10,
    delayAfterCompletion: 1000,
  });

  // タイピング完了を通知
  useEffect(() => {
    if (isComplete && onTypingComplete) {
      onTypingComplete();
    }
  }, [isComplete, onTypingComplete]);

  /**
   * ローカル時刻を1秒ごとに更新する
   */
  useEffect(() => {
    const updateTime = () => {
      const nowLocalTime = new Date();
      setCurrentLocalTime(nowLocalTime.toLocaleTimeString());
    };

    updateTime(); // 初回実行
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-cascadia relative flex min-h-screen items-center justify-center overflow-hidden">
      <main className="relative z-20 max-h-[90vh] w-[90%] max-w-2xl overflow-hidden rounded-xl border border-[#333] bg-gray-900 p-0 shadow-[0_0px_42px_rgba(0,255,65,0.1)]">
        <TerminalHeader
          title={title}
          roomId={roomId}
          currentParticipants={currentParticipants}
          maxParticipants={maxParticipants}
        />

        <section className="relative flex min-h-96 flex-1 flex-col bg-black p-8 text-green-400">
          <div className="mb-2 flex flex-col items-start sm:flex-row sm:items-center">
            <span className="mr-2 text-green-400" aria-label="プロンプト">
              {currentPath}:~$
            </span>
            <span className="text-white">
              {displayedText}
              {!isComplete && <span className="animate-pulse">|</span>}
            </span>
          </div>

          <div className="flex flex-1 flex-col">{isComplete && children}</div>

          <div className="mt-8 flex items-center">
            <span className="mr-2 text-green-400" aria-label="プロンプト">
              {currentPath}:~$
            </span>
            <span className="cursor" aria-hidden="true"></span>
          </div>
        </section>

        <TerminalFooter currentTime={currentLocalTime} />
      </main>
    </div>
  );
});
