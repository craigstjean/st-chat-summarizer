# Notes

- I tried to let the AI do as much as possible, even if I knew the answer

---

# Claude (Desktop/Web App)

## GoLang Backend (**Claude 3.5 Sonnet**)

[File reference for API](./api.txt)

- Let's start by creating a Golang project that uses Gin to expose APIs. Create an initial project template, with a good project structure, and placeholders for routes.
- Going forward, assume my root package is craigstjean.com/stsummarizer
- Let's implement the models API, which should query Ollama and return a list of model name/models
- Why do I get this build error: internal/services/ollama.go:47:28: models.Model is not a type
- Now let's implement the characters API. I have SillyTavern installed in /home/craig/System/dist/SillyTavern-Launcher, and to implement the characters API we should basically return a directory listing of the folders within /home/craig/System/dist/SillyTavern-Launcher/SillyTavern/data/default-user/chats/
- Let's implement the character chats API now, which should give a directory listing from /home/craig/System/dist/SillyTavern-Launcher/SillyTavern/data/default-user/chats/{character}
- Now let's implement the groups API, which should read each JSON file in /home/craig/System/dist/SillyTavern-Launcher/SillyTavern/data/default-user/groups. keys in the JSON object in the file(s) that we care about are "name", "members" (string array), and "chats" (string array)
- Now let's update the get groups by name API, which should return the file listing in "/home/craig/System/dist/SillyTavern-Launcher/SillyTavern/data/default-user/group chats/{chat}". Note, the files will end in .jsonl, but ".jsonl" should be omitted from the API response
- Now let's implement the group chats API, which should read the file from "/home/craig/System/dist/SillyTavern-Launcher/SillyTavern/data/default-user/group chats/{chat}.jsonl"
- Now, let's implement the /chats/:character/:chat/summary API. This should read the file data in "/home/craig/System/dist/SillyTavern-Launcher/SillyTavern/data/default-user/chats/{character}/{chat}.jsonl". Then it should query the Ollama API for the default model name (which should be in config.go) and ask Ollama to summarize the chat based on the file data
- Now let's implement the group summarize API
- I think I'm missing the implementation of chatsHandler.GetChat
- Update the sillytavern service's GetCharacterChat to return just the string data of the file, not []models.ChatMessages

## Next.js Frontend (**Claude 3.5 Sonnet**)

[File reference for API](./api.txt)

- Let's create a React app for the APIs defined in api.txt, which will be listening on host localhost:8080. To start, just setup the infrastructure for React with Tailwind
- I've never made a react app before, walk me through the basics to get to this point.
    - (Definitely a lie, but since Claude only gave me a single component I wanted to see how it would handle this question)
- Let's remove the model listing from the page, and use a tabbed interface - 1 tab for Characters, one for Group Chats
- Now, if the user clicks a Character, it should list the chats available for that character. If they then click the chat, it should show the chat contents along with a button to Summarize
- Close, but when we summarize the content we are expecting plain text back which should maybe show in a popup (not JSON)
- Let's update group chat to be similar to character chat - if the user clicks a group it should list the chats (which we have already retrieved by the "chats" attribute in JSON from the initial call), and we should display the content with a summarize button.
- The base UI is pretty gross, can we make it prettier?
- Can we make the main shell prettier too?
- The chat summary is in markdown, can we update the popups to render the markdown?

## Next.js Frontend (**Claude 3.5 Sonnet**)

**Note**: This is a new chat from the prior, and I uploaded the ChatApp.js file where we left off. I did this due to the current chat length

- Let's add a settings panel to my screen that has a user textbox (default value "default-user") and a dropdown to select the summarizer LLM model (from /api/models). These should then be added as query parameters to the APIs that generates summaries.
- Why does the Settings popup make the screen flash when I use the dropdown to select a model?
- Minor change, the /api/models will also return a default flag now, and we should set the selected model accordingly
- Summary has an issue, on smaller screens it doesn't allow us to scroll down. Can we fix that?
- The page has a navigation issue, if I refresh then it always goes back to the main page instead of the currently selected character, chat, etc. Can we add routing?
- When I browse, I end up getting navigated to a 404. Do I need to do anything else for this to work?
- Routing is working now, but when I click somewhere to navigate it loads, then flickers as it appears to reload
- When I try to navigate, now it seems the browser gets into an infinite loop?
- Right now, my pages all just return null, and ChatApp.js hardcodes API_BASE_URL. I would like instead to pull API_BASE_URL from .env. How can I update my client component to get this value?
- It doesn't look like ChatApp was updated to accept apiBaseUrl as a prop, or to have fetchAPI inside the component
- Since we've made that change and put {children} back in RootLayout, now the flickering is back when navigating within the app
- Great! It does seem my browser's back button is not working though. Do I need to do anything in addition to the router.replace?
- I don't see the new useEffect, can you generate a new document with just that portion of the code?
- Create a Dockerfile for a production build for this app
- Create a Dockerfile for my golang backend that uses Gin
- Create a docker-compose that runs the web app (directory "web"), the golang backend (directory "api"), and also sets up nginx to sit in front of both
- My backend depends on a data path, how can I symlink it and add the volume to docker-compose?
- I need the docker environment to be able to reach Ollama, running on my host on port 11434 - how can I manage that?
- Write a README.md

---

# JetBrains AI (GoLand/WebStorm)

## GoLang Backend

- (**Claude 3.5 Sonnet**) Let's add an API to get a character's backups. These are in a "backups" directory within the data directory, under the format of "chat_<character>_yyyyMMdd-HHmmss.jsonl" (where character is lower case, and has all non alphanumeric characters replaced with underscore).
- (**Claude 3.5 Sonnet**) Add an API to allow the caller to view the data for a specific backup
- (**GPT-4o**[^1]) Now let's add an API to restore a backup. The process to restore a backups would be to copy the backup file into the chat's directory, though the filename will need changed. If the character's chat directory is empty we should copy the file in the format of "yyyy-M-d \@HHh mm'm' ss's' 000ms.jsonl". If there are existing files, then we need to find the highest number "branch", as exiting files will be in the format "Branch \#<number> - yyyy-MM-dd@HH'h'mm'm'ss's'.jsonl" and we should increment the branch number. If there are no Branch files, we should start at 2.
- (**GPT-4o**[^1]) When we summarize a chat, we need to consider that we might only be able to summarize X (default 4096 - 100 (subtracting for the request for summary text)) about of tokens at a time, and we might only want the summary to be roughly Y (default 400) words. Let's update SummarizeChat to take the new inputs, and join ChatMessages into strings that fit the max tokens. We should then get a summary of each grouping, and then ask Ollama to summarize the joint summaries. Return back the individual summary segments along with the final summary.

[^1]: JetBrains AI for some reason would not generate a response with Claude for this prompt, just stating an error occurred, so I had to switch models.

## Next.js Frontend (**Claude 3.5 Sonnet**)

- For characters (not groups), I want to add a button to list backups. These come from the API as a JSON string array from /api/characters/{character}/backups
- Let's update the listing to extract the date and time and show that instead of the backup name. The backup name is in the format chat_<name>_yyyyMMdd-HHmmss.jsonl. We should also sort our backups from most recent to oldest
- Within the dialog, if the user clicks on one of the backups we should call the API at /characters/:character/backups/:backup and show the markdown rendered response. The dialog should be essentially 2 columns - first column for the backup listing and the 2nd column for the markdown response
- Let's make the backups dialog quite a bit wider. When we are showing a backup, we should also add a scrollbar if there is overflow (and not allow the dialog to grow too tall)
- Now, let's add a button above the backup content called "Restore". If the user clicks it, we should POST to the /characters/:character/backups/:backup/restore API. This returns a JSON object with "message" and "newFileName" - show a flash message stating both values and close the dialog
- The summary API now returns a JSON string array. The final element of that array is the final summary, and everything before it are summary parts. Update the dialog to show the list of parts (final first, followed by 0-n after) and allow the user to click on them to view the relevant summary. The dialog should not be a 2 column dialog with list on the left and summary on the right. Add a "Copy to Clipboard" button above the summary text as well.
- When selectedModel, maxTokens, wordLimit, or username change, let's save those into the browser's local storage. They should also be reloaded when the user comes back.

---

# Cursor

## Next.js Frontend (**Claude 3.5 Sonnet**)

- (Context: ChatApp.js) Let's add a tooltip on the settings dialog by the max tokens label to inform the user that we are assuming their model supports (by default) 4k tokens, however have reduced by 100 to allow for the added instructions asking the model to generate a summary for us.
- (Context: codebase) In ChatApp.js, let's change the Username text box to be a dropdown that comes from the API at /users (which returns a JSON string array). The default value for Username should be "default-user"
- (Context: codebase) The app footer shows after the content, can it be fixed to the bottom of the screen if the content does not extend all the way down?
- (Context: ChatApp.js) I like the loading overlay, but can it be semi transparent and have a spinner?
- (Context: ChatApp.js) Hmm, I still only get a white background when the loading overlay is there. Can it be on top of the existing screen?
- (Context: CharacterSummaryDialog.js) The summary dialog changes height depending on the content, can it instead be fixed to 75% of the screen?

## GoLang Backend

- (Context: codebase) Let's add an API to return back all of the current users. Users are the directories in config.GetSTDataPath() which do not start with an underscore. Return as a JSON string array


