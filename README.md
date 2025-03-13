<p align="center">
  <img src="public/icon.png" alt="JobRefMe Logo" width="128" height="128">
</p>

# JobRefMe Chrome Extension

A Chrome extension that generates personalized reference request messages for HireJobs.in job postings.

## Features

- **Automatic Detection**: Automatically detects when you're on a HireJobs job posting page
- **One-Click Generation**: Generate a reference request with a single click
- **Smart Templates**: Creates personalized messages that highlight relevant skills for each job
- **Copy to Clipboard**: Easily copy the generated message with one click

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

## Usage

1. Navigate to a job posting on HireJobs.in (e.g., https://hirejobs.in/jobs/abc123)
2. Click on the JobRefMe extension icon in your browser toolbar
3. Click the "Generate Reference Request" button
4. Once the message is generated, click "Copy" to copy it to your clipboard
5. Use the message in your emails or messages to request a referral

## Technologies Used

- React
- TypeScript
- Tailwind CSS 4
- Chrome Extension Manifest V3
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

## License

MIT
