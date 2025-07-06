import { useState } from "react";

type ButtonVariant = "作成" | "参加";

type ButtonProps = {
  onClick: () => void;
  variant: ButtonVariant;
};

export const RoomButton = (props: ButtonProps) => {
  const { onClick, variant } = props;
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      type="button"
      style={{ boxShadow: hover ? "none" : "0 7px #f5f5dc" }}
      className="relative cursor-pointer rounded-md bg-gray-500 px-[120px] py-10 text-[35px] font-medium text-white transition-colors duration-400 hover:[top:7px] hover:bg-gray-800"
    >
      {variant}
    </button>
  );
};
