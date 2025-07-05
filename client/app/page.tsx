"use client";
import { useState } from "react";
import { MakeRoomButton, JoinRoomButton } from "./roomButton";
import  Modal from "./Modal"


export default function Home() {

  const [modal, setModal] = useState<string | null>(null);

const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
const [selectedGenre, setSelectedGenre] = useState('C');

  return (
    <div className="text-center">
      <h1 className="text-7xl font-bold mb-8 py-25">Code Rush!</h1>
      <div className="flex gap-20 items-center justify-center">
        <MakeRoomButton onClick={() => setModal('make')} />
        <JoinRoomButton onClick={() => setModal('join')} />
      </div>

<Modal isOpen={modal === 'make'} onClose={() => setModal(null)}>
  <h2 className="text-2xl font-bold mb-4">部屋を作成します</h2>
  <p className="mb-2">新しい対戦部屋を作成します。難易度とジャンルを選んでください。</p>

  {/* 難易度選択 */}
  <p className="mb-2 mt-4">難易度を選択：</p>
  <div className="flex gap-4 justify-center mb-6">
    {['easy', 'normal', 'hard'].map((level) => (
      <button
        key={level}
        onClick={() => setSelectedDifficulty(level as 'easy' | 'normal' | 'hard')}
        className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors
          ${selectedDifficulty === level
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
      >
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </button>
    ))}
  </div>

  {/* ジャンル選択 */}
  <p className="mb-2">ジャンルを選択：</p>
  <div className="flex flex-wrap gap-3 justify-center mb-6">
    {['C', 'Python', 'Java', 'Go', 'JavaScript', 'C++', 'C#'].map((genre) => (
      <button
        key={genre}
        onClick={() => setSelectedGenre(genre)}
        className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors
          ${selectedGenre === genre
            ? 'bg-green-600 text-white'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
      >
        {genre}
      </button>
    ))}
  </div>

  {/* 決定ボタン */}
  <button
    onClick={() => {
      console.log('部屋作成: 難易度 =', selectedDifficulty);
      console.log('ジャンル =', selectedGenre);
      setModal(null);
    }}
    className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md"
  >
    決定
  </button>
</Modal>

    <Modal isOpen={modal === 'join'} onClose={() => setModal(null)}>
        <h2 className="text-2xl font-bold mb-4">部屋に参加します</h2>
        <p>参加コードを入力してください。</p>
        <input type="text" className="border-2 border-gray-300 rounded-md p-2 mt-2 w-full" placeholder="例: ABCD" />
        <button
          onClick={() => setModal(null)}
          className="mt-6 bg-green-500 text-white px-4 py-2 rounded-md">
          参加
        </button>
      </Modal>

    </div>
  );
}

