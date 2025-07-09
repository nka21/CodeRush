// Modal.tsx
"use client";

// Propsの型を定義
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; // モーダルの中身を外部から受け取る
};

export const Modal = (props: ModalProps) => {
  const { isOpen, onClose, children } = props;

  // isOpenがfalseの場合は何もレンダリングしない
  if (!isOpen) {
    return null;
  }

  return (
    // オーバーレイ（背景部分）
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose} // 背景クリックで閉じる
    >
      {/* モーダル本体 */}
      <div
        className="border-black-500 relative w-full max-w-md rounded-lg border bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        aria-label="部屋作成モーダル" // モーダル内のクリックが背景に伝播しないようにする
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>
        {/* モーダルの中身 */}
        {children}
      </div>
    </div>
  );
};
