
export const MakeRoomButton = ({onClick}: {onClick: () => void}) => {
    return (
        <button 
        onClick={onClick}
        type="button"
        className="text-[35px] bg-gray-500 hover:bg-gray-800 text-white font-medium py-10 px-30 rounded-md shadow-sm transition-colors duration-400">
            作成
        </button>
    );
}

export const JoinRoomButton = ({onClick}: {onClick: () => void}) => {
    return (
        <button 
        onClick={onClick}
        className="cursor-pointer bg-gray-500 text-[35px] hover:bg-gray-800 text-white font-medium py-10 px-30 rounded-md shadow-sm transition-colors duration-400">
            参加
        </button>
    );
}