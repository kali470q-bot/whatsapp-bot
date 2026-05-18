const {
 default: makeWASocket,
 useMultiFileAuthState,
 DisconnectReason
} = require("@whiskeysockets/baileys")

async function startBot() {

 const { state, saveCreds } =
 await useMultiFileAuthState("session")

 const sock = makeWASocket({
   auth: state,
   printQRInTerminal: false
 })

 sock.ev.on("creds.update", saveCreds)

 // Pairing Code
 if (!sock.authState.creds.registered) {

   const phoneNumber =
   "919452814970"

   const code =
   await sock.requestPairingCode(
   phoneNumber
   )

   console.log(
   "\nPAIRING CODE:",
   code
   )
 }

 sock.ev.on(
 "connection.update",
 ({ connection }) => {

   if (connection === "open") {
     console.log("Bot Connected ✅")
   }

   if (connection === "close") {
     startBot()
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

   // HI
   if (message === "hi") {

     await sock.sendMessage(from, {
       text: "Hello 👋"
     })

     return
   }

   // APK SEND
   if (message === "app") {

     const fs = require("fs")

     await sock.sendMessage(from, {

       document:
       fs.readFileSync("./myapp.apk"),

       mimetype:
       "application/vnd.android.package-archive",

       fileName: "MyApp.apk",

       caption:
       "📲 Download Application"

     })

     return
   }

 })

}

startBot()
