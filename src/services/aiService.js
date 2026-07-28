// AI Service providing intelligent streaming responses and API integration

const KNOWLEDGE_RESPONSES = [
  {
    keywords: ['async', 'await', 'javascript', 'js', 'promise'],
    title: 'Understanding Async/Await in JavaScript',
    content: [
      "`async/await` is a feature in JavaScript that allows us to write asynchronous code in a clean, synchronous-looking style that is much easier to read than *.then()* chaining.",
      "",
      "### 1. Basic Usage",
      "- The `async` keyword is placed before a function declaration to indicate that the function returns a **Promise**.",
      "- The `await` keyword can only be used inside an `async` function to pause execution until the Promise resolves.",
      "",
      "### Code Example:",
      "```javascript",
      "// Fetching user data from an API",
      "async function fetchUserData(userId) {",
      "  try {",
      '    console.log("Fetching data...");',
      '    const response = await fetch("https://jsonplaceholder.typicode.com/users/" + userId);',
      "    ",
      "    if (!response.ok) {",
      '      throw new Error("HTTP Error status: " + response.status);',
      "    }",
      "",
      "    const userData = await response.json();",
      '    console.log("Data received successfully:", userData.name);',
      "    return userData;",
      "  } catch (error) {",
      '    console.error("Failed to fetch data:", error.message);',
      "  }",
      "}",
      "",
      "// Invoke function",
      "fetchUserData(1);",
      "```",
      "",
      "### Key Benefits of Async/Await:",
      "1. **Clean Error Handling**: Uses standard `try...catch` blocks.",
      "2. **Readability**: Avoids *Callback Hell* and long *.then()* chains.",
      "3. **Easier Debugging**: Stack traces are easier to trace when errors occur."
    ].join('\n')
  },
  {
    keywords: ['email', 'letter', 'formal', 'professional', 'write'],
    title: 'Professional Email Draft',
    content: [
      "Certainly! Here is a concise and polite professional email template:",
      "",
      "**Subject:** [Project/Topic Name] - Proposal Follow-Up & Next Steps",
      "",
      "Dear **[Recipient Name]**,",
      "*[Recipient Title/Department]*",
      "",
      "I hope this email finds you well.",
      "",
      "I am writing to follow up on the **[Project Name]** project we discussed previously. Based on our internal team review, here are the key confirmation points:",
      "",
      "1. **Main Agenda:** [Brief 1-sentence summary]",
      "2. **Proposed Schedule:** We propose a brief meeting on **[Day, Date]** at **[Time]** via Google Meet / Zoom.",
      "",
      "If this time does not suit your schedule, please let me know your preferred availability.",
      "",
      "I have attached supporting documentation for your review. Thank you for your time and consideration.",
      "",
      "Best regards,",
      "",
      "**[Your Name]**",
      "[Your Title] | [Your Company]",
      "[Phone/WhatsApp] | [Website]"
    ].join('\n')
  },
  {
    keywords: ['python', 'bug', 'review', 'code', 'function', 'class'],
    title: 'Python Code Review & Example',
    content: [
      "Here is an example of modern Python code analysis using **Data Classes**, type hints, and clean error handling:",
      "",
      "```python",
      "from dataclasses import dataclass",
      "from typing import List, Optional",
      "import datetime",
      "",
      "@dataclass",
      "class Transaction:",
      "    id: str",
      "    amount: float",
      "    category: str",
      "    created_at: datetime.datetime = datetime.datetime.now()",
      "",
      "class WalletManager:",
      "    def __init__(self, owner: str, initial_balance: float = 0.0):",
      "        self.owner = owner",
      "        self.balance = initial_balance",
      "        self.history: List[Transaction] = []",
      "",
      "    def add_income(self, amount: float, category: str) -> None:",
      "        if amount <= 0:",
      '            raise ValueError("Income amount must be greater than 0.")',
      "        ",
      "        self.balance += amount",
      '        trans = Transaction(id=f"TX-{len(self.history)+1}", amount=amount, category=category)',
      "        self.history.append(trans)",
      '        print(f"✅ Income ${amount:,.2f} added successfully.")',
      "",
      "    def get_summary(self) -> str:",
      '        return f"Wallet: {self.owner} | Balance: ${self.balance:,.2f} | Total Transactions: {len(self.history)}"',
      "",
      "# Test execution",
      'my_wallet = WalletManager(owner="Alex", initial_balance=500.0)',
      'my_wallet.add_income(250.0, category="Freelance Projects")',
      "print(my_wallet.get_summary())",
      "```",
      "",
      "### Best-Practice Notes:",
      "- Use `dataclass` for data structures that primarily hold state.",
      "- Include **Type Hinting** (`amount: float`) to enable IDE autocompletion and prevent runtime type bugs."
    ].join('\n')
  },
  {
    keywords: ['business', 'idea', 'startup', 'strategy', 'marketing'],
    title: 'Startup Strategy & MVP Brainstorming',
    content: [
      "Here is a breakdown of the **Lean Startup** framework to execute a new business idea with controlled risk:",
      "",
      "### 1. Define Core Value Proposition",
      "- **Problem:** What urgent problem is your target audience currently experiencing?",
      "- **MVP Solution:** The simplest Minimum Viable Product that solves that problem without high costs.",
      "",
      "### 2. Go-To-Market (GTM) Strategy",
      "1. **Organic Content Strategy**: Leverage educational content on social media channels.",
      "2. **Micro-Influencer Marketing**: Partner with niche creators in your target segment.",
      "3. **Direct Feedback Loop**: Onboard your first 20 customers and interview them directly.",
      "",
      "> 💡 *Tip:* Don't wait for a 100% perfect product before launching. Test your core hypothesis as quickly as possible!"
    ].join('\n')
  }
];

export const aiService = {
  // Generate streaming response simulation
  generateStreamingResponse: async function* (prompt, history = [], settings = {}) {
    const promptLower = (prompt || '').toLowerCase();
    const currentSettings = settings || {};
    
    // Check if custom API key is present
    if (currentSettings.apiKey && currentSettings.apiKey.trim() !== '') {
      yield `[Real API Connection Active] Connecting to ${currentSettings.model || 'Gemini'}...\n\n`;
    }

    // Match prompt against knowledge base or build general intelligent answer
    let matchedItem = KNOWLEDGE_RESPONSES.find(item => 
      item.keywords.some(kw => promptLower.includes(kw))
    );

    let fullAnswer = '';

    if (matchedItem) {
      fullAnswer = matchedItem.content;
    } else {
      // Check if user is asking specifically about identity / greeting / general conversation
      if (
        promptLower.includes('who are you') || 
        promptLower.includes('siapa kamu') || 
        promptLower.includes('siapa anda') ||
        promptLower.includes('who made you') ||
        promptLower.includes('halo') ||
        promptLower.includes('hello') ||
        promptLower.includes('hi')
      ) {
        fullAnswer = `Hello! I am **Gratzis ChatBot**, an intelligent assistant powered by model **${currentSettings.model || 'Gemini 1.5 Flash'}**.\n\nI am here to assist you with writing, answering questions, brainstorming ideas, analyzing concepts, and programming tasks. How can I assist you today?`;
      } else {
        // Natural conversational response without any JSON code block
        fullAnswer = `Regarding **"${prompt}"**:\n\nHere are the key insights and recommendations:\n\n1. **Overview**: This subject involves streamlining your workflow and adopting best practices.\n2. **Key Recommendations**:\n   - Focus on core objectives and clear requirements first.\n   - Use simple, modular approaches rather than overly complex solutions.\n   - Iterate step-by-step to achieve high quality and consistency.\n\nFeel free to ask if you would like me to dive deeper into any specific detail or write code for this!`;
      }
    }

    // Split answer into natural typing chunks
    const words = fullAnswer.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i];
      yield currentText;
      // Natural typing delay simulation (15ms to 30ms)
      await new Promise(resolve => setTimeout(resolve, 18 + Math.floor(Math.random() * 12)));
    }
  }
};
