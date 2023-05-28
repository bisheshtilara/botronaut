import axios from "axios"
import { Message } from "discord.js"

const getSubredditIcon = async (subreddit: string) => {
  const icon = await axios
    .get(`https://www.reddit.com/r/${subreddit}/about.json`)
    .then((res) => res.data.data.icon_img)
    .catch((e) => console.log(e))
  return icon
}

export const getRedditPosts = (api: string, message: Message) => {
  return axios
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
        }))
        .forEach(async ({ title, post_hint, author, permalink, url, ups, subreddit_name_prefixed, subreddit }: any) => {
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
        })
    })
    .catch((e) => console.log(e))
}
