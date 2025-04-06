// src/lib/ai-generation/openai-service.js
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a script for a sports celebrity reel
 * @param {Object} params - Script generation parameters
 * @param {string} params.athlete - Name of the athlete
 * @param {string} params.sport - Sport category
 * @param {string} params.focus - Focus of the reel (career highlights, comeback story, etc.)
 * @param {number} params.duration - Target duration in seconds
 * @returns {Promise<Object>} Generated script and metadata
 */
export async function generateScript({
  athlete,
  sport,
  focus = 'career highlights',
  duration = 30,
}) {
  // Calculate approximate word count based on target duration
  // Assuming average speaking rate of ~150 words per minute
  const targetWordCount = Math.round((duration / 60) * 150);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a talented sports documentary scriptwriter. 
          Create engaging, factually accurate scripts about sports celebrities.
          Focus on compelling storytelling with dramatic moments and inspirational elements.
          Scripts should be concise and suitable for vertical video format.
          Target word count: approximately ${targetWordCount} words.
          Include timestamps with [TIME 00:00] format every 5-7 seconds of narration.`
        },
        {
          role: "user",
          content: `Create a script for a short-form video about ${athlete}, focusing on their ${focus} in ${sport}.
          The script should include:
          1. A captivating introduction
          2. Key moments and achievements
          3. An inspirational conclusion
          
          Also provide:
          - 5 relevant image search terms for this athlete and story
          - 3 title options for this video
          - Suggested background music mood/style`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract and process the generated content
    const rawContent = response.choices[0].message.content;
    
    // Parse the response to extract different components
    const script = extractScript(rawContent);
    const imageSearchTerms = extractImageSearchTerms(rawContent);
    const titleOptions = extractTitleOptions(rawContent);
    const musicSuggestion = extractMusicSuggestion(rawContent);

    return {
      script,
      imageSearchTerms,
      titleOptions,
      musicSuggestion,
      athlete,
      sport,
      focus,
      targetDuration: duration,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating script with OpenAI:', error);
    throw new Error('Failed to generate script');
  }
}

/**
 * Extract the main script content from the OpenAI response
 */
function extractScript(content) {
  // This is a simple extraction - in production you would use more robust parsing
  // to handle various formats that the AI might return
  const scriptLines = [];
  const lines = content.split('\n');
  let inScript = false;

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Look for section markers to find the script portion
    if (line.includes('IMAGE SEARCH TERMS') || 
        line.includes('TITLE OPTIONS') || 
        line.includes('MUSIC SUGGESTION')) {
      inScript = false;
      continue;
    }
    
    // If we're in the script portion or found a timestamp, include the line
    if (inScript || line.includes('[TIME') || line.startsWith('SCRIPT')) {
      if (line.startsWith('SCRIPT')) {
        inScript = true;
        continue; // Skip the "SCRIPT:" header line
      }
      scriptLines.push(line);
    }
  }

  return scriptLines.join('\n');
}

/**
 * Extract image search terms from the OpenAI response
 */
function extractImageSearchTerms(content) {
  const terms = [];
  const lines = content.split('\n');
  let inImageSection = false;

  for (const line of lines) {
    if (line.includes('IMAGE SEARCH TERMS')) {
      inImageSection = true;
      continue;
    }
    
    if (inImageSection) {
      if (line.includes('TITLE OPTIONS') || !line.trim()) {
        inImageSection = false;
        continue;
      }
      
      // Extract numbered or bulleted terms
      const match = line.match(/(?:^|\n)[\d-]*\s*[.)-]*\s*"?([^"]+)"?/);
      if (match && match[1]) {
        terms.push(match[1].trim());
      } else if (line.trim()) {
        terms.push(line.trim());
      }
    }
  }

  return terms;
}

/**
 * Extract title options from the OpenAI response
 */
function extractTitleOptions(content) {
  const titles = [];
  const lines = content.split('\n');
  let inTitleSection = false;

  for (const line of lines) {
    if (line.includes('TITLE OPTIONS')) {
      inTitleSection = true;
      continue;
    }
    
    if (inTitleSection) {
      if (line.includes('MUSIC SUGGESTION') || !line.trim()) {
        inTitleSection = false;
        continue;
      }
      
      // Extract numbered or bulleted titles
      const match = line.match(/(?:^|\n)[\d-]*\s*[.)-]*\s*"?([^"]+)"?/);
      if (match && match[1]) {
        titles.push(match[1].trim());
      } else if (line.trim()) {
        titles.push(line.trim());
      }
    }
  }

  return titles;
}

/**
 * Extract music suggestion from the OpenAI response
 */
function extractMusicSuggestion(content) {
  const lines = content.split('\n');
  let inMusicSection = false;
  let musicSuggestion = '';

  for (const line of lines) {
    if (line.includes('MUSIC SUGGESTION')) {
      inMusicSection = true;
      continue;
    }
    
    if (inMusicSection && line.trim()) {
      musicSuggestion += line.trim() + ' ';
    }
  }

  return musicSuggestion.trim();
}