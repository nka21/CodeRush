"use client";
import { useState } from "react";
import { RoomButton } from "./_components/RoomButton"
import {Modal} from "./_components/Modal";

export default function Home() {
  const [modal, setModal] = useState<string | null>(null);

  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "easy" | "normal" | "hard"
  >("normal");
  const [selectedGenre, setSelectedGenre] = useState<string>("C");

  return (
    <div className="text-center">
      <h1 className="mb-8 py-25 text-7xl font-bold">Code Rush!</h1>
      <div className="flex items-center justify-center gap-20">
        <RoomButton onClick={() => setModal("make")} variant="作成" />
        <RoomButton onClick={() => setModal("join")} variant="参加"/>
      </div>

      <Modal isOpen={modal === "make"} onClose={() => setModal(null)}>
        <h2 className="mb-4 text-2xl font-bold">部屋を作成します</h2>
        <p className="mb-2">
          新しい対戦部屋を作成します。難易度とジャンルを選んでください。
        </p>

        {/* 難易度選択 */}
        <p className="mt-4 mb-2">難易度を選択：</p>
        <div className="mb-6 flex justify-center gap-4">
          {["easy", "normal", "hard"].map((level) => (
            <button
              key={level}
              onClick={() =>
                setSelectedDifficulty(level as "easy" | "normal" | "hard")
              }
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                selectedDifficulty === level
                  ? "bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {/* ジャンル選択 */}
        <p className="mb-2">ジャンルを選択：</p>
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          {["C", "Python", "Java", "Go", "JavaScript", "C++", "C#"].map(
            (genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedGenre === genre
                    ? "bg-green-600 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {genre}
              </button>
            ),
          )}
        </div>

        {/* 決定ボタン */}
        <button
          onClick={() => {
            console.log("部屋作成: 難易度 =", selectedDifficulty);
            console.log("ジャンル =", selectedGenre);
            setModal(null);
          }}
          className="mt-6 rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          決定
        </button>
      </Modal>

      <Modal isOpen={modal === "join"} onClose={() => setModal(null)}>
        <h2 className="mb-4 text-2xl font-bold">部屋に参加します</h2>
        <p>参加コードを入力してください。</p>
        <input
          type="text"
          className="mt-2 w-full rounded-md border-2 border-gray-300 p-2"
          placeholder="例: ABCD"
        />
        <button
          onClick={() => setModal(null)}
          className="mt-6 rounded-md bg-green-500 px-4 py-2 text-white"
        >
          参加
        </button>
      </Modal>
    </div>
  );
}