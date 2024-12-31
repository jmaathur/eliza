# Usage / Setup Notes

Provide the DeepL Auth Key
In your Eliza runtime or environment settings, make sure you have:

```
export DEEPL_AUTH_KEY="abc123-your-api-key-here"
Or set it via runtime.setSetting('DEEPL_AUTH_KEY', 'abc123-your-api-key').
```

Triggering the Translation Action
In conversation or from code, you’d typically do something like:

```
memory.content = {
text: "Good morning",
action: "TRANSLATE_WITH_DEEPL",
sourceLang: "EN",
targetLang: "FR",
};
agent.handleMessage(memory);
```

Or from user input (depending on your system’s logic), a user might request:

```
"Please translate 'What is your name?' from English to Spanish."
And the action builder determines it’s a "TRANSLATE_WITH_DEEPL" action.
```

# Extending the Plugin

Add more advanced DeepL parameters (split_sentences, formality, etc.) to your action and service.
Create separate actions if you also want to handle documents, glossaries, usage, etc.
Adjust code to handle multiple text fields, etc.
