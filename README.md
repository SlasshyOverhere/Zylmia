# CineVibe Movie Picker

An interactive, visually stunning movie discovery application with a celestial-themed interface that helps users explore movies by different vibes and genres.

## Features

- **Interactive Visualization**: Explore movies through an animated radial timeline with celestial shader effects
- **Multiple Genres**: Browse movies across various vibes including Hollywood, Bollywood, Horror, Romance, Action, Sci-Fi, and more
- **Detailed Reviews**: Read user reviews with filtering options (Good, Neutral, Bad)
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Performance Optimized**: Efficient loading and rendering for smooth user experience

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

## Installation

1. Clone or download this repository to your local machine
2. Navigate to the project directory:

```bash
cd movie_picker
```

3. Install dependencies:

```bash
npm install
```

or if using yarn:

```bash
yarn install
```

4. Create a `.env` file in the root directory (optional for local development):

```env
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
```

## Configuration

1. Get your free API key from [The Movie Database (TMDb)](https://www.themoviedb.org/settings/api)
2. The app will prompt you for your API key when you first launch it
3. Optionally, you can set the API key in environment variables as shown in the installation section

## Running the Application

To run the application in development mode:

```bash
npm start
```

or with yarn:

```bash
yarn start
```

The application will start on [http://localhost:3000](http://localhost:3000)

## Building for Production

To create a production build:

```bash
npm run build
```

or with yarn:

```bash
yarn build
```

This will create a `build` directory with optimized assets ready for deployment to a web server.

## Deployment

### Deploy to Netlify
1. Build the project with `npm run build`
2. Drag and drop the `build` folder to Netlify

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` from the project directory
3. Follow the prompts to complete deployment

### Deploy to GitHub Pages
1. Update `homepage` in `package.json` to your GitHub Pages URL
2. Run `npm run build`
3. Push the `build` folder to the `gh-pages` branch

## Technology Stack

- **React**: JavaScript library for building user interfaces
- **Three.js**: 3D library for creating the celestial shader effects
- **Framer Motion**: Animation library for smooth transitions
- **Lucide React**: Icon library with consistent design
- **Tailwind CSS**: Utility-first CSS framework for styling

## Security

- API keys are stored locally in the browser's localStorage (not sent to any server)
- All API calls are made directly from the browser to TMDB's servers
- No user data is stored on any backend

## Troubleshooting

### Common Issues:

1. **API Key Not Working**: Ensure your TMDB API key is valid and has the necessary permissions
2. **Images Not Loading**: This is normal for some titles that don't have posters in the TMDB database
3. **Performance Issues**: The 3D shader effects may impact performance on older devices; this is expected

### Getting Help:

If you encounter issues, please:
1. Verify your API key is correct
2. Check browser console for specific error messages
3. Ensure you're using a modern browser with WebGL support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Data provided by [The Movie Database (TMDb)](https://www.themoviedb.org/)
- Icons by [Lucide React](https://lucide.dev/)
- Special thanks to the open-source community for the libraries used in this project