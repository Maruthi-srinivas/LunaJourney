const axios = require('axios');
require('dotenv').config();

// Get API key from environment variables - update to use GROQ_API_KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY;

exports.sendMessage = async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    console.log('Sending request to Groq with message:', message);
    
    // Use Groq API to generate a response
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama3-8b-8192",
        messages: [
          { 
            role: "system", 
            content: `You are a maternal health assistant named MomWise. 
            Your goal is to provide helpful, evidence-based information about pregnancy and maternal health. 
            Always include a disclaimer that you are not a substitute for professional medical advice.
            If the query seems to indicate a medical emergency or serious concern, 
            advise the user to contact their healthcare provider immediately.` 
          },
          { role: "user", content: message }
        ],
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const reply = response.data.choices[0].message.content;
    res.json({ reply });
    
  } catch (error) {
    console.error('Error with Groq API:', error.response?.data || error.message);
    
    // Provide more detailed error information
    const errorDetails = error.response?.data?.error || { message: error.message };
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: JSON.stringify(errorDetails)
    });
  }
};

// const axios = require('axios');
// require('dotenv').config();

// // Use OpenAI instead of Groq
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// exports.sendMessage = async (req, res) => {
//   const { message } = req.body;
  
//   if (!message) {
//     return res.status(400).json({ error: 'Message is required' });
//   }
  
//   try {
//     console.log('Sending request to OpenAI with message:', message);
    
//     // Use OpenAI API to generate a response
//     const response = await axios.post(
//       'https://api.openai.com/v1/chat/completions',
//       {
//         model: "gpt-3.5-turbo",
//         messages: [
//           { 
//             role: "system", 
//             content: `You are a maternal health assistant named MomWise. 
//             Your goal is to provide helpful, evidence-based information about pregnancy and maternal health. 
//             Always include a disclaimer that you are not a substitute for professional medical advice.
//             If the query seems to indicate a medical emergency or serious concern, 
//             advise the user to contact their healthcare provider immediately.` 
//           },
//           { role: "user", content: message }
//         ],
//         max_tokens: 500,
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${OPENAI_API_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );
    
//     const reply = response.data.choices[0].message.content;
//     res.json({ reply });
    
//   } catch (error) {
//     console.error('Error with OpenAI API:', error.response?.data || error.message);
//     const errorDetails = error.response?.data?.error || { message: error.message };
//     res.status(500).json({ 
//       error: 'Failed to generate response',
//       details: JSON.stringify(errorDetails)
//     });
//   }
// };