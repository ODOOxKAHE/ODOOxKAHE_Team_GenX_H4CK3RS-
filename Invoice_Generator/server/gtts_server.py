"""
gTTS (Google Text-to-Speech) Server
Simple Flask server to provide TTS functionality
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from gtts import gTTS
import io
import base64

app = Flask(__name__)
CORS(app)

# Supported languages for gTTS
GTTS_LANGUAGES = {
    'en': 'English',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'te': 'Telugu',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'or': 'Odia'  # gTTS uses 'or' for Odia
}

@app.route('/api/gtts/speak', methods=['POST'])
def speak():
    """Convert text to speech using gTTS"""
    try:
        data = request.json
        text = data.get('text', '')
        language = data.get('language', 'en')
        
        if not text:
            return jsonify({'success': False, 'error': 'Text is required'}), 400
        
        # Handle language code mapping
        lang_code = language.split('-')[0] if '-' in language else language
        if lang_code == 'od':  # Sarvam uses od-IN, gTTS uses or
            lang_code = 'or'
            
        print(f"🔊 gTTS: Generating speech in {lang_code} for text: {text[:50]}...")
        
        # Generate speech
        tts = gTTS(text=text, lang=lang_code, slow=False)
        
        # Save to bytes buffer
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
        # Convert to base64
        audio_base64 = base64.b64encode(audio_buffer.read()).decode('utf-8')
        
        print(f"✅ gTTS: Audio generated successfully")
        
        return jsonify({
            'success': True,
            'audio': audio_base64,
            'format': 'mp3'
        })
        
    except Exception as e:
        print(f"❌ gTTS Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/gtts/languages', methods=['GET'])
def get_languages():
    """Get list of supported languages"""
    return jsonify({
        'success': True,
        'languages': GTTS_LANGUAGES
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'gTTS Server'})

if __name__ == '__main__':
    print("🎤 Starting gTTS Server on port 3002...")
    print("📋 Supported languages:", list(GTTS_LANGUAGES.keys()))
    app.run(host='0.0.0.0', port=3002, debug=True)
