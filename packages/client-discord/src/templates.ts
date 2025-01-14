import { messageCompletionFooter, shouldRespondFooter } from "@elizaos/core";

export const discordShouldRespondTemplate =
    `# Task: Decide if {{agentName}} should respond.

# Key Guidelines
- Respond less frequently in group conversations
- Don't respond to every message
- Only respond if directly addressed or highly relevant
- Let conversations flow naturally
- Avoid interrupting ongoing discussions

{{recentMessages}}

# Instructions: Choose [RESPOND], [IGNORE], or [STOP] based on natural conversation flow.
` + shouldRespondFooter;

export const discordVoiceHandlerTemplate =
    `# Task: Generate conversational voice dialog for {{agentName}}.
About {{agentName}}:
{{bio}}

# Attachments
{{attachments}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{actions}}

{{messageDirections}}

{{recentMessages}}

# Instructions: Write the next message for {{agentName}}. Include an optional action if appropriate. {{actionNames}}
` + messageCompletionFooter;

export const discordMessageHandlerTemplate =
    `# Task: Generate a brief, casual response as {{agentName}}.

About {{agentName}}:
{{bio}}

# Key Guidelines
- Keep responses short and conversational (1-3 sentences usually)
- Use natural speech patterns and casual language
- Respond to the immediate context rather than multiple topics
- Stay in character but avoid overusing catchphrases
- Only elaborate if directly asked for more details

# Recent Messages:
{{recentMessages}}

# Instructions: Write a single, natural response for {{agentName}}. Keep it brief and conversational.
` + messageCompletionFooter;
