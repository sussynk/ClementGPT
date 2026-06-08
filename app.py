import os
import uuid
from flask import Flask, render_template, request, jsonify, make_response
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Phase 1 — fail fast if the API key is missing or invalid
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    raise SystemExit(
        "\n[ERROR] GEMINI_API_KEY is not set.\n"
        "Copy .env.example to .env and add your key.\n"
        "Get one free at: https://aistudio.google.com/app/apikey\n"
    )

app = Flask(__name__)

client = genai.Client()

# Validate the key is real by making a cheap test call at startup
try:
    client.models.generate_content(
        model='gemini-2.5-flash',
        contents='ping',
        config=types.GenerateContentConfig(max_output_tokens=1),
    )
except Exception as e:
    raise SystemExit(f"\n[ERROR] GEMINI_API_KEY is invalid or rejected by the API.\nDetails: {e}\n")

SYSTEM_INSTRUCTION = "You are ClementGPT, a helpful and precise AI assistant."

ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain', 'text/html', 'text/css', 'text/javascript',
    'application/json',
}

# Server-side session store: {session_id: {chats: {id: {title, messages}}, active_chat_id}}
_sessions = {}


def _get_sid():
    return request.cookies.get('session_id')


def _get_or_create_session():
    sid = _get_sid()
    if sid and sid in _sessions:
        return sid, _sessions[sid]
    sid = str(uuid.uuid4())
    _sessions[sid] = {'chats': {}, 'active_chat_id': None}
    return sid, _sessions[sid]


def _set_sid_cookie(response, sid):
    response.set_cookie('session_id', sid, httponly=True, samesite='Lax')
    return response


@app.route('/')
def home():
    sid, _ = _get_or_create_session()
    resp = make_response(render_template('index.html'))
    return _set_sid_cookie(resp, sid)


@app.route('/api/chats', methods=['GET'])
def get_chats():
    sid = _get_sid()
    if not sid or sid not in _sessions:
        return jsonify({'chats': [], 'active_chat_id': None})
    data = _sessions[sid]
    chats_list = [
        {'id': k, 'title': v['title']}
        for k, v in data['chats'].items()
    ]
    return jsonify({'chats': chats_list, 'active_chat_id': data['active_chat_id']})


@app.route('/api/chats', methods=['POST'])
def new_chat():
    sid, data = _get_or_create_session()
    chat_id = str(uuid.uuid4())
    data['chats'][chat_id] = {'title': 'New Chat', 'messages': []}
    data['active_chat_id'] = chat_id
    resp = jsonify({'chat_id': chat_id})
    return _set_sid_cookie(resp, sid)


@app.route('/api/chats/<chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    sid = _get_sid()
    if not sid or sid not in _sessions:
        return jsonify({'error': 'No session'}), 400
    data = _sessions[sid]
    data['chats'].pop(chat_id, None)
    if data['active_chat_id'] == chat_id:
        remaining = list(data['chats'].keys())
        data['active_chat_id'] = remaining[-1] if remaining else None
    return jsonify({'ok': True, 'active_chat_id': data['active_chat_id']})


@app.route('/api/chats/<chat_id>/switch', methods=['POST'])
def switch_chat(chat_id):
    sid = _get_sid()
    if not sid or sid not in _sessions:
        return jsonify({'error': 'No session'}), 400
    data = _sessions[sid]
    if chat_id not in data['chats']:
        return jsonify({'error': 'Chat not found'}), 404
    data['active_chat_id'] = chat_id
    messages = data['chats'][chat_id]['messages']
    return jsonify({'messages': messages})


@app.route('/chat', methods=['POST'])
def chat():
    sid, data = _get_or_create_session()

    # Get or create the active chat
    chat_id = data.get('active_chat_id')
    if not chat_id or chat_id not in data['chats']:
        chat_id = str(uuid.uuid4())
        data['chats'][chat_id] = {'title': 'New Chat', 'messages': []}
        data['active_chat_id'] = chat_id

    current_chat = data['chats'][chat_id]

    # Parse request — multipart for file uploads, JSON otherwise
    parts = []
    user_text = ''

    if request.content_type and 'multipart/form-data' in request.content_type:
        user_text = request.form.get('message', '').strip()
        uploaded = request.files.get('file')
        if uploaded and uploaded.filename:
            mime = uploaded.content_type
            if mime not in ALLOWED_MIME_TYPES:
                return jsonify({'error': f'Unsupported file type: {mime}'}), 400
            file_bytes = uploaded.read()
            if len(file_bytes) > 10 * 1024 * 1024:
                return jsonify({'error': 'File too large (max 10 MB)'}), 400
            parts.append(types.Part.from_bytes(data=file_bytes, mime_type=mime))
    else:
        body = request.get_json(silent=True) or {}
        user_text = body.get('message', '').strip()

    if not user_text and not parts:
        return jsonify({'error': 'Empty message'}), 400

    if user_text:
        parts.append(types.Part.from_text(text=user_text))

    # Set title from first user message
    if not current_chat['messages'] and user_text:
        current_chat['title'] = user_text[:50]

    current_chat['messages'].append({'role': 'user', 'content': user_text})

    # Build full conversation history for Gemini
    gemini_contents = []
    for msg in current_chat['messages'][:-1]:
        role = 'user' if msg['role'] == 'user' else 'model'
        gemini_contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=msg['content'])])
        )
    # Current turn (may include file parts)
    gemini_contents.append(types.Content(role='user', parts=parts))

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=gemini_contents,
            config=types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTION),
        )
        bot_response = response.text
        current_chat['messages'].append({'role': 'model', 'content': bot_response})

        resp = jsonify({
            'response': bot_response,
            'chat_id': chat_id,
            'chat_title': current_chat['title'],
        })
        return _set_sid_cookie(resp, sid)

    except Exception as e:
        print(f"Gemini API error: {e}")
        return jsonify({'error': 'Failed to get a response from the AI.'}), 500


if __name__ == '__main__':
    app.run(debug=True)
