import { useState } from 'react';
import axios from 'axios';

interface ChatbotWidgetProps {
  chatbotId: string;
}

function ChatbotWidget({ chatbotId }: ChatbotWidgetProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const handleQuery = async () => {
    try {
      const res = await axios.post(`http://localhost:3001/chatbot/${chatbotId}/query`, { query });
      setResponse(res.data.response);
    } catch (error) {
      setResponse('Error fetching response');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', width: '300px' }}>
      <h3>Chatbot</h3>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask a question..."
      />
      <button onClick={handleQuery}>Send</button>
      {response && <p>{response}</p>}
    </div>
  );
}

export default ChatbotWidget;