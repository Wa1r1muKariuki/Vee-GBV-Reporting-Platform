# Vee-GBV-Reporting-Platform

Vee is a secure, trauma-informed digital platform designed to bridge the gap in Gender-Based Violence (GBV) reporting in Kenya. It provides survivors with a safe, anonymous channel to report incidents, access verified support services, and contribute to data-driven safety mapping without fear of stigma or retaliation.

## Key Features

- **Hybrid AI Chatbot**: A bilingual (English & Kiswahili) conversational interface powered by Google Gemini LLM and Rasa NLU. It uses trauma-informed scripts to guide survivors through reporting while prioritizing empathy and safety.

- **Secure & Anonymous**: Features AES-256 field-level encryption for sensitive narratives. No personal identifiers are stored, and all data is transmitted via HTTPS.

- **Incident Mapping**: Visualizes verified, anonymized reports on an interactive Mapbox heatmap to help communities and NGOs identify high-risk zones.

- **Smart Referrals**: Uses PostGIS geospatial querying to instantly connect survivors with the nearest verified police stations, hospitals, and legal aid centers.

- **Admin Dashboard**: A secure portal for authorized personnel to verify incoming reports and view aggregated analytics.

## Tech Stack

- **Frontend**: Next.js (React), Tailwind CSS, Mapbox GL JS
- **Backend**: FastAPI (Python), Pydantic
- **Database**: PostgreSQL with PostGIS extension
- **AI/ML**: Google Gemini API, Rasa Open Source (NLU)
- **Security**: Python Cryptography (Fernet/AES)

## System Architecture

The system follows a Three-Layer Architecture:

1. **Presentation Layer**: Next.js handles the responsive, mobile-first UI.
2. **Application Layer**: FastAPI manages the business logic, encrypts data, and orchestrates the hybrid AI workflow (Intent Recognition → Response Generation).
3. **Data Layer**: PostgreSQL stores encrypted reports and geospatial resource data.

## Installation

To set up the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/Wa1r1muKariuki/Vee-GBV-Reporting-Platform.git
cd Vee
```
## 2. Backend Setup

Navigate to the backend directory and set up the Python environment:

```bash
cd backend
python -m venv venv
```
# Activate Virtual Environment:
source venv/bin/activate  # On Mac/Linux
# OR
venv\Scripts\activate     # On Windows

# Install Dependencies
pip install -r requirements.txt

# Run Server
uvicorn app:app --reload


## 3. Frontend Setup

Navigate to the frontend directory and install Node.js dependencies:

```bash
cd ../frontend
npm install
npm run dev
```
## 4. Environment Variables

Create a `.env` file in the backend directory with your API keys:

```env
GEMINI_API_KEY=your_key_here
DATABASE_URL=postgresql://user:password@localhost/vee_db
SECRET_KEY=your_aes_key
```

## Contribution

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
