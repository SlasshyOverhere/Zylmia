# Zylmia Movie Discovery

<div align="center">
  <h1>🌌 Zylmia Movie Discovery 🎬</h1>
  <p><b>An immersive, visually stunning movie discovery experience</b></p>
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
  [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
  
</div>

<div align="center">
  <sub>Built with ❤️ and ☕ |
  <i>Fully vibecoded with 0 manual code write/read</i>
</sub>
</div>

---

## 🌟 Overview

**Zylmia** is a cutting-edge, celestial-themed movie discovery application that transforms the way users explore and discover movies. With its stunning 3D visuals, interactive radial timeline, and intuitive filtering system, Zylmia provides an immersive cinematic journey like no other.

<div align="center">
  <img src="https://github.com/SlasshyOverhere/Zylmia/raw/main/zylmia.jpg" alt="Zylmia UI Screenshot" />
  <br />
  <i>Real screenshot: orbital genre system in action</i>
</div>

## ✨ Features

### 🎨 Visual Experience
- **3D Shader Effects**: Celestial orbs with dynamic lighting and atmospheric effects
- **Interactive Radial Timeline**: Explore genres through an orbital navigation system
- **Animated Transitions**: Smooth, polished animations powered by Framer Motion
- **Responsive Design**: Seamless experience across all devices

### 🎬 Discovery System
- **Multiple Vibes**: Browse Hollywood, Bollywood, Horror, Romance, Action, Sci-Fi, Comedy, Drama, and more
- **Smart Filtering**: Advanced review filtering by rating (Good/Neutral/Bad)
- **Top-Rated Focus**: Curated lists of highest-rated films in each category
- **Detailed Reviews**: Comprehensive user reviews with sentiment analysis

### 🔐 Security Features
- **Environment Variable API Keys**: Secure TMDB API integration via environment variables
- **Password Protection**: Optional password authentication using SHA256 hashing
- **Local Storage**: Secure client-side storage for API keys

## 🛠️ Tech Stack

- **[React](https://reactjs.org/)** - JavaScript library for building user interfaces
- **[Three.js](https://threejs.org/)** - 3D library for creating celestial shader effects
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready motion library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful, consistent icon library
- **[Crypto-JS](https://github.com/brix/crypto-js)** - Cryptographic algorithms for security

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/zylmia-movie-discovery.git
   cd zylmia-movie-discovery
   ```
2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Create environment variables** (optional but recommended)
   ```env
   # TMDB API Key - required for the application to work
   REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
   # Password hash for authentication (optional - leave empty to disable password protection)
   # Generate using: node generate_password_hash.js your_password
   REACT_APP_PASSWORD_HASH=
   # Feature flags - set to true or false to enable/disable features
   # Password protection - if true, requires password before API key entry
   REACT_APP_PASSWORD_PROTECTION=false
   # ENV API - if true, uses API key from environment variable; if false, prompts user
   REACT_APP_ENV_API=false
   ```

### Configuration

1. **Get a free TMDB API key** from [The Movie Database (TMDb)](https://www.themoviedb.org/settings/api)
2. **Set your API key** in the `.env` file or enter it in the app on first launch
3. **(Optional) Enable password protection:**
   - Generate a hash: `node generate_password_hash.js your_password`
   - Add to `.env`: `REACT_APP_PASSWORD_HASH=generated_hash_here`

### Running the Application

```bash
npm start
```
or
```bash
yarn start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🔐 Security Features

### API Key Storage
- **Environment Variables**: Set `REACT_APP_TMDB_API_KEY` in your `.env` file
- **Priority System**: Environment variable > localStorage > user input
- **Automatic Detection**: App prioritizes environment variables when available

### Feature Flags
The application includes configurable features through environment variables:

#### Password Protection
- **Variable**: `REACT_APP_PASSWORD_PROTECTION=true/false`
- **Default**: `false`
- **Description**: When `true`, requires password before API key entry
- **Implementation**:
  1. Generate a password hash: `node generate_password_hash.js your_password`
  2. Add to `.env`: `REACT_APP_PASSWORD_HASH=generated_hash_here`
  3. Set `REACT_APP_PASSWORD_PROTECTION=true` to enable
  4. If disabled or no hash is set, password protection is bypassed

#### ENV API Usage
- **Variable**: `REACT_APP_ENV_API=true/false`
- **Default**: `false`
- **Description**: When `true`, uses API key from environment variable only; when `false`, prompts user for API key
- **Implementation**:
  1. Set `REACT_APP_ENV_API=true` to enforce environment variable usage
  2. Set `REACT_APP_TMDB_API_KEY=your_key_here` for the API key
  3. When enabled, the app will auto-authenticate with the environment key
  4. When disabled, users will be prompted to enter their API key

### SHA256 Hashing
- Uses CryptoJS library for secure client-side hashing
- Passwords never stored in plain text
- Authentication status stored in localStorage after validation

## 📦 Building for Production

```bash
npm run build
```
or
```bash
yarn build
```

This creates an optimized `build` directory ready for deployment.

## 🚀 Deployment

### Deploy to Netlify
1. Build the project: `npm run build`
2. Drag and drop the `build` folder to Netlify dashboard

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` from project directory
3. Follow prompts for configuration

### Deploy to GitHub Pages
1. Update `homepage` in `package.json` to your GitHub Pages URL
2. Run `npm run build`
3. Push the `build` folder to the `gh-pages` branch

## 🎯 Usage

1. **Select a Vibe**: Choose from the radial timeline of movie genres
2. **Explore**: View top-rated movies in your selected category
3. **Discover**: Click on any movie to see detailed information and reviews
4. **Filter**: Use sentiment filters to find reviews that match your preferences
5. **Refresh**: Get new content with the "Refresh Content" button

## 🛡️ Security Notes
- All API calls are made directly from browser to TMDB's servers
- No user data is stored on external backends
- LocalStorage is used only for API keys and preferences
- Passwords are SHA256 hashed before validation

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit** (`git commit -m 'Add amazing feature'`)
5. **Push to branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

## 🐛 Troubleshooting

### Common Issues
- **API Key Not Working**: Verify your TMDB API key has necessary permissions
- **Images Not Loading**: Some titles may not have posters in TMDB database
- **Performance Issues**: 3D effects may impact performance on older devices
- **Port Already in Use**: Try `npm start -- --port 3001` for alternative port

### Getting Help
1. Check browser console for specific error messages
2. Ensure you're using a modern browser with WebGL support
3. Verify your API key is correctly set in environment variables

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments
- **Data provided by** [The Movie Database (TMDb)](https://www.themoviedb.org/)
- **Icons by** [Lucide React](https://lucide.dev/)
- **Inspiration from** the creative coding community

<div align="center">
  <h3>💫 Enjoy your cosmic movie journey with Zylmia! 🌠</h3>
  <p><i>Fully vibecoded with 0 manual code write/read</i></p>
</div>
