import axios from "axios"
import "dotenv/config"
import { Client, Events, GatewayIntentBits, Message } from "discord.js"

const api = "https://www.reddit.com/r/diablo4/hot.json"

const getSubredditIcon = async (subreddit: string) => {
  const icon = await axios
    .get(`https://www.reddit.com/r/${subreddit}/about.json`)
    .then((res) => res.data.data.icon_img)
    .catch((e) => console.log(e))
  return icon
}

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
  if (message.content.toLowerCase() === "!reddit")
    axios
      .get(api)
      .then((res) => {
        res.data.data.children
          .filter((post: any) => post.data.ups > 500)
          .sort((a: any, b: any) => b.data.ups - a.data.ups)
          .slice(0, 1)
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
          }))
          .forEach(
            async ({ title, post_hint, author, permalink, url, ups, subreddit_name_prefixed, subreddit }: any) => {
              const icon = await getSubredditIcon(subreddit)
              message.channel.send({
                embeds: [
                  {
                    title,
                    color: 0xff0000,
                    author: {
                      name: subreddit_name_prefixed,
                      icon_url: icon,
                      url: `https://www.reddit.com/r/diablo4/`,
                    },
                    fields: [
                      { name: "Author", value: `u/${author}`, inline: true },
                      { name: "Upvotes", value: ups, inline: true },
                    ],
                    footer: {
                      text: permalink,
                      icon_url: `https://i.imgur.com/tyOb1Uk.jpeg`,
                    },
                    url: `https://www.reddit.com${permalink}`,
                    image: { url: post_hint === "image" ? url : `https://i.imgur.com/tyOb1Uk.jpeg` },
                  },
                ],
              })
            }
          )
      })
      .catch((e) => console.log(e))
})

async function clearMessages(channel: any) {
  const fetched = await channel.messages.fetch({ limit: 100 })
  if (fetched.size > 0) {
    await channel.bulkDelete(fetched)
    clearMessages(channel)
  }
}

client.on(Events.MessageCreate, (message) => {
  if (message.content.toLowerCase() === "!clear") clearMessages(message.channel)
})

client.login(process.env.TOKEN ? process.env.TOKEN : "")
