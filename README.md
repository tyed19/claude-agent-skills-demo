# Take-Home Test from Anthropic | Tye Davis
The greatest technical marketing take home demo ever for my friends at Anthropic :) 

## Narrative Choice Explained

A simple demo showing how to use Claude as an agent by combining the Messages API, Skills, code execution and the Files API.

The goal was to create a real workflow, giving a sale rep instant competitive insight, and turn it into a usable artifact (a downloadable PDF battlecard).

## What I am demonstrating

My goal was to show how to move beyond prompt-based interactions and build a system where Claude:

- dynamically loads capabilities through Skills
- executes a workflow using code execution
- generate a real artifact (PDF)
- returns that artificat to the user

Instead of just generating text, Claude completes a task end-to-end, and in this case getting a rep a tangible asset to discuss or pass along to a prospect to help win an opportunity. 

## How it works

At a high level:

1. The user selects a competitor and clicks "Generate Battlecard"
2. The frontend sends that context to a backend API route
3. The backend calls Claude using the Anthropic SDK
4. A PDF Skill is attached to the request
5. Code execution is enabled so Claude can generate a file
6. Claude returns a "file_id"
7. The backend uses the Files API to download the PDF
8. The file is saved locally and returned to the UI for download

## Architecture 

Four components were used to build this demo:

- **Messages API:** runtime (Claude acts as the agent)
- **Skills:** capability layer (PDF Generation)
- **Code execution:** action layer (creates the file)
- **Files API:** delivery layer (returns the artifact)

Summarized:

- SDK = interface
- Messages API = runtime
- Skills = capability
- Code execution = execution
- Files API = delivery
