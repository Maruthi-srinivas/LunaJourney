// const axios = require('axios');
// const pool = require('../db');

// exports.getOrGenerateDietPlan = async (req, res) => {
//   const userId = req.userId;
//   const weekNumber = req.query.week;

//   if (!weekNumber) {
//     return res.status(400).json({ error: 'Week number is required' });
//   }

//   try {
//     // Check if plan exists
//     const [rows] = await pool.query(
//       'SELECT plan_json FROM diet_plans WHERE user_id = ? AND week_number = ?',
//       [userId, weekNumber]
//     );
//     if (rows.length) return res.json(JSON.parse(rows[0].plan_json));

//     // Generate using Groq API
//     const prompt = `Generate a healthy, pregnancy-safe meal plan for week ${weekNumber} of pregnancy. Include breakfast, lunch, dinner, and snacks for each day of the week. Format as a JSON object with keys: "weekNumber", "dailyPlans" (an array of 7 objects, one per day, each with keys: "breakfast", "lunch", "dinner", "snacks").`;

//     const groqRes = await axios.post(
//       'https://api.groq.com/openai/v1/chat/completions',
//       {
//         model: "llama3-8b-8192",
//         messages: [
//           { role: "system", content: "You are a maternal health assistant." },
//           { role: "user", content: prompt }
//         ],
//         max_tokens: 1200,
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${GROQ_API_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     let plan;
//     try {
//       plan = JSON.parse(groqRes.data.choices[0].message.content);
//     } catch (e) {
//       plan = { weekNumber, dailyPlans: [] };
//     }

//     await pool.query(
//       'INSERT INTO diet_plans (user_id, week_number, plan_json) VALUES (?, ?, ?)',
//       [userId, weekNumber, JSON.stringify(plan)]
//     );

//     res.json(plan);
//   } catch (error) {
//     console.error('Error generating diet plan:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Failed to generate diet plan', details: error.message });
//   }
// };

const axios = require('axios');
const pool = require('../db');

exports.getOrGenerateDietPlan = async (req, res) => {
  const userId = req.userId;
  const weekNumber = req.query.week;
  const forceRegenerate = req.query.regenerate === 'true';  // Add this line

  try {
    // Validate inputs
    if (!userId) {
      console.log('Missing userId in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!weekNumber) {
      console.log('Missing week number in request');
      return res.status(400).json({ error: 'Week number is required' });
    }

    console.log(`Fetching diet plan for user ${userId}, week ${weekNumber}, regenerate: ${forceRegenerate}`);

    // Check if plan exists and we're not forcing regeneration
    if (!forceRegenerate) {  // Add this condition
      const [rows] = await pool.query(
        'SELECT plan_json FROM diet_plans WHERE user_id = ? AND week_number = ?',
        [userId, weekNumber]
      );

      // If plan exists, return it
      if (rows.length) {
        console.log('Diet plan found in database');
        try {
          const plan = JSON.parse(rows[0].plan_json);
          return res.json(plan);
        } catch (e) {
          console.error('Error parsing stored plan JSON:', e);
          // Continue to generate a new one if parsing fails
        }
      }
    } else {
      console.log('Forcing regeneration of diet plan');
    }

    console.log('Generating new diet plan with Groq API');
    
    // Check if GROQ_API_KEY exists
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing in .env file');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Generate prompt
    const prompt = `Generate a healthy, pregnancy-safe meal plan for week ${weekNumber} of pregnancy. 
Your response MUST be a valid JSON object with EXACTLY this structure:
{
  "weekNumber": ${weekNumber},
  "dailyPlans": [
    {
      "breakfast": {"title": "TITLE", "description": "DESCRIPTION"},
      "lunch": {"title": "TITLE", "description": "DESCRIPTION"},
      "dinner": {"title": "TITLE", "description": "DESCRIPTION"},
      "snacks": ["SNACK1", "SNACK2", "SNACK3"]
    },
    ... 6 more identical objects for remaining days of the week
  ]
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
          max_tokens: 1200,
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
      let plan;
      try {
        plan = JSON.parse(groqRes.data.choices[0].message.content);
        console.log('Successfully parsed Groq response');
      } catch (e) {
        console.error('Error parsing Groq response:', e);
        plan = { 
          weekNumber: parseInt(weekNumber), 
          dailyPlans: Array(7).fill().map(() => ({
            breakfast: { title: "Healthy breakfast", description: "Nutritious breakfast for pregnancy" },
            lunch: { title: "Balanced lunch", description: "Healthy lunch for pregnancy" },
            dinner: { title: "Nutritious dinner", description: "Healthy dinner for pregnancy" },
            snacks: ["Fruit", "Yogurt", "Nuts"]
          }))
        };
      }

      // Calculate trimester based on week number
      let trimester = "first";
      if (weekNumber > 13 && weekNumber <= 26) {
        trimester = "second";
      } else if (weekNumber > 26) {
        trimester = "third";
      }

      // Save to database
      try {
        await pool.query(
          'INSERT INTO diet_plans (user_id, week_number, plan_json, trimester) VALUES (?, ?, ?, ?)',
          [userId, weekNumber, JSON.stringify(plan), trimester]
        );
        console.log('Diet plan saved to database');
      } catch (e) {
        console.error('Error saving to database:', e);
        // Continue anyway to return the plan
      }

      return res.json(plan);
    } catch (groqError) {
      console.error('Groq API error:', groqError.response?.data || groqError.message);
      return res.status(500).json({ 
        error: 'Failed to generate diet plan', 
        details: 'Error calling external API' 
      });
    }
  } catch (error) {
    console.error('Diet plan controller error:', error);
    res.status(500).json({ 
      error: 'Failed to process diet plan request', 
      details: error.message 
    });
  }
};