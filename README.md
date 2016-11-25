# burgerbot


The BurgerBot is a Slack bot that finds out the current special at honest burger.


## Installation

As simple as installing any other global node package. Be sure to have npm and node (`>= 0.10` version) installed and launch:

```bash
$ npm install -g burgerbot
```


## Running the BurgerBot

To run the BurgerBot you must have an [API token](#getting-the-api-token-for-your-slack-channel) to authenticate the bot on your slack channel. Once you get it (instructions on the next paragraph) you just have to run:


```bash
BOT_API_KEY=somesecretkey burgerbot
```


## Getting the API token for your Slack channel

To allow the BurgerBot to connect your Slack channel you must provide him an API key. To retrieve it you need to add a new Bot in your Slack organisation by visiting the following url: https://*yourorganization*.slack.com/services/new/bot, where *yourorganization* must be substituted with the name of your organization (e.g. https://*loige*.slack.com/services/new/bot). Ensure you are logged to your Slack organisation in your browser and you have the admin rights to add a new bot.

You will find your API key under the field API Token, copy it in a safe place and get ready to use it.


## Configuration

The BurgerBot is configurable through environment variables. There are several variable available:

| Environment variable | Description |
|----------------------|-------------|
| `BOT_API_KEY` | this variable is mandatory and must be used to specify the API token needed by the bot to connect to your Slack organisation |
| `BOT_DB_PATH` | optional variable that allows you to use a different database or to move the default one to a different path |
| `BOT_NAME` | the name of your bot, it’s optional and it will default to burgerbot |


## Launching the bot from source

If you downloaded the source code of the bot you can run it using NPM with:

```bash
$ npm start
```

Don't forget to set your `BOT_API_KEY` environment variable before doing so. Alternatively you can also create a file called `token.js` in the root folder and put your token there (you can use the `token.js.example` file as a reference).


## Bugs and improvements

If you find a bug or have an idea about how to improve the BurgerBot you can [open an issue](https://github.com/alexkilgour/burgerbot/issues) or [submit a pull request](https://github.com/alexkilgour/burgerbot/pulls).

## Thanks

The code for BurgerBot was based on [this article](https://scotch.io/tutorials/building-a-slack-bot-with-node-js-and-chuck-norris-super-powers) by [Scotch.io](https://scotch.io).
