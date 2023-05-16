import "dotenv/config"
import Eris from "eris"
import axios from "axios"

const bot = new Eris.Client(process.env.TOKEN ? process.env.TOKEN : "")
const api = "https://www.reddit.com/r/diablo4/hot.json"

bot.on("ready", () => {
  console.log("Ready!", bot.user.username + "#" + bot.user.discriminator)
})

bot.on("messageCreate", (msg) => {
  if (msg.content.toLowerCase() === "!reddit") {
    axios
      .get(api)
      .then((res) => {
        res.data.data.children
          .filter((post: any) => post.data.ups > 100)
          .sort((a: any, b: any) => b.data.ups - a.data.ups)
          .slice(0, 5)
          .map((post: any) => post.data.url)
          .forEach((url: any) => bot.createMessage(msg.channel.id, url))
      })
      .catch((e) => console.log(e))
  }
})

bot.connect()
