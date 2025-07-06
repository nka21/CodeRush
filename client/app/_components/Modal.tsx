// Modal.tsx
'use client';


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
      className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose} // 背景クリックで閉じる
    >
      {/* モーダル本体 */}
      <div
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative bordborder-black-500"
        onClick={(e) => e.stopPropagation()} // モーダル内のクリックが背景に伝播しないようにする
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>
        {/* モーダルの中身 */}
        {children}
      </div>
    </div>
  );
}