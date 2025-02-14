# Findings

- I used the Claude Desktop/Web app more than the other tools as I was not initially trying to compare different tools

## Tech Stack

- Claude Professional
    - I used neovim to paste and merge code in from Claude
- GoLand with JetBrains AI Pro Trial
- WebStorm with JetBrains AI Pro Trial
- Cursor (Free Plan)
    - I could not test this as much as I wanted because I ran out of ideas to reasonably add to the app ;)
- Cline
    - Will test in the future

## Tool Findings

- Claude (Desktop/Web App)
    - Claude gave me results that were consistent with code that was already generated
    - Eventually, Claude would say it updated a long file but not actually make any changes
    - Some things that Claude gave were clearly out of date, e.g:
        - Using `npx shadcn-ui` instead of `npx shadcn`
        - Older images for Dockerfiles
    - It was very specific with instructions on how to proceed, for example if it generated code depending on a shadcn component that I had not yet added to my project, it would give me the command to execute
- JetBrains AI
    - Claude would sometimes give an error and not generate a response, causing me to switch models
    - It did not do a great job of understanding my current project and staying consistent, for example:
        - It tried to pull in radix instead of sticking with shadcn (even though it rightly saw I had a button component from shadcn)
        - It created the character backup button component in its own file (which is preferable, but not consistent with the rest of the project)
        - It tried to use the standard fetch API instead of the custom fetchAPI function
        - It did not include the query parameters for user
        - Sometimes it would suggest putting code in the wrong file
    - The input box for the prompt did not seem to allow shift+enter to create a new line, which was **very** annoying
    - JetBrains has icons to create a file from the snippet, or to insert the generated text from your carrot, which was convenient, however it was **nothing** compared to Cursor
    - The hyperlinks to your files in the response was convenient, but buggy:
        - Sometimes it just wouldn't hyperlink at all (e.g. when referencing sillytavern.go)
        - Sometimes, it would open the wrong file, e.g.:
            - `main` would open `/usr/lib/go/src/cmd/vendor/github.com/google/pprof/internal/driver/html/common.js`
            - `main.go` would open `/home/craig/go/pkg/mod/github.com/go-playground/universal-translator@v0.18.1/_examples/full-with-files/main.go`
    - Chat history was not retained between launches of the IDE
- Cursor (Free Plan)
    - I installed `aur/cursor-bin` (yes, I use Arch), however was not actually able to log in...
        - Login would open Chrome and allow me to log in, after logging into Google and clicking the button to continue to Cursor, nothing would happen...
        - Same result in Chrome and Firefox, and then even on my Mac
        - **Solution**: Use the AppImage from the website instead
    - Cursor stayed reasonably consistent with my project, including using shadcn
        - However, it did not take into account that there were components from shadcn that I needed to add first. Though, this may have been because I kept the context to the current file instead of the entire project for this prompt.
    - Cursor has the **BEST** DX (developer experience) with:
        - Its ability to search your codebase for relevant files,
        - The ability to merge changes into your code base with a visual diff
    - Cursor had some strange inconsistencies:
        - Initially, the `ctrl+p` shortcut worked as expected even though I had Vim mode on
            - Shortly after, for some reason it stopped working
            - I resolved by deleting the vim `ctrl+p` shortcut in Preferences

## Model Findings

- Claude 3.5 Sonnet vs GPT-4o
    - My intention was to test everything with Claude, however JetBrains AI forced me to switch to GTP-4o in some cases
    - GPT-4o was more verbose in explaining its process and next steps
    - GPT-4o was worse at keeping consistency with the project
    - GPT-4o was more likely to also proactively give me instructions on how to text the code

