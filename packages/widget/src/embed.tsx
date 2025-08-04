import { createRoot } from 'react-dom/client';
import ChatbotWidget from './index';

const script = document.currentScript;
const chatbotId = script?.getAttribute('data-chatbot-id') || '';

const div = document.createElement('div');
div.id = 'chatbot-widget-root';
document.body.appendChild(div);
const root = createRoot(div);
root.render(<ChatbotWidget chatbotId={chatbotId} />);