import "dotenv/config"
import * as Eris from "eris"

const bot = new Eris.Client(process.env.TOKEN ? process.env.TOKEN : "")

bot.on("ready", () => {
  console.log("Ready!", bot.user.username + "#" + bot.user.discriminator)
})

bot.on("messageCreate", (msg) => {
  console.log("content", msg.content)
  if (msg.content.toLowerCase() === "!ping") bot.createMessage(msg.channel.id, "pong!")
})

bot.connect()
