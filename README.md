# Text improvement app for Enonic XP

This Enonic XP application adds a widget to your [Enonic XP](https://github.com/enonic/xp) site. This widget lets you use ChatGPT to run a simple usertest on your text content.

## Installation
### Build yourself
Build this app with gradle. In the terminal, from the root of the project, enter `./gradlew build`.
On Windows, just enter `gradlew build` in the command line from the project root.
Next, move the JAR file from /build/libs to your `$XP_HOME/deploy` directory.

The **Text improve** app will then be available in the widget panel in the content studio.

If you update package.json, make sure to run `./gradlew npm_install`.

## How to use this app
After adding this app you should see a new Textimprove option in the detail panel to the top right in the content studio.

### Adding API key
The app is dependent on an openai API key to communicate with the ChatGPT api.
Follow the steps below to create and add the API key to the widget:
- Go to the [openai webpage](https://openai.com/)
- Click "log in" to create a free account
- Select API
- Hover over the openai icon to the left to open the usermenu
- Select API keys and create a new key
- Create a config file called `no.bouvet.app.textimprove.cfg`
- Copy the key and add it to the file like so: `apiKey = YOUR KEY HERE`
- Store the config file on the Enonic server

If the server is hosted by Enonic, then they have to add the config file to the server.

### Checking reader expectations
Selecting a content and pressing the **Check reader expectations** button will start the process.
The widget will send the title and preface of the article to ChatGPT and ask for a reader's expectations.
The answer will be displayed in the widget.

### Validating reader expectations
Selecting a content and pressing the **Validate reader expectations** button will start the process.
The widget will send the entire article to ChatGPT and ask if the article fulfills the reader's expectations, based on the title and preface.
The answer will be displayed in the widget.

## Releases and Compatibility

| Version | XP version |
|---------| ------------- |
| 1.0.0   | >=7.9.2 |


## Changelog
### Version 1.0.0
* First launch
