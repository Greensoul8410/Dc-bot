import { Client, GatewayIntentBits } from "discord.js";
import OpenAI from "openai";

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

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a helpful Discord AI bot." },
        { role: "user", content: message.content }
      ]
    });

    await message.reply(completion.choices[0].message.content);
  } catch (err) {
    console.error(err);
    message.reply("⚠️ AI brain crashed, try again.");
  }
});

client.login(process.env.DISCORD_TOKEN);
