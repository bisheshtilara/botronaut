import axios from "axios"
import "dotenv/config"
import Eris from "eris"

const bot = new Eris.Client(process.env.TOKEN ? process.env.TOKEN : "")
const api = "https://www.reddit.com/r/diablo4/hot.json"

const getSubredditIcon = async (subreddit: string) => {
  const icon = await axios
    .get(`https://www.reddit.com/r/${subreddit}/about.json`)
    .then((res) => res.data.data.icon_img)
    .catch((e) => console.log(e))
  return icon
}

bot.on("ready", () => {
  console.log("Ready!", bot.user.username + "#" + bot.user.discriminator)
})

bot.on("messageCreate", async (msg) => {
  if (msg.content.toLowerCase() === "!reddit")
    axios
      .get(api)
      .then((res) => {
        res.data.data.children
          .filter((post: any) => post.data.ups > 500)
          .sort((a: any, b: any) => b.data.ups - a.data.ups)
          .slice(0, 5)
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
              bot.createMessage(msg.channel.id, {
                embed: {
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
              })
            }
          )
      })
      .catch((e) => console.log(e))
})

bot.on("messageCreate", (msg) => {
  if (msg.content.toLowerCase() === "!guild_id") {
    console.log(msg.guildID)
  }
})

bot.on("messageCreate", (msg) => {
  if (msg.content.toLowerCase() === "!clear") {
    if (!msg.guildID) return
    const channel = bot.getChannel(msg.channel.id) as Eris.TextChannel
    channel.purge({ limit: 100 })
  }
})

bot.on("messageCreate", (msg) => {
  if (msg.content === "!channels") {
    if (!msg.guildID) return
    bot.guilds.get(msg.guildID)?.channels.forEach((channel) => {
      bot.createMessage(msg.channel.id, {
        embed: {
          title: channel.name,
          description: channel.id,
        },
      })
    })
  }
})

bot.connect()
