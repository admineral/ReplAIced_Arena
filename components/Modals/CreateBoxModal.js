import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../contexts/AuthContext';

const modelOptions = [
  { id: 'default', name: 'Default', logo: '/default-logo.png' },
  { id: 'openai', name: 'OpenAI', logo: '/openai-logo.png' },
  { id: 'gemini', name: 'Gemini', logo: '/gemini-logo.png' },
  { id: 'claude', name: 'Claude', logo: '/claude-logo.png' },
  { id: 'meta', name: 'Meta', logo: '/meta-logo.png' },
];

const defaultPrompt = "You are a helpful AI assistant. Provide concise and accurate information to the user's queries.";
const defaultSecretSentence = "The secret word is:";

function getCaretCoordinates(element, position) {
  const div = document.createElement('div');
  const style = div.style;
  const computed = window.getComputedStyle(element);

  style.whiteSpace = 'pre-wrap';
  style.wordWrap = 'break-word';
  style.position = 'absolute';
  style.visibility = 'hidden';

  properties.forEach(prop => {
    style[prop] = computed[prop];
  });

  div.textContent = element.value.substring(0, position);

  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);

  document.body.appendChild(div);
  const coordinates = {
    top: span.offsetTop + parseInt(computed['borderTopWidth']),
    left: span.offsetLeft + parseInt(computed['borderLeftWidth'])
  };
  document.body.removeChild(div);

  return coordinates;
}

const properties = [
  'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
  'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform',
  'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing'
];
const CreateBoxModal = ({ isOpen, onClose, onCreateBox, mapSize }) => {
    const { user, addBoxId } = useAuth();
    const [selectedModelIndex, setSelectedModelIndex] = useState(0);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [secretWord, setSecretWord] = useState('');
    const [secretSentence, setSecretSentence] = useState(defaultSecretSentence);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const textareaRef = useRef(null);
  
    const handleCreateBox = async () => {
      const boxId = uuidv4();
      const combinedSystemPrompt = `${systemPrompt}\n\n${secretSentence} ${secretWord}`;
      const newBox = {
          id: boxId,
          type: modelOptions[selectedModelIndex].id,
          model: modelOptions[selectedModelIndex].name,
          systemPrompt: systemPrompt,
          secretWord: secretWord,
          secretSentence: secretSentence,
          combinedSystemPrompt: combinedSystemPrompt,
          difficulty: 'medium',
          createdAt: new Date().toISOString(),
          createdBy: {
              uid: user ? user.uid : 'anonymous',
              displayName: user ? (user.displayName || user.email || 'Anonymous') : 'Anonymous'
          }
      };
    
      try {
          const result = await onCreateBox(newBox, user ? user.uid : null);
          if (user && result) {
              const { firestoreId, customId, x, y } = result;
              console.log('Box created and indexed:', { firestoreId, customId, x, y });
          }
          onClose();
      } catch (error) {
          console.error('Error creating box:', error);
          // Handle the error (e.g., show an error message to the user)
      }
  };
  
    const handleModelSelect = (index) => {
      setSelectedModelIndex(index);
    };
  
    const handleDefaultPrompt = () => {
      setSystemPrompt(defaultPrompt);
    };
  
    const updateCursorPosition = () => {
      if (textareaRef.current) {
        const { selectionStart, selectionEnd } = textareaRef.current;
        if (selectionStart === selectionEnd) {
          const { offsetLeft, offsetTop, scrollTop, lineHeight } = textareaRef.current;
          const position = getCaretCoordinates(textareaRef.current, selectionStart);
          setCursorPosition({
            x: offsetLeft + position.left,
            y: offsetTop + position.top - scrollTop + lineHeight,
          });
        }
      }
    };
  
    useEffect(() => {
      updateCursorPosition();
    }, [systemPrompt]);
  
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Create New Box</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-center">Select AI Model</h3>
                <div className="flex justify-between items-center">
                  {modelOptions.map((model, index) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(index)}
                      className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                        selectedModelIndex === index
                          ? 'bg-blue-600'
                          : 'hover:bg-gray-700'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden mb-1">
                        <img 
                          src={model.logo} 
                          alt={model.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs">{model.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="systemPrompt" className="block text-sm font-medium">
                    System Prompt
                  </label>
                  <button
                    onClick={handleDefaultPrompt}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
                  >
                    Use Default Prompt
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    id="systemPrompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    onKeyUp={updateCursorPosition}
                    onClick={updateCursorPosition}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    rows="4"
                    placeholder={defaultPrompt}
                  ></textarea>
                  <div 
                    className="absolute bg-blue-500 text-white px-2 py-1 rounded text-xs cursor-help group"
                    style={{ left: `${cursorPosition.x}px`, top: `${cursorPosition.y}px` }}
                  >
                    *****
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded p-2 hidden group-hover:block whitespace-nowrap">
                      Secret word will be added here
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <span className="text-sm mr-2">Secret Sentence:</span>
                  <input
                    type="text"
                    value={secretSentence}
                    onChange={(e) => setSecretSentence(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white flex-grow"
                    placeholder={defaultSecretSentence}
                  />
                </div>
                <div className="mt-2 flex items-center">
                  <span className="text-sm mr-2">Secret Word:</span>
                  <input
                    type="text"
                    value={secretWord}
                    onChange={(e) => setSecretWord(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-600 rounded-md text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBox}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                  disabled={!modelOptions[selectedModelIndex] || !secretWord.trim()}
                >
                  Create Box
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  
  export default CreateBoxModal;