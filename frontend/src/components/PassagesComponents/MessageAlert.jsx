// // frontend\src\components\PassagesComponents\MessageAlert.jsx
const MessageAlert = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className={`p-3 mb-4 text-sm rounded ${
        message.includes('successfully')
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {message}
    </div>
  );
};

export default MessageAlert;