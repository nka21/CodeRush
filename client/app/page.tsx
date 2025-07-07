"use client";

import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>("");

  /**
   * 部屋作成モーダルを表示
   */
  const handleMakeRoom = useCallback(() => {
    console.log("> Making new room...");
    // TODO: 部屋作成モーダルを表示
  }, []);

  /**
   * 部屋参加モーダルを表示
   */
  const handleJoinRoom = useCallback(() => {
    console.log("> Joining existing room...");
    // TODO: 部屋参加モーダルを表示
  }, []);

  /**
   * キーボードショートカット（1キー：部屋作成、2キー：部屋参加）
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "1") handleMakeRoom();
      if (event.key === "2") handleJoinRoom();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleMakeRoom, handleJoinRoom]);

  /**
   * 現在時刻を更新
   */
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };

    updateTime(); // 初回実行
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-cascadia relative flex min-h-screen items-center justify-center overflow-hidden">
      <main className="relative z-20 w-[90%] max-w-2xl overflow-hidden rounded-xl border border-[#333] bg-gray-900 p-0 shadow-[0_0px_42px_rgba(0,255,65,0.1)]">
        <header className="flex items-center gap-2 border-b border-[#333] bg-[#2d2d2d] px-5 py-3">
          <div
            className="h-3 w-3 rounded-full bg-red-500"
            aria-label="Close"
          ></div>
          <div
            className="h-3 w-3 rounded-full bg-yellow-500"
            aria-label="Minimize"
          ></div>
          <div
            className="h-3 w-3 rounded-full bg-green-500"
            aria-label="Maximize"
          ></div>
          <div className="ml-2 text-sm text-white opacity-80">
            code-rush@progate
          </div>
        </header>

        <section className="relative min-h-96 bg-black p-8 text-green-400">
          {/* コマンドライン */}
          <div className="mb-2 flex items-center">
            <span className="mr-2 text-green-400" aria-label="プロンプト">
              aws@progate:~$
            </span>
            <span className="text-white">./code-rush --init</span>
          </div>

          {/* ステータス */}
          <div className="mb-2 flex items-center">
            <span className="mr-2 text-green-400" aria-label="出力">
              &gt;
            </span>
            <span className="text-white">Initializing Code Rush...</span>
          </div>

          {/* メインタイトル */}
          <div className="glitch my-4">
            <h1 className="font-sixtyfour typing-text text-4xl font-bold text-green-400 md:text-5xl">
              CODE RUSH
            </h1>
          </div>

          <div className="mb-2 flex items-center">
            <span className="mr-2 text-green-400" aria-label="出力">
              &gt;
            </span>
            <span className="text-white">
              Real-time collaborative coding platform ready.
            </span>
          </div>

          {/* メニュー */}
          <nav className="mt-8 flex flex-col" role="menu">
            <button
              className="menu-item group relative my-2 flex cursor-pointer items-center overflow-hidden rounded-lg border border-[rgba(0,255,136,0.2)] bg-white/[0.02] p-5 opacity-0 transition-all duration-300 hover:translate-x-[10px] hover:border-[rgba(0,255,136,0.5)] hover:bg-[rgba(0,255,136,0.05)] hover:shadow-[0_0_30px_rgba(0,255,136,0.3),inset_0_0_20px_rgba(0,255,136,0.1)]"
              onClick={handleMakeRoom}
              role="menuitem"
              aria-label="新しい部屋を作成する"
            >
              <kbd className="mr-4 font-bold text-[#ff00ff] [text-shadow:0_0_10px_rgba(255,0,255,0.5)]">
                [1]
              </kbd>
              <div className="flex flex-col items-start">
                <span className="text-lg text-white">MAKE_ROOM</span>
                <p className="mt-1 text-sm text-gray-400">
                  新しいコーディングセッションを開始
                </p>
              </div>
              <span
                className="menu-arrow ml-auto transition-all duration-300 group-hover:translate-x-[5px] group-hover:text-[#00ff88]"
                aria-hidden="true"
              >
                →
              </span>
            </button>

            <button
              className="menu-item group relative my-2 flex cursor-pointer items-center overflow-hidden rounded-lg border border-[rgba(0,255,136,0.2)] bg-white/[0.02] p-5 opacity-0 transition-all duration-300 hover:translate-x-[10px] hover:border-[rgba(0,255,136,0.5)] hover:bg-[rgba(0,255,136,0.05)] hover:shadow-[0_0_30px_rgba(0,255,136,0.3),inset_0_0_20px_rgba(0,255,136,0.1)]"
              onClick={handleJoinRoom}
              role="menuitem"
              aria-label="既存の部屋に参加する"
            >
              <kbd className="mr-4 font-bold text-[#ff00ff] [text-shadow:0_0_10px_rgba(255,0,255,0.5)]">
                [2]
              </kbd>
              <div className="flex flex-col items-start">
                <span className="text-lg text-white">JOIN_ROOM</span>
                <p className="mt-1 text-sm text-gray-400">
                  既存のセッションに参加
                </p>
              </div>
              <span
                className="menu-arrow ml-auto transition-all duration-300 group-hover:translate-x-[5px] group-hover:text-[#00ff88]"
                aria-hidden="true"
              >
                →
              </span>
            </button>
          </nav>

          {/* カーソル */}
          <div className="mt-8 flex items-center">
            <span className="mr-2 text-green-400" aria-label="プロンプト">
              aws@progate:~$
            </span>
            <span className="cursor" aria-hidden="true"></span>
          </div>
        </section>

        <footer className="flex justify-between border-t border-[#333] bg-[#2d2d2d] px-5 py-2 text-xs text-gray-400">
          <span>Ready</span>
          <span>Connected to server</span>
          <time>{currentTime}</time>
        </footer>
      </main>
    </div>
  );
}
