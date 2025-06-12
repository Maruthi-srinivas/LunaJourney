// const axios = require('axios');
// const pool = require('../db');

// const GROQ_API_KEY = process.env.GROQ_API_KEY;

// exports.getOrGenerateTimeline = async (req, res) => {
//   const userId = req.userId;
//   const weekNumber = req.query.week;

//   if (!weekNumber) {
//     return res.status(400).json({ error: 'Week number is required' });
//   }

//   try {
//     // Check if timeline already exists for this user/week
//     const [rows] = await pool.query(
//       'SELECT event_json FROM timeline_events WHERE user_id = ? AND week_number = ?',
//       [userId, weekNumber]
//     );
//     if (rows.length) {
//       return res.json(JSON.parse(rows[0].event_json));
//     }

//     // If not, generate using Groq API
//     const prompt = `Generate a detailed timeline of pregnancy events, changes in the mother's body, and baby development for week ${weekNumber} of pregnancy. Format as a JSON object with keys: "weekSummary", "babyDevelopment", "motherChanges", "tips".`;

//     const groqRes = await axios.post(
//       'https://api.groq.com/openai/v1/chat/completions',
//       {
//         model: "llama3-8b-8192",
//         messages: [
//           { role: "system", content: "You are a maternal health assistant." },
//           { role: "user", content: prompt }
//         ],
//         max_tokens: 800,
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${GROQ_API_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     let timeline;
//     try {
//       timeline = JSON.parse(groqRes.data.choices[0].message.content);
//     } catch (e) {
//       timeline = { weekSummary: groqRes.data.choices[0].message.content };
//     }

//     await pool.query(
//       'INSERT INTO timeline_events (user_id, week_number, event_json) VALUES (?, ?, ?)',
//       [userId, weekNumber, JSON.stringify(timeline)]
//     );

//     res.json(timeline);
//   } catch (error) {
//     console.error('Error generating timeline:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Failed to generate timeline', details: error.message });
//   }
// };


const axios = require('axios');
const pool = require('../db');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

exports.getOrGenerateTimeline = async (req, res) => {
  const userId = req.userId;
  const weekNumber = req.query.week;

  try {
    // Input validation
    if (!userId) {
      console.log('Missing userId in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!weekNumber) {
      console.log('Missing week number in request');
      return res.status(400).json({ error: 'Week number is required' });
    }

    console.log(`Fetching timeline for user ${userId}, week ${weekNumber}`);

    // Check if timeline exists in database
    try {
      const [rows] = await pool.query(
        'SELECT event_json FROM timeline_events WHERE user_id = ? AND week_number = ?',
        [userId, weekNumber]
      );
      
      if (rows.length) {
        console.log('Timeline found in database');
        try {
          const timeline = JSON.parse(rows[0].event_json);
          return res.json(timeline);
        } catch (e) {
          console.error('Error parsing stored timeline JSON:', e);
          // Continue to generate a new one if parsing fails
        }
      }
    } catch (dbError) {
      console.error('Database error when checking for existing timeline:', dbError);
      // If there's a database error (like missing table), we'll continue to generate
    }

    console.log('Generating new timeline with Groq API');
    
    // Check if GROQ_API_KEY exists
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing in .env file');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Generate prompt
    const prompt = `Generate a detailed pregnancy timeline for week ${weekNumber}. 
Your response MUST be a valid JSON object with EXACTLY this structure:
{
  "babyDevelopment": {
    "size": "A brief description of the baby's size",
    "compareTo": "What the baby's size compares to (e.g., 'a lemon')",
    "description": "A paragraph about the baby's development this week"
  },
  "motherChanges": {
    "physical": ["Change 1", "Change 2", "Change 3"],
    "hormonal": ["Change 1", "Change 2", "Change 3"]
  },
  "tipsForWeek": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"],
  "importantNotes": "Any important notes for this week"
}
Do not include any text outside of this JSON structure.`;

    // Call Groq API
    try {
      const groqRes = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: "You are a maternal health assistant." },
            { role: "user", content: prompt }
          ],
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Groq API response received');

      // Parse the response
      let timeline;
      try {
        timeline = JSON.parse(groqRes.data.choices[0].message.content);
        console.log('Successfully parsed Groq response');
      } catch (e) {
        console.error('Error parsing Groq response:', e);
        timeline = { 
          babyDevelopment: {
            size: "Information not available",
            compareTo: "Information not available",
            description: "Information not available"
          }, 
          motherChanges: {
            physical: [], 
            hormonal: []
          }, 
          tipsForWeek: [], 
          importantNotes: "Unable to generate timeline for this week." 
        };
      }

      // Save to database
      try {
        // Make sure we're storing a string, not an object
        const timelineJson = typeof timeline === 'string' 
          ? timeline 
          : JSON.stringify(timeline);
          
        await pool.query(
          'INSERT INTO timeline_events (user_id, week_number, event_json) VALUES (?, ?, ?)',
          [userId, weekNumber, timelineJson]
        );
        console.log('Timeline saved to database');
      } catch (e) {
        console.error('Error saving to database:', e);
        // Continue anyway to return the timeline
      }

      return res.json(timeline);
    } catch (groqError) {
      console.error('Groq API error:', groqError.response?.data || groqError.message);
      return res.status(500).json({ 
        error: 'Failed to generate timeline', 
        details: 'Error calling external API' 
      });
    }
  } catch (error) {
    console.error('Timeline controller error:', error);
    res.status(500).json({ 
      error: 'Failed to process timeline request', 
      details: error.message 
    });
  }
};