import { Client, GatewayIntentBits } from "discord.js";
import OpenAI from "openai";

const ALLOWED_CHANNEL_ID = "1458338484749340744";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  // ❌ Ignore DMs
  if (!message.guild) return;

  // ❌ Ignore bots
  if (message.author.bot) return;

  // ❌ Only allow one channel
  if (message.channel.id !== ALLOWED_CHANNEL_ID) return;

  // ❌ Ignore empty / tiny messages
  if (!message.content || message.content.length < 2) return;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a helpful Discord AI bot." },
        { role: "user", content: message.content }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content;

    if (!reply) {
      return message.reply("⚠️ AI returned empty response.");
    }

    await message.reply(reply);
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    message.reply("⚠️ AI brain crashed. Check logs.");
  }
});

client.login(process.env.DISCORD_TOKEN);
