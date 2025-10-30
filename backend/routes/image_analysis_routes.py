from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from agents.image_agent import analyze_tablet_image

image_analysis_bp = Blueprint('image_analysis_bp', __name__)

@image_analysis_bp.route('/api/image-analyser', methods=['POST'])
def image_analyser():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files['image']
    if image.filename == '':
        return jsonify({"error": "No selected image"}), 400

    filename = secure_filename(image.filename)
    save_path = os.path.join("uploads", filename)
    os.makedirs("uploads", exist_ok=True)
    image.save(save_path)

    result = analyze_tablet_image(save_path)
    return jsonify({"description": result})
