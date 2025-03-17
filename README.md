<p align="center">
  <img src="public/icon.png" alt="JobRefMe Logo" width="128" height="128">
</p>

# JobRefMe Chrome Extension

A Chrome extension that generates personalized referral request messages for HireJobs.in job postings using Google's Gemini AI.

## Features

- **Automatic Detection**: Automatically detects when you're on a HireJobs job posting page
- **AI-Powered Generation**: Uses Google's Gemini AI to create tailored referral messages
- **Relevant Skills Highlighting**: Identifies and emphasizes skills from the job posting that match your profile
- **One-Click Copy**: Easily copy the generated message with one click
- **Personalized Messages**: Each message is customized to the specific job and company

## Requirements

- **Google Gemini API Key**: You'll need to provide your own Gemini API key to use this extension. You can get one from [Google AI Studio](https://ai.google.dev/).

## Installation

### Development Mode

1. Clone this repository:
   ```bash
   git clone https://github.com/Prathmesh-Dhatrak/jobrefme-extension.git
   cd jobrefme-extension
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Build the extension:
   ```bash
   yarn build
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the `dist` folder from the project

### Production Use

1. Download the latest `.zip` file from the Releases page
2. Extract the zip file
3. Follow the same steps as above to load the extension in Chrome

## Initial Setup

When you first install the extension:

1. A welcome page will open automatically
2. Enter your Google Gemini API key in the form
3. Click "Save API Key" to store it securely

You can update your API key at any time through the extension's options page:
- Right-click on the JobRefMe icon in your browser toolbar
- Select "Options" from the menu
- Enter your new API key and save

## Usage

1. Navigate to a job posting on HireJobs.in (e.g., https://hirejobs.in/jobs/abc123)
2. Click on the JobRefMe extension icon in your browser toolbar
3. Click the "Generate Referral Request" button
4. Wait a few seconds while the AI generates your personalized message
5. Once generated, click "Copy" to copy the message to your clipboard
6. Use the message in your emails or messages to request a referral

## How It Works

JobRefMe extracts key information from the job posting, including:
- Job title
- Company name
- Required skills and qualifications
- Job description

It then uses Google's Gemini AI to craft a personalized referral request message that highlights your relevant skills and experience, making it easier for connections to refer you for the position.

## Technologies Used

- React 18
- TypeScript
- Tailwind CSS 4
- Chrome Extension Manifest V3
- Google Gemini AI
- Vite + CRXJS plugin

## Development

Start the development server:

```bash
yarn dev
```

Run linting:

```bash
yarn lint
```

Build for production:

```bash
yarn build
```

## Architecture

- **Components**: Reusable UI components in `src/components/`
- **Contexts**: Global state management in `src/contexts/`
- **Hooks**: Custom React hooks in `src/hooks/`
- **Services**: API interactions in `src/services/`
- **Utils**: Helper functions in `src/utils/`
- **Pages**: Full page components for welcome and options screens

## Privacy

- Your Gemini API key is stored only in your browser's local storage
- No personal data is collected or sent to our servers
- API requests are made directly to our backend, which forwards them to Google's Gemini API using your key

## License

MIT