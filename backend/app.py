from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS

# Import blueprints
from routes.auth_routes import auth_routes
from routes.user import user_route
from routes.motivation_routes import motivation_route
from routes.image_analysis_routes import image_analysis_bp
from routes.routine_routes import routine_bp
from routes.diagnosis_routes import diagnosis_bp
from routes.dietplan_routes import dietplan_bp
from routes.appointment_routes import appointment_bp
from routes.chatbot_routes import chatbot_bp
from routes.faq_routes import faq_bp
from routes.report_routes import report_bp
from routes.bmi_routes import bmi_bp

import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Allow frontend hosted on Render or localhost to access backend
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:3000",
    "https://med-ai-liard.vercel.app/"
]}})

# Register blueprints
app.register_blueprint(auth_routes)
app.register_blueprint(user_route)
app.register_blueprint(motivation_route)
app.register_blueprint(image_analysis_bp)
app.register_blueprint(routine_bp)
app.register_blueprint(diagnosis_bp)
app.register_blueprint(dietplan_bp)
app.register_blueprint(appointment_bp)
app.register_blueprint(chatbot_bp)
app.register_blueprint(faq_bp)
app.register_blueprint(report_bp)
app.register_blueprint(bmi_bp)


@app.route('/')
def home():
    return "Flask backend deployed successfully on Render and connected to MongoDB Atlas!"


if __name__ == "__main__":
    # Use Render's dynamic port
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)