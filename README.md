# GetLogin Mobile Example

This application is an example of interaction with [GetLogin Mobile](https://github.com/GetLoginEth/getlogin-mobile). With it, you can create and retrieve a list of notes stored on the Gnosis Chain blockchain. The contract source code can be found in the web version of this application https://github.com/GetLoginEth/login-example.

The application is authorized using a deeplink and receives a session wallet. With this wallet, the application can interact with the application's smart contract. For example, display a list of notes or create new notes.

# Deploy

`npm ci`

`eas build`

`eas submit --platform android`

`eas submit --platform ios`

---

Try [YumCut](https://yumcut.com)! This is an AI video generator that turns a single prompt into a ready-to-post vertical short video in minutes. It creates the script, images, voice-over, subtitles, and edits everything into a final clip automatically. It’s built for fast testing and making lots of variations without spending hours in an editor.
