import { useState, FormEvent, KeyboardEvent } from 'react';

export default function Chat({ messages, onSendMessage }: { messages: { role: string; content: string }[], onSendMessage: (message: string) => void }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    onSendMessage(input);
    setInput('');
  };

  const handleButtonClick = () => {
    if (!isLoading) {
      const fakeEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as FormEvent<HTMLFormElement>;
      handleSubmit(fakeEvent);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      const fakeEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as FormEvent<HTMLFormElement>;
      handleSubmit(fakeEvent);
    }
  };

  return (
    <div className="w-full max-w-md md:ml-16 bg-gray-800 rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white text-lg font-semibold">Chat</h2>
      </div>
      <div className="p-4 overflow-y-auto h-96">
        <div className="flex flex-col space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex items-end space-x-2">
                {message.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <img src="/path/to/robot-avatar.png" alt="Robot" className="w-full h-full rounded-full" />
                  </div>
                )}
                <div className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white'} max-w-xs`}>
                  <span>{message.content}</span>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <img src="/path/to/user-avatar.png" alt="User" className="w-full h-full rounded-full" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            className="flex-1 p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="px-4 py-2 bg-green-700 text-white font-semibold rounded-lg shadow-md hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-75 transition duration-300 ease-in-out"
            onClick={handleButtonClick}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}