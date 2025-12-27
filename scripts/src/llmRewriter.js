require('dotenv').config();
const axios = require('axios');

// Uses Groq LLM to rewrite an article based on competitor analysis
async function rewriteArticleWithLLM(originalArticle, competitorArticles) {
  console.log('🤖 Calling Groq AI to rewrite article...');

  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    console.log('⚠️  No API key found, using demo mode');
    return generateDemoRewrite(originalArticle, competitorArticles);
  }

  try {
    const competitorContext = competitorArticles
      .map(
        (article, index) =>
          `\n--- Competitor Article ${index + 1}: "${article.title}" ---\n${article.content.substring(0, 1000)}`
      )
      .join('\n\n');

    const prompt = `
You are a professional content writer and SEO expert.

OUTPUT RULES (MANDATORY):
- Output ONLY valid JSON
- NO markdown
- NO explanations
- NO text before or after JSON
- Start with { and end with }

JSON SCHEMA:
{
  "title": "string",
  "content": "string"
}

ORIGINAL ARTICLE:
Title: "${originalArticle.title}"
Content:
${originalArticle.content}

TOP-RANKING COMPETITOR ARTICLES:
${competitorContext}
`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You must respond with VALID JSON ONLY. No markdown. No explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 4000
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const rawContent = response.data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error('Empty response from Groq');
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent.trim());
    } catch (err) {
      console.log('⚠️  Invalid JSON from LLM, using demo mode');
      return generateDemoRewrite(originalArticle, competitorArticles);
    }

    console.log('✅ Article rewritten successfully');

    return {
      title: parsed.title || originalArticle.title,
      content: parsed.content,
      original_article_id: originalArticle.id,
      references: competitorArticles.map(article => ({
        title: article.title,
        url: article.source_url
      })),
      is_generated: true,
      source_type: 'llm_generated'
    };
  } catch (error) {
    console.log(`⚠️  LLM error: ${error.message}. Using demo mode`);
    return generateDemoRewrite(originalArticle, competitorArticles);
  }
}

// Creates a basic enhanced version when LLM isn't available
function generateDemoRewrite(originalArticle, competitorArticles) {
  console.log('📝 Generating demo rewrite...');

  let enhancedContent = `## Introduction\n\n${originalArticle.content.substring(
    0,
    300
  )}\n\n`;

  competitorArticles.forEach(article => {
    enhancedContent += `## Insights from Industry Leaders\n\n`;
    enhancedContent += article.content.substring(0, 400) + '\n\n';
  });

  enhancedContent += `## Conclusion\n\nThis article combines key ideas from top-ranking sources to present a clearer and more comprehensive understanding of the topic.\n\n`;

  enhancedContent += `## References\n\n`;
  competitorArticles.forEach((article, index) => {
    enhancedContent += `${index + 1}. [${article.title}](${article.source_url})\n`;
  });

  return {
    title: `[Updated] ${originalArticle.title}`,
    content: enhancedContent,
    original_article_id: originalArticle.id,
    references: competitorArticles.map(article => ({
      title: article.title,
      url: article.source_url
    })),
    is_generated: true,
    source_type: 'llm_generated'
  };
}

module.exports = rewriteArticleWithLLM;
