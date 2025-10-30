from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import io
from agents.report_agent import extract_text_from_file, analyze_report_with_llm

report_bp = Blueprint("report_bp", __name__)

@report_bp.route("/api/report-analyser", methods=["POST"])
def report_analyser():
    try:
        if "report" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        uploaded_file = request.files["report"]

        if uploaded_file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        # Use your provided function to extract text
        # Wrap file in a file-like object
        file_stream = io.BytesIO(uploaded_file.read())
        file_stream.name = secure_filename(uploaded_file.filename)  # Needed for extension detection
        text = extract_text_from_file(file_stream)

        if not text.strip():
            return jsonify({"error": "No text could be extracted from the report"}), 400

        # Analyze text with LLM
        analysis = analyze_report_with_llm(text)

        return jsonify({"analysis": analysis}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500