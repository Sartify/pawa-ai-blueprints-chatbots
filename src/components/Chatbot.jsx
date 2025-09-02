// import React, { useState } from 'react';
// import EmptyState from './EmptyState';
// import MessageList from './MessageList';
// import ChatInput from './ChatInput';
// import { sendChatMessage } from '../api/chat';

// const ChatBotPage = () => {
//   const [inputValue, setInputValue] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [hasStartedConversation, setHasStartedConversation] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleQuestionClick = (question) => {
//     setInputValue(question);
//     handleSendMessage(question);
//   };

//   const handleSendMessage = async (message, files = []) => {
//     if (!message.trim()) return;

//     const userMessage = message;
    
//     // Add user message to chat
//     const newUserMessage = {
//       userMessage,
//       files: files,
//       botResponse: null,
//       isLoading: true
//     };

//     setMessages(prev => [...prev, newUserMessage]);
//     setHasStartedConversation(true);
//     setIsLoading(true);

//     try {
//       // Call the streaming chat API with chunk handler and files
//       const response = await sendChatMessage(userMessage, files, (chunk) => {
//         // Update the message with streaming chunks
//         setMessages(prev => prev.map((msg, index) => 
//           index === prev.length - 1 
//             ? {
//                 ...msg,
//                 botResponse: {
//                   // title: "Assistant Response",
//                   description: chunk.message.content,
//                   content: null
//                 },
//                 isLoading: false
//               }
//             : msg
//         ));
//       });
      
//       // Final update with complete response
//       setMessages(prev => prev.map((msg, index) => 
//         index === prev.length - 1 
//           ? {
//               ...msg,
//               botResponse: {
//                 // title: "Assistant Response",
//                 description: response.message.content,
//                 content: null
//               },
//               isLoading: false
//             }
//           : msg
//       ));
//     } catch (error) {
//       console.error('Error sending message:', error);
      
//       // Update with error message
//       setMessages(prev => prev.map((msg, index) => 
//         index === prev.length - 1 
//           ? {
//               ...msg,
//               botResponse: {
//                 title: "Error",
//                 description: "Sorry, I encountered an error. Please try again.",
//                 content: null
//               },
//               isLoading: false
//             }
//           : msg
//       ));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* If no conversation has started, show empty state */}
//       {!hasStartedConversation ? (
//         <EmptyState onQuestionClick={handleQuestionClick} />
//       ) : (
//         <MessageList
//           messages={messages}
//           onSendMessage={handleSendMessage}
//           inputValue={inputValue}
//           setInputValue={setInputValue}
//           isLoading={isLoading}
//         />
//       )}
      
//       {/* Single ChatInput component for both states */}
//       <ChatInput 
//         inputValue={inputValue}
//         setInputValue={setInputValue}
//         onSendMessage={handleSendMessage}
//         isLoading={isLoading}
//       />
//     </div>
//   );
// };

// export default ChatBotPage;




import React, { useState } from 'react';
import EmptyState from './EmptyState';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { sendChatMessage } from '../api/chat';

const ChatBotPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionClick = (question) => {
    setInputValue(question);
    handleSendMessage(question);
  };

  // New Chat handler - clears history and resets state
  const handleNewChat = () => {
    setMessages([]);
    setHasStartedConversation(false);
    setInputValue("");
    setIsLoading(false);
    
    // Optional: Reload the page (uncomment if you want page reload)
    // window.location.reload();
  };

  const handleSendMessage = async (message, files = []) => {
    if (!message.trim()) return;

    const userMessage = message;
        
    // Add user message to chat
    const newUserMessage = {
      userMessage,
      files: files,
      botResponse: null,
      isLoading: true
    };

    setMessages(prev => [...prev, newUserMessage]);
    setHasStartedConversation(true);
    setIsLoading(true);

    try {
      // Call the streaming chat API with chunk handler and files
      const response = await sendChatMessage(userMessage, files, (chunk) => {
        // Update the message with streaming chunks
        setMessages(prev => prev.map((msg, index) => 
          index === prev.length - 1
            ? {
               ...msg,
               botResponse: {
                 // title: "Assistant Response",
                 description: chunk.message.content,
                 content: null
               },
               isLoading: false
             }
           : msg
        ));
      });
            
      // Final update with complete response
      setMessages(prev => prev.map((msg, index) => 
        index === prev.length - 1
          ? {
             ...msg,
             botResponse: {
               // title: "Assistant Response",
               description: response.message.content,
               content: null
             },
             isLoading: false
           }
         : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
            
      // Update with error message
      setMessages(prev => prev.map((msg, index) => 
        index === prev.length - 1
          ? {
             ...msg,
             botResponse: {
               title: "Error",
               description: "Sorry, I encountered an error. Please try again.",
               content: null
             },
             isLoading: false
           }
         : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* If no conversation has started, show empty state */}
      {!hasStartedConversation ? (
        <EmptyState onQuestionClick={handleQuestionClick} />
      ) : (
        <MessageList
          messages={messages}
          onNewChat={handleNewChat} // Pass the new chat handler
        />
      )}
            
      {/* Single ChatInput component for both states */}
      <ChatInput 
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSendMessage={handleSendMessage}
        onNewChat={handleNewChat} // Pass the new chat handler to ChatInput too
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatBotPage;