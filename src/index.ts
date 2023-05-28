import { Client, Events, GatewayIntentBits } from "discord.js"
import "dotenv/config"
import { getRedditPosts } from "./functions"
import axios from "axios"

const api = "https://www.reddit.com/r/diablo4/hot.json"

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
  ],
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
  if (message.content.toLowerCase() === "!clear")
    if (message.channel.type === 0) {
      let fetched
      while ((fetched = await message.channel.messages.fetch({ limit: 100 })).size > 0) {
        await message.channel.bulkDelete(fetched)
      }
    }
})

//function to create a post in forum channel
client.on(Events.MessageCreate, async (message) => {
  if (message.content.toLowerCase() === "!post") {
    const channel = client.channels.cache.get("1112184361232642048")
    if (channel?.type === 15)
      axios
        .get(api)
        .then((res) => {
          res.data.data.children

            .filter((post: any) => post.data.ups > 500)
            .sort((a: any, b: any) => b.data.ups - a.data.ups)
            .slice(0, 10)
            .map((post: any) => ({
              title: post.data.title,
              post_hint: post.data.post_hint,
              author: post.data.author,
              ups: post.data.ups,
              downs: post.data.downs,
              permalink: post.data.permalink,
              url: post.data.url,
              subreddit_name_prefixed: post.data.subreddit_name_prefixed,
              subreddit: post.data.subreddit,
              content: post.data.selftext,
            }))
            .forEach(
              async ({
                title,
                post_hint,
                author,
                permalink,
                url,
                ups,
                subreddit_name_prefixed,
                subreddit,
                content,
              }: any) => {
                channel?.threads.create({
                  name: title,
                  message: {
                    content: `${content} \n <https://www.reddit.com${permalink}>`,
                    files: [post_hint === "image" ? url  : "https://i.imgur.com/tyOb1Uk.jpeg"],
                  },
                })
              }
            )
        })
        .catch((e) => console.log(e))
  }
})

client.login(process.env.TOKEN ? process.env.TOKEN : "")

// reddit-posts-forum-bot-testing 1110482531356250132
// bot-testing-forum-public 1112184361232642048
