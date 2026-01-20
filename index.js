import { Client, GatewayIntentBits } from "discord.js";
import Groq from "groq-sdk";

const ALLOWED_CHANNEL_ID = "1458338484749340744";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  // ❌ Ignore DMs
  if (!message.guild) return;

  // ❌ Ignore bots
  if (message.author.bot) return;

  // ❌ Lock to one channel
  if (message.channel.id !== ALLOWED_CHANNEL_ID) return;

  if (!message.content || message.content.length < 2) return;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "You are a helpful Discord AI bot."
        },
        {
          role: "user",
          content: message.content
        }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content;

    if (!reply) {
      return message.reply("⚠️ AI returned nothing (rare L).");
    }

    await message.reply(reply);
  } catch (err) {
    console.error("GROQ ERROR:", err);
    message.reply("⚠️ Free AI had a skill issue. Try again.");
  }
});

client.login(process.env.DISCORD_TOKEN);
