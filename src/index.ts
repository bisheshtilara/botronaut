import axios from "axios"
import "dotenv/config"
import { Client, Events, GatewayIntentBits, Message } from "discord.js"
import { getRedditPosts } from "./functions"

const api = "https://www.reddit.com/r/diablo4/hot.json"

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
})

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.on(Events.MessageCreate, (message) => {
  if (message.content.toLowerCase() === "!ping") message.reply("pong!")
})

client.on(Events.MessageCreate, (message) => {
  if (message.content.toLowerCase() === "!reddit") getRedditPosts(api, message)
})

client.on(Events.MessageCreate, async (message) => {
  if (message.content.toLowerCase() === "!clear") {
    if (message.channel.type === 0) {
      let fetched
      while ((fetched = await message.channel.messages.fetch({ limit: 100 })).size > 0) {
        await message.channel.bulkDelete(fetched)
      }
    }
  }
})

client.login(process.env.TOKEN ? process.env.TOKEN : "")
