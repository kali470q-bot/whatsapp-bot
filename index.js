const {
 default: makeWASocket,
 useMultiFileAuthState,
 DisconnectReason
} = require("@whiskeysockets/baileys")

const qrcode = require("qrcode-terminal")
const fs = require("fs")

async function startBot() {

 const { state, saveCreds } =
 await useMultiFileAuthState("session")

 const sock = makeWASocket({
   auth: state
 })

 sock.ev.on("creds.update", saveCreds)

 sock.ev.on("connection.update", (update) => {

   const {
     connection,
     qr,
     lastDisconnect
   } = update

   if (qr) {
     qrcode.generate(qr, {
       small: true
     })
   }

   if (connection === "open") {
     console.log("Bot Connected ✅")
   }

   if (connection === "close") {

     const shouldReconnect =
     lastDisconnect?.error?.output
     ?.statusCode !==
     DisconnectReason.loggedOut

     if (shouldReconnect) {
       startBot()
     }
   }
 })

 sock.ev.on(
 "messages.upsert",
 async ({ messages }) => {

   const msg = messages[0]

   if (!msg.message) return
   if (msg.key.fromMe) return

   const from =
   msg.key.remoteJid

   const text =
   msg.message.conversation ||
   msg.message.extendedTextMessage?.text ||
   ""

   const message =
   text.toLowerCase().trim()

   console.log("Message:", message)

   // HI REPLY
   if (message === "hi") {

     await sock.sendMessage(from, {
       text: "Hello 👋"
     })

     return
   }

   // APK SEND
   if (message === "app") {

     await sock.sendMessage(from, {

       document: fs.readFileSync(
       "/storage/emulated/0/Download/myapp.apk"
       ),

       mimetype:
       "application/vnd.android.package-archive",

       fileName: "MyApp.apk",

       caption:
       "📲 Download Application"

     })

     return
   }

   // DEFAULT REPLY
   await sock.sendMessage(from, {
     text: "🤖 Bot Active"
   })

 })
}

startBot()
