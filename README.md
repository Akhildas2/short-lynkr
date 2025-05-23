# Lynkr
# 🔗 URL Shortener with QR Code & Analytics

A modern, full-featured URL shortener application that allows users to:
- Shorten long URLs
- Customize short URLs
- Generate QR codes for sharing
- Track usage with real-time statistics and charts

## 🚀 Features

- ✅ Shorten long URLs quickly and easily
- 🎯 Customize short URLs (e.g., `yourdomain.com/my-link`)
- 📱 Generate downloadable QR codes for each short URL
- 📊 View visit statistics with dynamic charts (daily, weekly, monthly)
- 🛡️ Built with performance and security in mind

## 📸 Demo

![Demo Screenshot](./screenshot.png)

## 🛠️ Tech Stack

- **Frontend**: Angular + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **QR Code**: `qrcode` npm package
- **Charts**: Chart.js or Recharts (customizable)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Then edit .env with your DB URI and other secrets

# Run the app
npm run dev
```
🌐 API Endpoints
Method	Endpoint	Description
- POST	/api/shorten	Create short URL
- GET	/api/:shortId	Redirect to long URL
- GET	/api/stats/:id	Get usage statistics

✨ Customization
- Customize QR code styling (color, size)
- Modify URL patterns via configuration
- Switch chart libraries easily via component settings

📈 Statistics Preview
- Unique visitors
- Total clicks
- Click trends over time

📄 License

MIT License

Built with ❤️ by Akhil das p
